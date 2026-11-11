import { NextResponse } from "next/server";
import { z } from "zod";
import { findGuestMatches, getTableAssignment } from "@/lib/guests";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  guestId: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter at least two letters of your name." },
        { status: 400 },
      );
    }

    const { name, guestId } = parsed.data;

    if (guestId) {
      const assignment = await getTableAssignment(guestId);
      if (!assignment) {
        return NextResponse.json({ error: "Guest not found." }, { status: 404 });
      }
      return NextResponse.json({ type: "assignment", assignment });
    }

    if (!name) {
      return NextResponse.json(
        { error: "Enter the name on your invitation." },
        { status: 400 },
      );
    }

    const matches = await findGuestMatches(name);
    if (matches.length === 0) {
      return NextResponse.json({
        type: "none",
        message: "We couldn’t find that name. Try the spelling from your invitation.",
      });
    }

    if (matches.length === 1) {
      const assignment = await getTableAssignment(matches[0].id);
      return NextResponse.json({ type: "assignment", assignment });
    }

    return NextResponse.json({ type: "matches", matches });
  } catch (error) {
    console.error("lookup failed", error);
    return NextResponse.json(
      { error: "Something went wrong looking up your seat. Please try again." },
      { status: 500 },
    );
  }
}
