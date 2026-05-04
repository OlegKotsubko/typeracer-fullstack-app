import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { createRace, listRaces } from "@/server/services/races";
import { ServiceError } from "@/server/services/errors";

export async function GET() {
  return NextResponse.json(await listRaces());
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const race = await createRace(body);
    return NextResponse.json(race, { status: 201 });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
