import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface ArtistRaw {
  name: string;
  playcount: string;
  "@attr"?: { rank?: string };
}

const requests = new Map<string, { count: number; time: number }>();
const WINDOW = 5 * 60 * 1000;
const MAX = 10;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requests.get(ip);
  if (!entry || now - entry.time > WINDOW) {
    requests.set(ip, { count: 1, time: now });
    return true;
  }
  if (entry.count >= MAX) return false;
  entry.count++;
  return true;
}

const periods = ["7day", "1month", "3month", "6month", "12month", "overall"] as const;
type Period = typeof periods[number];

function getUnixRanges(): Record<Exclude<Period, "overall">, { from: number; to: number }> {
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  return {
    "7day": { from: now - 7 * day, to: now },
    "1month": { from: now - 30 * day, to: now },
    "3month": { from: now - 90 * day, to: now },
    "6month": { from: now - 180 * day, to: now },
    "12month": { from: now - 365 * day, to: now },
  };
}

export async function GET(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "global";

  if (!rateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  if (!user) return NextResponse.json({ error: "missing 'user'" }, { status: 400 });

  const apiKey = process.env.API_KEY;
  if (!apiKey) return NextResponse.json({ error: "api key missing" }, { status: 500 });

  const baseURL = "http://ws.audioscrobbler.com/2.0/";
  const commonParams = { user, api_key: apiKey, format: "json" };

  try {
    const userInfoRes = await axios.get(baseURL, { params: { ...commonParams, method: "user.getinfo" } });
    const userInfo = userInfoRes.data?.user || null;

    const ranges = getUnixRanges();
    const periodOrder: Exclude<Period, "overall">[] = ["7day", "1month", "3month", "6month", "12month"];
    const allTopArtistsSet = new Set<string>();
    const periodTop6Map: Record<Exclude<Period, "overall">, string[]> = {} as any;

    for (const period of periodOrder) {
      const range = ranges[period];
      const artistsRes = await axios.get(baseURL, {
        params: { ...commonParams, method: "user.getweeklyartistchart", from: range.from, to: range.to },
      });
      const artistsRaw: ArtistRaw[] = artistsRes.data?.weeklyartistchart?.artist || [];
      const sortedTop6 = artistsRaw
        .sort((a, b) => (parseInt(b.playcount, 10) || 0) - (parseInt(a.playcount, 10) || 0))
        .slice(0, 6)
        .map((a) => a.name);
      periodTop6Map[period] = sortedTop6;
      sortedTop6.forEach((name) => allTopArtistsSet.add(name));
    }

    const overallRes = await axios.get(baseURL, {
      params: { ...commonParams, method: "user.gettopartists", limit: 1000 },
    });
    const overallArtists: ArtistRaw[] = overallRes.data?.topartists?.artist || [];
    const overallTop6 = overallArtists
      .slice()
      .sort((a, b) => (parseInt(b.playcount, 10) || 0) - (parseInt(a.playcount, 10) || 0))
      .slice(0, 6)
      .map((a) => a.name);
    overallTop6.forEach((name) => allTopArtistsSet.add(name));

    const allArtists = Array.from(allTopArtistsSet);
    const artistData: Record<string, { name: string; overallPlaycount: number; periods: any }> = {};
    for (const name of allArtists) {
      const overallPlaycount = overallArtists.find((a) => a.name === name)?.playcount ?? "0";
      artistData[name] = {
        name,
        overallPlaycount: parseInt(overallPlaycount, 10) || 0,
        periods: { "7day": 0, "1month": 0, "3month": 0, "6month": 0, "12month": 0, overall: 0 },
      };
    }

    for (const period of periodOrder) {
      const range = ranges[period];
      const artistsRes = await axios.get(baseURL, {
        params: { ...commonParams, method: "user.getweeklyartistchart", from: range.from, to: range.to },
      });
      const artistsRaw: ArtistRaw[] = artistsRes.data?.weeklyartistchart?.artist || [];
      for (const a of artistsRaw) {
        if (artistData[a.name]) {
          artistData[a.name].periods[period] = parseInt(a.playcount, 10) || 0;
        }
      }
    }

    for (const a of overallArtists) {
      if (artistData[a.name]) artistData[a.name].periods.overall = parseInt(a.playcount, 10) || 0;
    }

    const charts: Record<string, any> = {};
    for (const period of [...periodOrder, "overall"] as Period[]) {
      let albumsRaw: any[] = [];
      if (period === "overall") {
        const overallAlbumsRes = await axios.get(baseURL, {
          params: { ...commonParams, method: "user.gettopalbums", limit: 8 },
        });
        albumsRaw = overallAlbumsRes.data?.topalbums?.album?.slice(0, 8) || [];
      } else {
        const albumsRes = await axios.get(baseURL, {
          params: { ...commonParams, method: "user.gettopalbums", period, limit: 8 },
        });
        albumsRaw = albumsRes.data?.topalbums?.album?.slice(0, 8) || [];
      }
      const albums = albumsRaw.map((alb: any) => ({
        name: alb.name,
        artist: alb.artist?.name || alb.artist?.["#text"] || "",
        image: alb.image || [],
      }));

      let periodArtists: any[] = [];
      if (period === "overall") {
        periodArtists = overallTop6.map((name) => ({
          name,
          playcount: artistData[name].periods.overall,
          overallPlaycount: artistData[name].overallPlaycount,
          rank: overallTop6.indexOf(name) + 1,
        }));
      } else {
        const top6Names = periodTop6Map[period];
        periodArtists = allArtists.map((name) => ({
          name,
          playcount: artistData[name].periods[period],
          overallPlaycount: artistData[name].overallPlaycount,
          rank: top6Names.includes(name) ? top6Names.indexOf(name) + 1 : null,
        }));
      }

      charts[period] = { artists: periodArtists, albums };
    }

    return NextResponse.json({ userInfo, charts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "failed to fetch" }, { status: 500 });
  }
}