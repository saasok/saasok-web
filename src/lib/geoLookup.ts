export interface GeoResult {
  country: string | null;
  isVpn: boolean;
}

const FETCH_TIMEOUT_MS = 2000;

async function lookupCountry(ip: string): Promise<string | null> {
  try {
    const key = process.env.IPAPI_API_KEY;
    const url = `https://ipapi.co/${ip}/json/${key ? `?key=${key}` : ""}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    const data = (await res.json()) as { country_name?: unknown };
    return typeof data.country_name === "string" ? data.country_name : null;
  } catch {
    return null;
  }
}

async function lookupVpn(ip: string): Promise<boolean> {
  // No key means VPN detection is simply disabled (fail open) — and, just as
  // importantly, this skips the network call entirely so local/offline/CI
  // runs never depend on vpnapi.io being reachable.
  const key = process.env.VPNAPI_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(`https://vpnapi.io/api/${ip}?key=${key}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { security?: { vpn?: unknown } };
    return Boolean(data.security?.vpn);
  } catch {
    return false;
  }
}

export async function resolveGeo(ip: string | null): Promise<GeoResult> {
  if (!ip) return { country: null, isVpn: false };
  const [country, isVpn] = await Promise.all([lookupCountry(ip), lookupVpn(ip)]);
  return { country, isVpn };
}
