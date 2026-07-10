#!/usr/bin/env node
// One-off conversion of the source spreadsheets in docs/ into static JSON
// under data/. Re-run with `node scripts/convert-xlsx-to-json.js` if the
// source .xlsx files change.
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const DATA_DIR = path.join(__dirname, '..', 'data');

function toCamelKey(header) {
  return String(header)
    .replace(/[’'"]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

function trimTrailingEmptyRows(rows) {
  let last = -1;
  rows.forEach((row, i) => {
    if (row.some((c) => c !== null && c !== undefined && c !== '')) last = i;
  });
  return rows.slice(0, last + 1);
}

function readSheetRows(workbook, sheetName) {
  const ws = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: true,
    defval: null,
  });
  return trimTrailingEmptyRows(rows);
}

// Generic "title row, blank row, header row, data rows" table shape used
// across every sheet in Tax_insights_.xlsx.
function parseTitledTable(rows) {
  const description = rows[0][0];
  const headerRow = rows[2];
  const columns = headerRow.filter((c) => c !== null);
  const keys = headerRow.map((h) => (h === null ? null : toCamelKey(h)));
  const dataRows = rows.slice(3).map((row) => {
    const obj = {};
    keys.forEach((key, i) => {
      if (key === null) return;
      obj[key] = row[i] === undefined ? null : row[i];
    });
    return obj;
  });
  return { description, columns, rows: dataRows };
}

function convertTaxInsights() {
  const wb = XLSX.readFile(path.join(DOCS_DIR, 'Tax_insights_.xlsx'));

  const brokerFees = parseTitledTable(readSheetRows(wb, 'Broker Fees'));
  const feeReductionTactics = parseTitledTable(
    readSheetRows(wb, 'Fee Reduction Tactics')
  );
  const taxReductionLevers = parseTitledTable(
    readSheetRows(wb, 'Tax Reduction Levers')
  );
  const capitalGainsTax = parseTitledTable(
    readSheetRows(wb, 'Capital Gains Tax')
  );
  const brokerCombinations = parseTitledTable(
    readSheetRows(wb, 'Broker Combinations')
  );

  const eligibilityRaw = parseTitledTable(
    readSheetRows(wb, 'Tax Residency Eligibility')
  );
  const taxResidencyEligibility = {
    description: eligibilityRaw.description,
    columns: eligibilityRaw.columns,
    brokers: eligibilityRaw.rows.filter((r) => r.broker !== 'Note'),
    notes: eligibilityRaw.rows
      .filter((r) => r.broker === 'Note')
      .map((r) => r.us),
  };

  return {
    brokerFees,
    feeReductionTactics,
    taxReductionLevers,
    taxResidencyEligibility,
    capitalGainsTax,
    brokerCombinations,
  };
}

// TT Portfolios.xlsx: one sheet per broker, each sheet split into
// "Conservative - $" / "Moderate - $" / "Aggressive - $" sections, each with
// its own header row and a total portfolio value on the first holding row.
function convertPortfolios() {
  const wb = XLSX.readFile(path.join(DOCS_DIR, 'TT Portfolios.xlsx'));

  const brokers = wb.SheetNames.map((sheetName) => {
    const rows = readSheetRows(wb, sheetName);
    const profiles = [];
    let current = null;
    let headerKeys = null;

    for (const row of rows) {
      const cell0 = row[0];
      if (typeof cell0 === 'string' && /^(Conservative|Moderate|Aggressive)/.test(cell0)) {
        const [name, currency] = cell0.split(' - ');
        current = { name, currency: currency || null, totalPortfolioValue: null, holdings: [] };
        profiles.push(current);
        headerKeys = null;
        continue;
      }
      if (typeof cell0 === 'string' && cell0 === 'Symbol') {
        headerKeys = row.map((h) => (h === null ? null : toCamelKey(h)));
        continue;
      }
      if (!current || !headerKeys) continue;
      if (row.every((c) => c === null || c === undefined || c === '')) continue;

      const holding = {};
      headerKeys.forEach((key, i) => {
        if (key === null || key === 'totalPortfolioValueUsd') return;
        const val = row[i];
        holding[key] = val === undefined ? null : val;
      });
      const totalIdx = headerKeys.indexOf('totalPortfolioValueUsd');
      if (totalIdx !== -1 && row[totalIdx] !== null && row[totalIdx] !== undefined) {
        current.totalPortfolioValue = row[totalIdx];
      }
      current.holdings.push(holding);
    }

    return { broker: sheetName.trim(), profiles };
  });

  return { brokers };
}

// Competitive Asset View.xlsx / Our assets.xlsx: a 4-column header row
// followed by one main row per asset plus 1-2 single-cell continuation rows
// (founders / institutional owners / core regions) before the next asset.
function convertAssetView(fileName) {
  const wb = XLSX.readFile(path.join(DOCS_DIR, fileName));
  const rows = readSheetRows(wb, wb.SheetNames[0]);
  const headerRow = rows[0];
  const keys = headerRow.map((h) => toCamelKey(h));

  const assets = [];
  let current = null;
  for (const row of rows.slice(1)) {
    if (row[1] !== null && row[1] !== undefined) {
      current = {};
      keys.forEach((key, i) => {
        current[key] = row[i] === undefined ? null : row[i];
      });
      current.notes = [];
      assets.push(current);
    } else if (current && row[0]) {
      current.notes.push(row[0]);
    }
  }

  return { assets };
}

fs.mkdirSync(DATA_DIR, { recursive: true });

const outputs = {
  'portfolios.json': convertPortfolios(),
  'tax-insights.json': convertTaxInsights(),
  'competitive-asset-view.json': convertAssetView('Competitive Asset View.xlsx'),
  'our-assets.json': convertAssetView('Our assets.xlsx'),
};

for (const [fileName, data] of Object.entries(outputs)) {
  const outPath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');
  console.log('Wrote', path.relative(process.cwd(), outPath));
}
