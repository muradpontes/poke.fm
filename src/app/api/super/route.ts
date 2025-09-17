import { NextResponse } from "next/server";

const superUsers = (process.env.SUPER_USERS || "").split(",");

export async function GET() {
  return NextResponse.json(superUsers);
}
