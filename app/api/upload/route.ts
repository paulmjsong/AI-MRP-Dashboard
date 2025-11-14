import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { promises as fs } from "fs";
import { join } from "path";

export const runtime = "nodejs";  // needed for fs access on Vercel/Next

// ------------------------------
// 0. TYPES & CONSTANTS
// ------------------------------

const DATA_DIR      = join(process.cwd(), "data");
const KPI_PATH      = join(DATA_DIR, "latest-kpi.json");
const FORECAST_PATH = join(DATA_DIR, "latest-forecast.json");
const MOCK_KPI_PATH = join(DATA_DIR, "mock-kpi.json");

const SHEET_NAMES = [
  'Filter Forecast',
  'Consumable Forecast',
]
const START_INDEX = 10;     // temporary
const MAX_ITEMS = 5;     // temporary
const MAX_FORECAST = 12;  // from -1 month to +11 months

type Cell = string | number | null;
type Sheet = Cell[][];

type ForecastItem = {
  partNo:         string;
  backupPartNos:  string[];
  category:       string;
  currentStock:   number;
  totalStock:     number;
  openPO:         number;
  monthlyUsage:   number[];
  monthlyExpiry:  number[];
  monthlyReceipt: number[];
  expectedTotal:  number[];
  expectedWithPO: number[];
  neededActions: ("발주" | "입고")[][];
}
type ForecastData = ForecastItem[];

type KpiData = {
  stock:            number;
  stockChange:      number;
  openPO:           number;
  openPOChange:     number;
  reqReceipt:       number;
  reqReceiptChange: number;
  reqOrders:        number;
  reqOrdersChange:  number;
}

// ------------------------------
// 1. LOAD SHEETS
// ------------------------------

async function loadSheets(file: File, sheetNames: string[]): Promise<Sheet[]> {
  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf);
  const ws = sheetNames.map<Sheet>(name => {
    const sheet = wb.Sheets[name];
    if (!sheet) return [];
    return XLSX.utils.sheet_to_json<Cell[]>(sheet, {
      header: 1,    // give rows as plain arrays
      defval: null, // keep empty cells as null so indices line up
    });
  });
  return ws;
}

// ------------------------------
// 2. READ & PROCESS DATA
// ------------------------------

function getForecast(sheet: Sheet): ForecastData {
  const noHeader = sheet.slice(3);
  const forecast: ForecastData = [];

  const currDate = new Date();
  // const currYear = currDate.getUTCFullYear(); // full year in UTC (0 = 2014)
  const currYear = 2015 - 2014;                  // zero-based index (assume today is 2015)
  const currMonth = currDate.getMonth();         // zero-based index (0 = January)

  for (let i = START_INDEX; i < START_INDEX + MAX_ITEMS * 5; i += 5) {
    const backupPartNos  = [];
    const monthlyUsage   = [];
    const monthlyExpiry  = [];
    const monthlyReceipt = [];
    const expectedTotal  = [];
    const expectedWithPO = [];
    const neededActions  = [];

    const currentStock = Number(noHeader[i][5] ?? 0);
    const totalStock   = Number(noHeader[i][7] ?? 0);
    const openPO       = Number(noHeader[i][8] ?? 0);

    for (let j = 0; j < 5; j++) {
      if (noHeader[i + j][2]) backupPartNos.push(String(noHeader[i + j][2]) ?? "N/A");
    }

    const startCol = 11 + (currYear * 12) + currMonth;

    for (let j = 0; j < MAX_FORECAST; j++) {
      monthlyUsage.push(Math.round(Number(noHeader[i][startCol + j] ?? 0)));
      monthlyExpiry.push(Math.round(Number(noHeader[i + 1][startCol + j] ?? 0)));
      
      if (j === 0) monthlyReceipt.push(Number(noHeader[i][9] ?? 0));  // temporary
      else monthlyReceipt.push(0);                                    // temporary

      const expectedPrev: number = (j === 0) ? totalStock : expectedTotal[j - 1];
      expectedTotal.push(expectedPrev - monthlyUsage[j] - monthlyExpiry[j] + monthlyReceipt[j])
      expectedWithPO.push(expectedTotal[j] + openPO);
    }
    
    for (let j = 0; j < MAX_FORECAST; j++) {
      const actions: ("발주" | "입고")[] = [];
      const expectWithPO = (j + 2 > MAX_FORECAST - 1) ? expectedWithPO[MAX_FORECAST - 1] : expectedWithPO[j + 2];
      if (expectWithPO < 0) actions.push("발주");
      if (expectedTotal[j] < 0) actions.push("입고");
      neededActions.push(actions);
    }

    forecast.push({
      partNo:         String(noHeader[i][1] ?? "N/A"),
      backupPartNos:  backupPartNos.map(String),
      category:       String(noHeader[i][3] ?? "N/A"),
      currentStock:   currentStock,
      totalStock:     totalStock,
      openPO:         openPO,
      monthlyUsage:   monthlyUsage,
      monthlyExpiry:  monthlyExpiry,
      monthlyReceipt: monthlyReceipt,
      expectedTotal:  expectedTotal,
      expectedWithPO: expectedWithPO,
      neededActions:  neededActions,
    })
  }
  
  return forecast;
}

