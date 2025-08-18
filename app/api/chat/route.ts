import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage } from 'ai'
import { promises as fs } from "fs";
import { join } from "path";

// ------------------------------
// 0. CONSTANTS & UTILITIES
// ------------------------------

const DATA_DIR           = join(process.cwd(), "data");
const KPI_PATH           = join(DATA_DIR, "latest-kpi.json");
const FORECAST_PATH      = join(DATA_DIR, "latest-forecast.json");
const MOCK_KPI_PATH      = join(DATA_DIR, "mock-kpi.json");
const MOCK_FORECAST_PATH = join(DATA_DIR, "mock-forecast.json");

async function safeRead(path: string, fallback: string) {
  try {
    return JSON.parse(await fs.readFile(path, "utf8"));
  } catch {
    return JSON.parse(await fs.readFile(fallback, "utf8"));
  }
}

// ------------------------------
// 1. CHAT
// ------------------------------

export async function POST(req: Request) {
  const currDate = new Date();
  const year  = currDate.getUTCFullYear(); // full year (assume 2015 = 2025)
  const month = currDate.getMonth() + 1;   // full month (1 = January)
  const today = `${year}-${month.toString().padStart(2, "0")}`;

  try {
    // parse user messages
    const { messages }: { messages: UIMessage[] } = await req.json();
    const userMessages = messages.map(({ role, content }) => ({ role, content }));

    // load JSON
    const [kpi, forecast] = await Promise.all([
      safeRead(KPI_PATH, MOCK_KPI_PATH),
      safeRead(FORECAST_PATH, MOCK_FORECAST_PATH),
    ]);
    
    // craft system context
    const systemContext = {
      role: "system" as const,
      content: `
You are the AI assistant embedded inside an analytics dashboard.

─── DATA ───
KPI data:
${JSON.stringify(kpi, null, 2)}

Forecast data:
${JSON.stringify(forecast, null, 2)}

Current date: ${today}

─── INSTRUCTIONS ───
✅ Use the KPI and forecast data provided to deliver insights.
✅ Always refer to values naturally, without exposing variable names, JSON structures, or technical details.
✅ Do not mention how the data is stored or accessed (e.g., avoid saying “in kpi[0]" or “from the JSON file").
✅ Speak as if summarizing data from a live dashboard.

✅ When accessing arrays, assume the first item represents today. Refer to dates and periods conversationally (e.g., “today," “this week," “next month").
✅ When presenting forecasts, describe them as forward-looking insights (e.g., “We expect sales to rise by 4% next quarter").

Example:

❌ Don't say: “In kpi[0], revenue is $1.2M."

✅ Say: “Today's revenue is $1.2M."`
    };
    
    // call LLM
    const result = await streamText({
      model: openai('o3-mini'),
      messages: [systemContext, ...userMessages],
    })
    return result.toDataStreamResponse();
  } catch (err: any) {
    console.error('[chat] handler error:', err);
    return new Response(
      JSON.stringify({ error: err.message ?? 'internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}