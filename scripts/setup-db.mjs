import { neon } from "@neondatabase/serverless";

const connectionString = process.env.SEATING_DB_CONNECTION_STRING;
if (!connectionString) {
  console.error("SEATING_DB_CONNECTION_STRING is missing. Run: stripe projects env --pull");
  process.exit(1);
}

const sql = neon(connectionString);

const tables = [
  { number: 1, label: "Garden Olive" },
  { number: 2, label: "Candlewick" },
  { number: 3, label: "River Birch" },
  { number: 4, label: "Evening Jasmine" },
  { number: 5, label: "Harbor Light" },
];

const guestsByTable = {
  1: ["Ava Chen", "Marcus Webb", "Priya Nair", "James Ortega", "Elena Brooks"],
  2: ["Noah Patel", "Sofia Ramirez", "Liam O'Connor", "Mia Thompson", "Owen Blake"],
  3: ["Harper Diaz", "Ethan Cole", "Isla Nguyen", "Caleb Foster", "Nora Quinn"],
  4: ["Amelia Hart", "Lucas Kim", "Chloe Bennett", "Benjamin Shaw", "Grace Holloway"],
  5: ["Henry Adler", "Zoe Martins", "Jack Ellison", "Ruby Santos", "Leo Fontaine"],
};

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS event_meta (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      event_name TEXT NOT NULL,
      event_subtitle TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS seating_tables (
      id SERIAL PRIMARY KEY,
      number INTEGER NOT NULL UNIQUE,
      label TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS guests (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      table_id INTEGER NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
      notes TEXT
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS guests_full_name_lower_idx
    ON guests ((lower(full_name)))
  `;

  await sql`DELETE FROM guests`;
  await sql`DELETE FROM seating_tables`;
  await sql`DELETE FROM event_meta`;

  await sql`
    INSERT INTO event_meta (id, event_name, event_subtitle)
    VALUES (1, 'Jordan & Avery', 'Saturday evening · find your table')
  `;

  for (const table of tables) {
    const inserted = await sql`
      INSERT INTO seating_tables (number, label)
      VALUES (${table.number}, ${table.label})
      RETURNING id, number
    `;
    const tableId = inserted[0].id;
    for (const fullName of guestsByTable[table.number]) {
      await sql`
        INSERT INTO guests (full_name, table_id)
        VALUES (${fullName}, ${tableId})
      `;
    }
  }

  const counts = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM seating_tables) AS tables,
      (SELECT COUNT(*)::int FROM guests) AS guests
  `;

  console.log(
    `Seeded ${counts[0].tables} tables and ${counts[0].guests} guests.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
