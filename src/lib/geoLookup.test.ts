import { resolveGeo } from "./geoLookup";

type FakeResponse = { ok: boolean; json: () => Promise<unknown> };

describe("resolveGeo", () => {
  const originalFetch = global.fetch;
  const originalIpapiKey = process.env.IPAPI_API_KEY;
  const originalVpnapiKey = process.env.VPNAPI_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.IPAPI_API_KEY = originalIpapiKey;
    process.env.VPNAPI_API_KEY = originalVpnapiKey;
  });

  it("returns country: null, isVpn: false immediately when ip is null, with no fetch calls", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await resolveGeo(null);

    expect(result).toEqual({ country: null, isVpn: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("combines a successful country lookup and VPN lookup", async () => {
    process.env.VPNAPI_API_KEY = "test-vpn-key";
    const fetchMock = jest.fn(async (url: string): Promise<FakeResponse> => {
      if (url.includes("ipapi.co")) {
        return { ok: true, json: async () => ({ country_name: "Germany" }) };
      }
      if (url.includes("vpnapi.io")) {
        return { ok: true, json: async () => ({ security: { vpn: true } }) };
      }
      throw new Error(`unexpected url: ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await resolveGeo("1.2.3.4");

    expect(result).toEqual({ country: "Germany", isVpn: true });
  });

  it("falls back to a null country when the geolocation call fails", async () => {
    process.env.VPNAPI_API_KEY = "test-vpn-key";
    const fetchMock = jest.fn(async (url: string): Promise<FakeResponse> => {
      if (url.includes("ipapi.co")) throw new Error("network error");
      return { ok: true, json: async () => ({ security: { vpn: false } }) };
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await resolveGeo("1.2.3.4");

    expect(result).toEqual({ country: null, isVpn: false });
  });

  it("falls back to isVpn: false when the VPN API errors or returns non-ok", async () => {
    process.env.VPNAPI_API_KEY = "test-vpn-key";
    const fetchMock = jest.fn(async (url: string): Promise<FakeResponse> => {
      if (url.includes("ipapi.co")) {
        return { ok: true, json: async () => ({ country_name: "France" }) };
      }
      return { ok: false, json: async () => ({}) };
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await resolveGeo("1.2.3.4");

    expect(result).toEqual({ country: "France", isVpn: false });
  });

  it("never calls the VPN API when VPNAPI_API_KEY is unset", async () => {
    delete process.env.VPNAPI_API_KEY;
    const fetchMock = jest.fn(async (url: string): Promise<FakeResponse> => {
      if (url.includes("ipapi.co")) {
        return { ok: true, json: async () => ({ country_name: "Italy" }) };
      }
      throw new Error("VPN API should not have been called");
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await resolveGeo("1.2.3.4");

    expect(result).toEqual({ country: "Italy", isVpn: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