async function getOldKpi(): Promise<KpiData> {
  const exists = await fs.stat(KPI_PATH).then(()=>true).catch(()=>false);
  console.log("[debug] old KPI data exists:", exists);
  const path = !exists ? MOCK_KPI_PATH : KPI_PATH;
  const file = await fs.readFile(path, "utf8");
  const oldKpiData = JSON.parse(file).kpi;
  return oldKpiData;
}

function getNewKpi(dataList: ForecastData[], oldKpiData: KpiData): KpiData {
  let newKpiData: KpiData = {
    stock:            0,
    stockChange:      0,
    openPO:           0,
    openPOChange:     0,
    reqReceipt:       0,
    reqReceiptChange: 0,
    reqOrders:        0,
    reqOrdersChange:  0,
  };
  
  for (const data of dataList) {
    for (const item of data) {
      newKpiData.stock += item.totalStock;
      newKpiData.openPO += item.openPO;
      if (item.expectedTotal[0] < 0) newKpiData.reqReceipt += (item.expectedTotal[0] * -1);
      if (item.expectedWithPO[2] < 0) newKpiData.reqOrders += (item.expectedWithPO[2] * -1);
      // if (item.neededActions[0].includes("입고")) newKpiData.reqReceipt += (item.expectedTotal[0] * -1);
      // if (item.neededActions[0].includes("발주")) newKpiData.reqOrders += (item.expectedWithPO[2] * -1);
    }
  }

  newKpiData.stockChange = newKpiData.stock - oldKpiData.stock;
  newKpiData.openPOChange = newKpiData.openPO - oldKpiData.openPO;
  newKpiData.reqReceiptChange = newKpiData.reqReceipt - oldKpiData.reqReceipt;
  newKpiData.reqOrdersChange = newKpiData.reqOrders - oldKpiData.reqOrders;

  return newKpiData;
}

// ------------------------------
// 3. UPDATE DB
// ------------------------------

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No files" }, { status: 400 });
  
  // get data
  // console.log("[debug] loading sheets...");
  const rawData = await loadSheets(file, SHEET_NAMES);
  // console.log("[debug] reading data...");
  const filterForecast = getForecast(rawData[0]);     // 0 = Filter, 1 = Consumable
  const consumableForecast = getForecast(rawData[1]); // 0 = Filter, 1 = Consumable
  const oldKpiData = await getOldKpi();
  // console.log("[debug] getting kpi data...");
  const newKpiData = getNewKpi([filterForecast, consumableForecast], oldKpiData);

  // write JSON
  // console.log("[debug] creating JSON...");
  await fs.mkdir(DATA_DIR, { recursive: true });
  let kpiJSON: Record<string, any> = {}
  let forecastJSON: Record<string, any> = {}
  kpiJSON['kpi'] = newKpiData;
  forecastJSON['filter'] = filterForecast;
  forecastJSON['consumable'] = consumableForecast;

  // save JSON
  // console.log("[debug] saving JSON...");
  const tmp1 = `${KPI_PATH}.tmp`;
  const tmp2 = `${FORECAST_PATH}.tmp`;
  await fs.writeFile(tmp1, JSON.stringify(kpiJSON, null, 2), "utf8");
  await fs.writeFile(tmp2, JSON.stringify(forecastJSON, null, 2), "utf8");
  await fs.rename(tmp1, KPI_PATH);
  await fs.rename(tmp2, FORECAST_PATH);

  return NextResponse.json({ ok: true, count: 2 });
}