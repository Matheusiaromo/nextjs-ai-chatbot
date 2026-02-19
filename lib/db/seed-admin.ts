import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { user } from "./schema";

config({ path: ".env.local" });

const email = process.argv.at(2);

if (!email) {
  console.error("Usage: npx tsx lib/db/seed-admin.ts <email>");
  process.exit(1);
}

async function run() {
  // biome-ignore lint: Forbidden non-null assertion.
  const client = postgres(process.env.POSTGRES_URL!);
  const db = drizzle(client);

  const [updated] = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email as string))
    .returning({ id: user.id, email: user.email, role: user.role });

  if (updated) {
    console.log(`User ${updated.email} is now admin (id: ${updated.id})`);
  } else {
    console.error(`User with email "${email}" not found`);
  }

  await client.end();
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
