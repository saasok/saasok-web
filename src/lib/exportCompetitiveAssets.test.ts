import * as XLSX from "xlsx";
import { COMPETITIVE_ASSETS } from "./competitiveAssets";
import {
  COMPETITIVE_ASSET_EXPORT_HEADERS,
  buildCompetitiveAssetRows,
  buildCompetitiveAssetWorkbook,
} from "./exportCompetitiveAssets";

describe("competitive asset export", () => {
  it("produces one row per asset with the expected columns", () => {
    const rows = buildCompetitiveAssetRows();
    expect(rows).toHaveLength(COMPETITIVE_ASSETS.length);
    rows.forEach((row) => {
      expect(Object.keys(row)).toEqual([...COMPETITIVE_ASSET_EXPORT_HEADERS]);
    });
    expect(rows[0].Ticker).toBe(COMPETITIVE_ASSETS[0].ticker);
    expect(rows[0].Asset).toBe(COMPETITIVE_ASSETS[0].name);
  });

  it("builds a workbook whose sheet header row matches the export headers", () => {
    const workbook = buildCompetitiveAssetWorkbook();
    const sheet = workbook.Sheets["Competitive Asset View"];
    expect(sheet).toBeDefined();

    const parsed = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
    expect(parsed[0]).toEqual([...COMPETITIVE_ASSET_EXPORT_HEADERS]);
    expect(parsed).toHaveLength(COMPETITIVE_ASSETS.length + 1);
  });
});
