import { toast } from "sonner";

export interface CSVColumn<T> {
  key: keyof T | ((item: T) => string | number);
  label: string;
}

/**
 * Export data to CSV file
 * @param data Array of data to export
 * @param columns Column definitions with key and label
 * @param filename Name of the CSV file (without .csv extension)
 */
export function exportToCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  filename: string,
): void {
  if (!data.length) {
    toast.error("No data to export");
    return;
  }

  try {
    // Create CSV header
    const header = columns.map((col) => escapeCSVValue(col.label)).join(",");

    // Create CSV rows
    const rows = data.map((item) =>
      columns
        .map((col) => {
          const value =
            typeof col.key === "function" ? col.key(item) : item[col.key];
          return escapeCSVValue(value);
        })
        .join(","),
    );

    // Combine header and rows
    const csv = [header, ...rows].join("\n");

    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${data.length} records to ${filename}.csv`);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    toast.error("Failed to export CSV file");
  }
}

/**
 * Escape CSV value to handle commas, quotes, and newlines
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

