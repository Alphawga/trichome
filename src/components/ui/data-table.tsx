"use client";

import type React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
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
  onRowClick?: (item: T) => void;
  // Pagination props
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
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
  onRowClick,
  pagination,
  onPageChange,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border overflow-x-auto">
        <div className="p-8 space-y-4">
          {Array.from({ length: loadingRows }, (_, i) => `row-${i}`).map(
            (key) => (
              <div key={key} className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border overflow-x-auto">
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

  const renderPagination = () => {
    if (!pagination || !onPageChange) return null;

    const { page, pages, total, limit } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    // Generate page numbers to show
    const getPageNumbers = () => {
      const pageNumbers: (number | string)[] = [];
      const maxVisiblePages = 5;

      if (pages <= maxVisiblePages) {
        // Show all pages
        for (let i = 1; i <= pages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show first, last, and pages around current
        if (page <= 3) {
          for (let i = 1; i <= 4; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push("...");
          pageNumbers.push(pages);
        } else if (page >= pages - 2) {
          pageNumbers.push(1);
          pageNumbers.push("...");
          for (let i = pages - 3; i <= pages; i++) {
            pageNumbers.push(i);
          }
        } else {
          pageNumbers.push(1);
          pageNumbers.push("...");
          for (let i = page - 1; i <= page + 1; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push("...");
          pageNumbers.push(pages);
        }
      }

      return pageNumbers;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-gray-50">
        {/* Info text */}
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{total}</span> results
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) =>
              pageNum === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-sm text-gray-500"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum as number)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="hover:bg-gray-50">
              {columns.map((column) => (
                <TableHead
                  key={column.header}
                  className={cn(
                    "p-4 h-auto font-semibold text-sm text-gray-700 whitespace-normal",
                    column.className,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow
                  key={keyExtractor(item)}
                  className={cn(rowClassName, onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.header}
                      className={cn("p-4 whitespace-normal", column.className)}
                    >
                      {column.cell
                        ? column.cell(item)
                        : column.accessor
                          ? String(item[column.accessor])
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="p-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {renderPagination()}
    </div>
  );
}
