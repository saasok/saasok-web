import * as XLSX from "xlsx";
import { COMPETITIVE_ASSETS, type CompetitiveAsset } from "./competitiveAssets";

export const COMPETITIVE_ASSET_EXPORT_HEADERS = [
  "Ticker",
  "Asset",
  "Market Cap",
  "Peers & Market Cap",
  "Peer Core Regions",
  "Owners / Major Shareholders",
  "Notes",
] as const;

export function buildCompetitiveAssetRows(
  assets: CompetitiveAsset[] = COMPETITIVE_ASSETS,
) {
  return assets.map((a) => ({
    Ticker: a.ticker,
    Asset: a.name,
    "Market Cap": a.marketCap,
    "Peers & Market Cap": a.peers
      .map((p) => `${p.name} ${p.marketCap}`.trim())
      .join("; "),
    "Peer Core Regions": a.peers
      .map((p) => `${p.name} - ${p.regions}`)
      .join("; "),
    "Owners / Major Shareholders": a.ownersMajorShareholders,
    Notes: a.notes.join(" | "),
  }));
}

export function buildCompetitiveAssetWorkbook(
  assets: CompetitiveAsset[] = COMPETITIVE_ASSETS,
): XLSX.WorkBook {
  const worksheet = XLSX.utils.json_to_sheet(buildCompetitiveAssetRows(assets), {
    header: [...COMPETITIVE_ASSET_EXPORT_HEADERS],
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Competitive Asset View");
  return workbook;
}

export function exportCompetitiveAssetsWorkbook(
  assets: CompetitiveAsset[] = COMPETITIVE_ASSETS,
): void {
  XLSX.writeFile(buildCompetitiveAssetWorkbook(assets), "competitive-asset-view.xlsx");
}
