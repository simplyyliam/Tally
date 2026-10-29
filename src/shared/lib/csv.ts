/**
 * Small CSV reader and writer.
 *
 * Exports start with a UTF-8 byte-order mark so Excel opens names with accents
 * correctly. The reader understands quoted fields, doubled quotes, CRLF line
 * endings and semicolon-separated files (Excel's default in South African locales).
 */

const BOM = "﻿"

function escapeCell(value: string): string {
  if (/[",\r\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function toCsv(rows: ReadonlyArray<ReadonlyArray<string | number>>): string {
  return BOM + rows.map((row) => row.map((cell) => escapeCell(String(cell))).join(",")).join("\r\n")
}

function detectDelimiter(firstLine: string): "," | ";" | "\t" {
  const counts = {
    ",": firstLine.split(",").length,
    ";": firstLine.split(";").length,
    "\t": firstLine.split("\t").length,
  }
  if (counts[";"] > counts[","] && counts[";"] >= counts["\t"]) return ";"
  if (counts["\t"] > counts[","]) return "\t"
  return ","
}

/** Parses CSV text into rows of cells. Empty trailing lines are dropped. */
export function parseCsv(text: string): string[][] {
  const source = text.startsWith(BOM) ? text.slice(1) : text
  const delimiter = detectDelimiter(source.split(/\r?\n/, 1)[0] ?? "")
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false

  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
      continue
    }
    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else {
      cell += char
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""))
}
