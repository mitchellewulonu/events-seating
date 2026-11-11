import { neon } from "@neondatabase/serverless";

export function getSql() {
  const connectionString = process.env.SEATING_DB_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("SEATING_DB_CONNECTION_STRING is not set");
  }
  return neon(connectionString);
}
