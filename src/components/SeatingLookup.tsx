"use client";

import { FormEvent, useMemo, useState } from "react";

type Match = {
  id: number;
  full_name: string;
  table_number: number;
  table_label: string;
};

type Assignment = {
  guest: {
    id: number;
    full_name: string;
    table_number: number;
    table_label: string;
  };
  seatmates: Array<{ id: number; full_name: string }>;
  eventName: string;
  eventSubtitle: string | null;
};

type LookupResponse =
  | { type: "assignment"; assignment: Assignment }
  | { type: "matches"; matches: Match[] }
  | { type: "none"; message: string }
  | { error: string };

export function SeatingLookup() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const canSubmit = useMemo(() => name.trim().length >= 2 && !loading, [name, loading]);

  async function lookup(payload: { name?: string; guestId?: number }) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as LookupResponse;
      if (!response.ok || "error" in data) {
        setAssignment(null);
        setMatches(null);
        setError("error" in data ? data.error : "Lookup failed.");
        return;
      }
      if (data.type === "assignment") {
        setMatches(null);
        setAssignment(data.assignment);
        return;
      }
      if (data.type === "matches") {
        setAssignment(null);
        setMatches(data.matches);
        return;
      }
      setAssignment(null);
      setMatches(null);
      setError(data.message);
    } catch {
      setError("Could not reach the seating guide. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookup({ name });
  }

  function reset() {
    setAssignment(null);
    setMatches(null);
    setError(null);
    setName("");
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(201,168,76,0.18),transparent_36%),radial-gradient(circle_at_82%_12%,rgba(93,143,109,0.22),transparent_32%),linear-gradient(160deg,#101c16_0%,#1a2c22_48%,#0d1712_100%)]" />
      <div className="glow-orb pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.28),transparent_70%)] blur-2xl" />
      <div className="glow-orb pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(63,107,82,0.35),transparent_70%)] blur-2xl" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10">
        {!assignment && !matches ? (
          <section className="animate-rise">
            <p className="brand-sheen mb-5 bg-gradient-to-r from-[#e8d39a] via-[#f6efd8] to-[#c9a84c] bg-clip-text font-[family-name:var(--font-display)] text-5xl font-medium tracking-[0.02em] text-transparent sm:text-6xl md:text-7xl">
              Seated
            </p>
            <h1 className="max-w-xl font-[family-name:var(--font-display)] text-3xl leading-tight text-[#f3ebe2] sm:text-4xl">
              Find your table for the evening.
            </h1>
            <p className="animate-rise-delay mt-4 max-w-lg text-base leading-relaxed text-[#d7cfc4] sm:text-lg">
              Enter the name on your invitation to see where you’re seated and
              who’s sharing your table.
            </p>

            <form
              onSubmit={onSubmit}
              className="animate-rise-late mt-10 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:items-end"
            >
              <label className="flex-1">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-[#b7c4b6]">
                  Your name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Ava Chen"
                  autoComplete="name"
                  className="w-full border-0 border-b border-[#5d8f6d]/55 bg-transparent px-0 py-3 text-lg text-[#fff8f1] outline-none transition placeholder:text-[#8ea092] focus:border-[#c9a84c]"
                />
              </label>
              <button
                type="submit"
                disabled={!canSubmit}
                className="h-12 shrink-0 bg-[#c9a84c] px-7 text-sm font-semibold tracking-wide text-[#132018] transition enabled:hover:bg-[#dfc36a] enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Looking…" : "Find my table"}
              </button>
            </form>

            {error ? (
              <p className="mt-6 max-w-xl text-sm text-[#f0c2b0]" role="alert">
                {error}
              </p>
            ) : null}

            <p className="mt-16 text-sm text-[#8ea092]">
              Try a demo name like <span className="text-[#d7cfc4]">Ava Chen</span> or{" "}
              <span className="text-[#d7cfc4]">Noah Patel</span>.
            </p>
          </section>
        ) : null}

        {matches ? (
          <section className="animate-rise">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#b7c4b6]">
              Multiple matches
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#f3ebe2]">
              Which guest is you?
            </h2>
            <ul className="mt-8 space-y-3">
              {matches.map((match) => (
                <li key={match.id}>
                  <button
                    type="button"
                    onClick={() => lookup({ guestId: match.id })}
                    className="flex w-full items-center justify-between border border-[#3f6b52]/45 bg-[#1a2c22]/70 px-5 py-4 text-left transition hover:border-[#c9a84c]/70 hover:bg-[#24352b]/80"
                  >
                    <span className="text-lg text-[#fff8f1]">{match.full_name}</span>
                    <span className="text-sm text-[#b7c4b6]">
                      Table {match.table_number}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={reset}
              className="mt-8 text-sm text-[#c9a84c] underline-offset-4 hover:underline"
            >
              Search again
            </button>
          </section>
        ) : null}

        {assignment ? (
          <section className="animate-rise">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#b7c4b6]">
              {assignment.eventName}
            </p>
            <p className="font-[family-name:var(--font-display)] text-2xl text-[#f3ebe2] sm:text-3xl">
              Welcome, {assignment.guest.full_name}
            </p>

            <div className="mt-10 border-y border-[#5d8f6d]/35 py-10">
              <p className="text-xs uppercase tracking-[0.22em] text-[#b7c4b6]">
                Your table
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-7xl leading-none text-[#c9a84c] sm:text-8xl">
                {assignment.guest.table_number}
              </p>
              <p className="mt-4 text-xl text-[#f3ebe2]">
                {assignment.guest.table_label}
              </p>
            </div>

            <div className="mt-10">
              <h3 className="text-xs uppercase tracking-[0.18em] text-[#b7c4b6]">
                Sitting with you
              </h3>
              {assignment.seatmates.length > 0 ? (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {assignment.seatmates.map((seatmate, index) => (
                    <li
                      key={seatmate.id}
                      className="animate-rise border-l border-[#c9a84c]/50 pl-4 text-lg text-[#fff8f1]"
                      style={{ animationDelay: `${120 + index * 60}ms` }}
                    >
                      {seatmate.full_name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[#d7cfc4]">You’re the first name at this table.</p>
              )}
            </div>

            <button
              type="button"
              onClick={reset}
              className="mt-12 text-sm text-[#c9a84c] underline-offset-4 hover:underline"
            >
              Look up another guest
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
