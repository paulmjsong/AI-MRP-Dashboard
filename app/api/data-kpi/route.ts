import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

export const runtime = "nodejs";

// ------------------------------
// 0. CONSTANTS
// ------------------------------

const DATA_DIR      = join(process.cwd(), "data");
const KPI_PATH      = join(DATA_DIR, "latest-kpi.json");
const MOCK_KPI_PATH = join(DATA_DIR, "mock-kpi.json");

// ------------------------------
// 1. LOAD KPI DATA
// ------------------------------

export async function GET() {
  const exists = await fs.stat(KPI_PATH).then(()=>true).catch(()=>false);
  console.log("[debug] kpi data exists:", exists);
  const path = !exists ? MOCK_KPI_PATH : KPI_PATH;

  try {
    const file = await fs.readFile(path, "utf8");
    return NextResponse.json(JSON.parse(file));
  } catch (error) {
    return NextResponse.json({});
  }
}