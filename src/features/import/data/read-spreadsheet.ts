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

async function readExcel(file: File): Promise<string[][]> {
  // Loaded only when someone imports a spreadsheet, so everyday use stays light.
  const { readSheet } = await import("read-excel-file/browser")
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
