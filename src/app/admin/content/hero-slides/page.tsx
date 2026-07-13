"use client";

import type { Content } from "@prisma/client";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { CloudinaryImage as Image } from "@/components/ui/cloudinary-image";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { type Column, DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { trpc } from "@/utils/trpc";
import { HeroSlideFormSheet } from "./HeroSlideFormSheet";

export default function AdminHeroSlidesPage() {
  const [editSlideId, setEditSlideId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const slidesQuery = trpc.getHeroSlides.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const slides = slidesQuery.data || [];

  const utils = trpc.useUtils();

  const deleteMutation = trpc.deleteContent.useMutation({
    onSuccess: () => {
      toast.success("Slide deleted successfully");
      utils.getHeroSlides.invalidate();
      utils.getContentByType.invalidate();
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete slide: ${error.message}`);
    },
  });

  const updateMutation = trpc.updateContent.useMutation({
    onSuccess: () => {
      utils.getHeroSlides.invalidate();
      utils.getContentByType.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update slide: ${error.message}`);
    },
  });

  const handleAddSlide = useCallback(() => setIsCreating(true), []);
  const handleEditSlide = useCallback((id: string) => setEditSlideId(id), []);
  const selectedEditSlide = slides.find((s) => s.id === editSlideId) || null;

  const handleDeleteSlide = useCallback((id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await deleteMutation.mutateAsync({ id: deleteTargetId });
    }
  };

  const handleTogglePublish = useCallback(
    (slide: Content) => {
      updateMutation.mutate({
        id: slide.id,
        status: slide.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
      });
    },
    [updateMutation],
  );

  const columns: Column<Content>[] = useMemo(
    () => [
      {
        header: "Preview",
        className: "w-24",
        cell: (slide) => (
          <div className="relative w-16 h-12 rounded overflow-hidden border border-gray-200 bg-black">
            {slide.video_url ? (
              <video
                src={slide.video_url}
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={slide.image_url || "/hero/hero-image.jpg"}
                alt={slide.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
        ),
      },
      {
        header: "Title",
        cell: (slide) => (
          <div>
            <span className="font-medium text-gray-900">{slide.title}</span>
            <p className="text-sm text-gray-500 line-clamp-1">
              {slide.description}
            </p>
          </div>
        ),
      },
      {
        header: "Order",
        className: "w-20",
        cell: (slide) => (
          <span className="text-gray-600">{slide.sort_order}</span>
        ),
      },
      {
        header: "Status",
        cell: (slide) => (
          <StatusBadge
            variant={slide.status === "PUBLISHED" ? "success" : "neutral"}
          >
            {slide.status}
          </StatusBadge>
        ),
      },
      {
        header: "Actions",
        className: "w-20",
        cell: (slide) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Actions"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Open actions</title>
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleEditSlide(slide.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Slide
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTogglePublish(slide)}
                className="cursor-pointer"
              >
                {slide.status === "PUBLISHED" ? "⏸️" : "▶️"}
                <span className="ml-2">
                  {slide.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteSlide(slide.id)}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEditSlide, handleTogglePublish, handleDeleteSlide],
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <Link
            href="/admin/content"
            className="text-sm text-gray-500 hover:underline"
          >
            ← Website Content
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
          <p className="text-gray-600">
            Manage the rotating slides shown in the homepage hero section
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddSlide}
          className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      <DataTable
        columns={columns}
        data={slides}
        isLoading={slidesQuery.isLoading}
        error={slidesQuery.error}
        onRetry={() => slidesQuery.refetch()}
        emptyMessage="No hero slides yet. Add one to replace the default hero content."
        keyExtractor={(slide) => slide.id}
      />

      <HeroSlideFormSheet
        slide={selectedEditSlide}
        nextSortOrder={slides.length}
        open={isCreating || !!editSlideId}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditSlideId(null);
          }
        }}
        onSuccess={() => {
          slidesQuery.refetch();
          setIsCreating(false);
          setEditSlideId(null);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete Slide"
        description="Are you sure you want to delete this hero slide? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
