import { tool } from "ai";
import { z } from "zod";
import { getMongoClient } from "@/lib/db/mongo";

const MAX_DOCUMENTS = 50;
const QUERY_TIMEOUT_MS = 10_000;

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const queryMongo = tool({
  description:
    "Query a MongoDB database. Supports 'find' for simple lookups and 'aggregate' for advanced queries (grouping, counting, joins). Read-only — no inserts, updates, or deletes.",
  inputSchema: z.object({
    collection: z.string().describe("Name of the MongoDB collection to query"),
    operation: z
      .enum(["find", "aggregate"])
      .describe("'find' for simple queries, 'aggregate' for pipelines"),
    filter: z
      .string()
      .describe(
        "For find: JSON filter object (e.g. '{\"status\":\"active\"}'). For aggregate: JSON array pipeline (e.g. '[{\"$match\":{\"status\":\"active\"}},{\"$group\":{\"_id\":\"$category\",\"count\":{\"$sum\":1}}}]')",
      ),
    projection: z
      .string()
      .describe(
        "JSON object specifying fields to include/exclude (e.g. '{\"name\":1,\"email\":1,\"_id\":0}'). Only used with find.",
      )
      .optional(),
    sort: z
      .string()
      .describe(
        "JSON object for sort order (e.g. '{\"createdAt\":-1}'). Only used with find.",
      )
      .optional(),
    limit: z
      .number()
      .min(1)
      .max(MAX_DOCUMENTS)
      .describe(`Max documents to return (1-${MAX_DOCUMENTS}, default 10)`)
      .optional(),
  }),
  needsApproval: true,
  execute: async (input) => {
    const { collection: collectionName, operation, filter: filterStr } = input;
    const limit = Math.min(input.limit ?? 10, MAX_DOCUMENTS);

    const parsedFilter = parseJson(filterStr);
    if (parsedFilter === null) {
      return { error: "Invalid JSON in filter parameter" };
    }

    try {
      const client = getMongoClient();
      const db = client.db();
      const collection = db.collection(collectionName);

      const abortController = new AbortController();
      const timeout = setTimeout(
        () => abortController.abort(),
        QUERY_TIMEOUT_MS,
      );

      let results: unknown[];

      try {
        if (operation === "find") {
          const filterObj =
            typeof parsedFilter === "object" && !Array.isArray(parsedFilter)
              ? (parsedFilter as Record<string, unknown>)
              : {};

          const projection = input.projection
            ? (parseJson(input.projection) as Record<string, unknown>) ?? {}
            : {};
          const sort = input.sort
            ? (parseJson(input.sort) as Record<string, unknown>) ?? {}
            : {};

          results = await collection
            .find(filterObj, {
              projection,
              sort: sort as import("mongodb").Sort,
              limit,
              signal: abortController.signal,
            })
            .toArray();
        } else {
          const pipeline = Array.isArray(parsedFilter) ? parsedFilter : [];
          const pipelineWithLimit = [...pipeline, { $limit: limit }];

          results = await collection
            .aggregate(pipelineWithLimit, {
              signal: abortController.signal,
            })
            .toArray();
        }
      } finally {
        clearTimeout(timeout);
      }

      return {
        collection: collectionName,
        operation,
        count: results.length,
        results,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { error: "Query timed out after 10 seconds" };
      }
      return {
        error: `Query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
