import { NextResponse } from "next/server";
import { discoverContacts } from "@/services/contactDiscovery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url") ?? "";
  const result = await discoverContacts(url);
  const status = result.status === "invalid" ? 400 : result.status === "blocked" ? 422 : 200;

  return NextResponse.json(result, { status });
}
