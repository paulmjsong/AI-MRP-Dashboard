import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

export const runtime = "nodejs";

// ------------------------------
// 0. CONSTANTS
// ------------------------------

const DATA_DIR           = join(process.cwd(), "data");
const FORECAST_PATH      = join(DATA_DIR, "latest-forecast.json");
const MOCK_FORECAST_PATH = join(DATA_DIR, "mock-forecast.json");

// ------------------------------
// 1. LOAD FORECAST DATA
// ------------------------------

export async function GET() {
  const exists = await fs.stat(FORECAST_PATH).then(()=>true).catch(()=>false);
  // console.log("[debug] forecast data exists:", exists);
  const path = !exists ? MOCK_FORECAST_PATH : FORECAST_PATH;

  try {
    const file = await fs.readFile(path, "utf8");
    return NextResponse.json(JSON.parse(file));
  } catch (error) {
    return NextResponse.json({});
  }
}