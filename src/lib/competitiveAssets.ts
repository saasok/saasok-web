import competitiveAssetData from "../../data/competitive-asset-view.json";

// Source sheet has no ticker column; this order is 1:1 with
// data/competitive-asset-view.json and docs/mockup.html's ASSETS20.
const TICKERS = [
  "GOOGL",
  "AMZN",
  "AAPL",
  "BLK",
  "BKNG",
  "AVGO",
  "BYDDY",
  "COIN",
  "MA",
  "MSFT",
  "NFLX",
  "NVDA",
  "PANW",
  "PLTR",
  "RDDT",
  "RTX",
  "MSTR",
  "TSM",
  "TSLA",
  "V",
] as const;

interface RawAsset {
  ourAsset: string;
  competitorsAndTheirMarketCap: string;
  competitorsCoreRegions: string;
  competitorsOwnersMajorShareholders: string;
  notes: string[];
}

export interface Peer {
  name: string;
  marketCap: string;
  regions: string;
}

export interface CompetitiveAsset {
  ticker: string;
  name: string;
  marketCap: string;
  peers: Peer[];
  ownersMajorShareholders: string;
  notes: string[];
}

const rawAssets = (competitiveAssetData as unknown as { assets: RawAsset[] })
  .assets;

function parseAssetHeader(ourAsset: string): {
  name: string;
  marketCap: string;
} {
  const m = ourAsset.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { name: m[1], marketCap: m[2] } : { name: ourAsset, marketCap: "" };
}

// Mirrors renderAssetMockup in docs/mockup.html: peers and their regions are
// stored as separate ";"-joined strings, matched back up by leading name.
function parsePeers(comp: string, regions: string): Peer[] {
  const regionParts = regions.split(";").map((s) => s.trim());
  return comp
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const m = entry.match(/^(.*?)\s*(\$[\d.]+[TBM]|private)\s*$/i);
      const name = m ? m[1] : entry;
      const marketCap = m ? m[2] : "";
      const regionMatch = regionParts.find((r) =>
        r.startsWith(name.split(" ")[0]),
      );
      const peerRegions = regionMatch ? (regionMatch.split(" - ")[1] ?? "") : "";
      return { name, marketCap, regions: peerRegions };
    });
}

export const COMPETITIVE_ASSETS: CompetitiveAsset[] = rawAssets.map(
  (raw, i) => {
    const { name, marketCap } = parseAssetHeader(raw.ourAsset);
    return {
      ticker: TICKERS[i],
      name,
      marketCap,
      peers: parsePeers(raw.competitorsAndTheirMarketCap, raw.competitorsCoreRegions),
      ownersMajorShareholders: raw.competitorsOwnersMajorShareholders,
      notes: raw.notes,
    };
  },
);
