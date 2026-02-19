import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

export function getMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
    });
  }

  return client;
}
