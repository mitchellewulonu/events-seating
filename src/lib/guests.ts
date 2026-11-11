import { getSql } from "./db";

export type Guest = {
  id: number;
  full_name: string;
  table_id: number;
  table_number: number;
  table_label: string;
};

export type LookupMatch = {
  id: number;
  full_name: string;
  table_number: number;
  table_label: string;
};

export type TableAssignment = {
  guest: Guest;
  seatmates: Array<{ id: number; full_name: string }>;
  eventName: string;
  eventSubtitle: string | null;
};

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function ensureSchema() {
  const sql = getSql();
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
}

export async function findGuestMatches(rawName: string): Promise<LookupMatch[]> {
  const name = normalizeName(rawName);
  if (name.length < 2) return [];

  const sql = getSql();
  const rows = await sql`
    SELECT
      g.id,
      g.full_name,
      t.number AS table_number,
      t.label AS table_label
    FROM guests g
    JOIN seating_tables t ON t.id = g.table_id
    WHERE lower(g.full_name) = lower(${name})
       OR lower(g.full_name) LIKE lower(${"%" + name + "%"})
    ORDER BY
      CASE WHEN lower(g.full_name) = lower(${name}) THEN 0 ELSE 1 END,
      g.full_name
    LIMIT 12
  `;

  return rows as LookupMatch[];
}

export async function getTableAssignment(
  guestId: number,
): Promise<TableAssignment | null> {
  const sql = getSql();
  const guestRows = await sql`
    SELECT
      g.id,
      g.full_name,
      g.table_id,
      t.number AS table_number,
      t.label AS table_label
    FROM guests g
    JOIN seating_tables t ON t.id = g.table_id
    WHERE g.id = ${guestId}
    LIMIT 1
  `;

  if (guestRows.length === 0) return null;
  const guest = guestRows[0] as Guest;

  const seatmates = (await sql`
    SELECT id, full_name
    FROM guests
    WHERE table_id = ${guest.table_id} AND id <> ${guest.id}
    ORDER BY full_name
  `) as Array<{ id: number; full_name: string }>;

  const meta = await sql`
    SELECT event_name, event_subtitle FROM event_meta WHERE id = 1 LIMIT 1
  `;

  return {
    guest,
    seatmates,
    eventName: (meta[0]?.event_name as string) || "Our Celebration",
    eventSubtitle: (meta[0]?.event_subtitle as string | null) ?? null,
  };
}
