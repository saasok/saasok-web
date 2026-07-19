import { NextRequest, NextResponse } from "next/server";
import { resolveGeo } from "@/lib/geoLookup";

export const dynamic = "force-dynamic";

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  const result = await resolveGeo(ip);
  return NextResponse.json(result);
}
