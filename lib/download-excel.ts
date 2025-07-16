import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ------------------------------
// 0. TYPES & UTILITIES
// ------------------------------

type Row = Record<string, any>;
function normalise(row: Row): Row {
  const out: Row = {};

  Object.entries(row).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      // -- JOIN columns -------------------------------------------
      if (key === "backupPartNos") {
        const joined =
          val.map((v) => (Array.isArray(v) ? v.join(", ") : v)).join(", ");
        out[key] = joined;
        return;
      }

      // -- EXPLODE columns ----------------------------------------
      val.forEach((v, idx) => {
        out[`${key}_${idx + 1}`] = Array.isArray(v) ? v.join(", ") : v;
      });
    } else if (typeof val === "object" && val !== null) {
      out[key] = JSON.stringify(val); // nested object
    } else {
      out[key] = val;
    }
  });

  return out;
}

// ------------------------------
// 1. DOWNLOAD EXCEL
// ------------------------------

export function downloadExcel(dataList: Row[][], sheetNames: string[] = []) {
  const wb = XLSX.utils.book_new();

  dataList.forEach((rawRows, idx) => {
    const rows = rawRows.map((r) => normalise(r));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetNames[idx] ?? `Sheet${idx + 1}`);
  });

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "dashboard.xlsx");
}