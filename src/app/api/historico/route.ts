import { NextRequest, NextResponse } from "next/server";

interface ArtistSave {
  name: string;
  sprite: { row?: number; col?: number; customImage?: string } | null;
  sex: "macho" | "femea" | "trans";
}

const savedArtists: Record<string, ArtistSave[]> = {};

export async function POST(req: NextRequest) {
  const { username, artists } = await req.json();
  if (!username || !artists) {
    return NextResponse.json({ error: "missing username or artists" }, { status: 400 });
  }
  savedArtists[username] = artists;
  return NextResponse.json({ message: "saved successfully" });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("user");
  if (!username) return NextResponse.json({ error: "missing user" }, { status: 400 });

  const artists = savedArtists[username] || [];
  return NextResponse.json({ username, artists });
}