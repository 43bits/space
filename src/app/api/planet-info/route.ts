// /app/api/planet-info/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing planet id" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.le-systeme-solaire.net/rest/bodies/${id}`
    );
    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load planet data" },
      { status: 500 }
    );
  }
}