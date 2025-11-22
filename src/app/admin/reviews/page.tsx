"use client";

import type { ReviewStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Column, DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EditIcon,
  ExportIcon,
  EyeIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { exportToCSV, type CSVColumn } from "@/utils/csv-export";
import { ReviewViewSheet } from "./ReviewViewSheet";
import { ReviewModerationSheet } from "./ReviewModerationSheet";

type ReviewWithRelations = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: ReviewStatus;
  helpful_count: number;
  created_at: Date;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
};

export default function AdminReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "All">("All");
  const [ratingFilter, setRatingFilter] = useState<number | "All">("All");
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [moderationSheetOpen, setModerationSheetOpen] = useState(false);
  const [viewingReviewId, setViewingReviewId] = useState<string | undefined>();
  const [moderatingReviewId, setModeratingReviewId] = useState<
    string | undefined
  >();

  const reviewsQuery = trpc.getAllReviews.useQuery(
    {
      page: 1,
      limit: 100,
      status: statusFilter !== "All" ? statusFilter : undefined,
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  const statsQuery = trpc.getReviewStats.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const updateStatusMutation = trpc.updateReviewStatus.useMutation({
    onSuccess: () => {
      reviewsQuery.refetch();
      statsQuery.refetch();
      toast.success("Review status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update review: ${error.message}`);
    },
  });

  const reviews = reviewsQuery.data?.reviews || [];

  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter !== "All" && review.rating !== ratingFilter) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        review.product.name.toLowerCase().includes(searchLower) ||
        review.user.email.toLowerCase().includes(searchLower) ||
        (review.title?.toLowerCase().includes(searchLower) ?? false) ||
        (review.comment?.toLowerCase().includes(searchLower) ?? false)
      );
    }
    return true;
  });

  const handleViewReview = useCallback((id: string) => {
    setViewingReviewId(id);
    setViewSheetOpen(true);
  }, []);

  const handleModerateReview = useCallback((id: string) => {
    setModeratingReviewId(id);
    setModerationSheetOpen(true);
  }, []);

  const handleQuickApprove = useCallback(
    async (id: string) => {
      await updateStatusMutation.mutateAsync({
        id,
        status: "APPROVED",
      });
    },
    [updateStatusMutation],
  );

  const handleQuickReject = useCallback(
    async (id: string) => {
      await updateStatusMutation.mutateAsync({
        id,
        status: "REJECTED",
      });
    },
    [updateStatusMutation],
  );

  const handleExportCSV = () => {
    const columns: CSVColumn<ReviewWithRelations>[] = [
      {
        key: (r) => r.product.name,
        label: "Product",
      },
      {
        key: (r) =>
          r.user.first_name || r.user.last_name
            ? `${r.user.first_name || ""} ${r.user.last_name || ""}`.trim()
            : r.user.email,
        label: "Customer",
      },
      { key: "rating", label: "Rating" },
      { key: (r) => r.title || "No title", label: "Title" },
      {
        key: (r) => (r.status === "APPROVED" ? "Approved" : r.status === "PENDING" ? "Pending" : "Rejected"),
        label: "Status",
      },
      { key: "helpful_count", label: "Helpful Count" },
      {
        key: (r) => new Date(r.created_at).toLocaleDateString(),
        label: "Date",
      },
    ];
    exportToCSV(filteredReviews, columns, "reviews");
  };

  const stats = statsQuery.data;

  const columns: Column<ReviewWithRelations>[] = useMemo(
    () => [
      {
        header: "Product",
        cell: (review) => (
          <div>
            <Link
              href={`/products/${review.product.id}`}
              className="font-medium text-[#40702A] hover:text-[#1E3024] hover:underline"
            >
              {review.product.name}
            </Link>
            <p className="text-sm text-gray-500">ID: {review.product.id.slice(0, 8)}</p>
          </div>
        ),
      },
      {
        header: "Customer",
        cell: (review) => (
          <div>
            <span className="font-medium text-gray-900">
              {review.user.first_name || review.user.last_name
                ? `${review.user.first_name || ""} ${review.user.last_name || ""}`.trim()
                : "No name"}
            </span>
            <p className="text-sm text-gray-500">{review.user.email}</p>
          </div>
        ),
      },
      {
        header: "Rating",
        cell: (review) => (
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="font-medium">{review.rating}/5</span>
          </div>
        ),
      },
      {
        header: "Review",
        cell: (review) => (
          <div>
            {review.title && (
              <p className="font-medium text-gray-900">{review.title}</p>
            )}
            {review.comment && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {review.comment}
              </p>
            )}
            {!review.title && !review.comment && (
              <p className="text-sm text-gray-400">No comment</p>
            )}
          </div>
        ),
      },
      {
        header: "Status",
        cell: (review) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              review.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : review.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {review.status === "APPROVED"
              ? "Approved"
              : review.status === "PENDING"
                ? "Pending"
                : "Rejected"}
          </span>
        ),
      },
      {
        header: "Helpful",
        cell: (review) => (
          <span className="text-gray-600">{review.helpful_count}</span>
        ),
      },
      {
        header: "Date",
        cell: (review) => (
          <span className="text-gray-600">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: (review) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Actions"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <title>Open actions</title>
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleViewReview(review.id)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleModerateReview(review.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Moderate
              </DropdownMenuItem>
              {review.status === "PENDING" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleQuickApprove(review.id)}
                    className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50"
                  >
                    ✓ Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleQuickReject(review.id)}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    ✗ Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      handleViewReview,
      handleModerateReview,
      handleQuickApprove,
      handleQuickReject,
    ],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <p className="text-gray-600">Moderate and manage product reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">⭐</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? "..." : stats?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 text-yellow-600">⏳</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? "..." : stats?.pending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">✓</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? "..." : stats?.approved || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 text-red-600">✗</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? "..." : stats?.rejected || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by product, customer, or review content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ReviewStatus | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="All">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(
                e.target.value === "All" ? "All" : Number.parseInt(e.target.value, 10),
              )
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            <ExportIcon /> Export CSV
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredReviews}
        isLoading={reviewsQuery.isLoading}
        error={reviewsQuery.error}
        onRetry={() => reviewsQuery.refetch()}
        emptyMessage="No reviews found matching your filters"
        keyExtractor={(review) => review.id}
      />

      {/* View Sheet */}
      <ReviewViewSheet
        reviewId={viewingReviewId}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />

      {/* Moderation Sheet */}
      <ReviewModerationSheet
        reviewId={moderatingReviewId}
        open={moderationSheetOpen}
        onOpenChange={setModerationSheetOpen}
        onSuccess={() => {
          reviewsQuery.refetch();
          statsQuery.refetch();
        }}
      />
    </div>
  );
}

