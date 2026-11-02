import { parseCsv } from "@/shared/lib/csv"

export class SpreadsheetReadError extends Error {}

/** A spreadsheet as rows of text, the first row being the headers. */
export async function readSpreadsheet(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase()
  if (name.endsWith(".xls")) {
    throw new SpreadsheetReadError("Older .xls files can't be read. In Excel, use Save As and pick .xlsx or .csv.")
  }
  if (name.endsWith(".xlsx")) return readExcel(file)
  if (name.endsWith(".csv") || name.endsWith(".txt") || file.type === "text/csv") return parseCsv(await file.text())
  throw new SpreadsheetReadError("Choose a .csv or .xlsx file.")
}

/**
 * The Excel reader is a separate download so the first page load stays light.
 * It is fetched in the background once the app is idle, so importing still
 * works if the internet drops while the page is open.
 */
function loadExcelReader() {
  return import("read-excel-file/browser")
}

export function preloadExcelReader(): void {
  loadExcelReader().catch(() => {
    // Offline at start-up: the reader is tried again when someone imports.
  })
}

async function readExcel(file: File): Promise<string[][]> {
  const { readSheet } = await loadExcelReader()
  try {
    const rows = await readSheet(file)
    return rows.map((row) => row.map(cellToText)).filter((row) => row.some((cell) => cell.trim() !== ""))
  } catch (error) {
    throw new SpreadsheetReadError("This file couldn't be opened as an Excel workbook.", { cause: error })
  }
}

/** Excel date cells arrive as Date objects at midnight UTC; everything else becomes plain text. */
function cellToText(cell: unknown): string {
  if (cell === null || cell === undefined) return ""
  if (cell instanceof Date) return Number.isNaN(cell.getTime()) ? "" : cell.toISOString().slice(0, 10)
  if (typeof cell === "boolean") return cell ? "yes" : "no"
  return String(cell)
}
