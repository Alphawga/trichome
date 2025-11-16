"use client";

import type React from "react";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyMessage?: string;
  loadingRows?: number;
  keyExtractor: (item: T) => string;
  rowClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = "No data available",
  loadingRows = 5,
  keyExtractor,
  rowClassName = "border-b last:border-0 hover:bg-gray-50",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border overflow-x-auto">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: loadingRows }, (_, i) => `row-${i}`).map(
              (key) => (
                <div key={key} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border overflow-x-auto">
        <div className="p-8 text-center text-red-600">
          <p>Error loading data</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={`p-4 font-semibold text-sm text-gray-700 ${column.className || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={keyExtractor(item)} className={rowClassName}>
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`p-4 ${column.className || ""}`}
                  >
                    {column.cell
                      ? column.cell(item)
                      : column.accessor
                        ? String(item[column.accessor])
                        : null}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="p-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
