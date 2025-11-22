# Admin Section Coding Patterns Reference

Quick reference guide for implementing admin features following established patterns.

---

## 1. Page Component Structure

```typescript
"use client";

import type { EntityStatus } from "@prisma/client";
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
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { EntityFormSheet } from "./EntityFormSheet";
import { EntityViewSheet } from "./EntityViewSheet";

type EntityWithRelations = Entity & {
  // Add relations here
};

export default function AdminEntityPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EntityStatus | "All">("All");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<string | undefined>();
  const [viewingEntityId, setViewingEntityId] = useState<string | undefined>();
  const [deletingEntityId, setDeletingEntityId] = useState<string | null>(null);

  // Queries
  const entitiesQuery = trpc.getEntities.useQuery(
    {
      page: 1,
      limit: 20,
      search: searchTerm.trim() || undefined,
      status: statusFilter === "All" ? undefined : statusFilter,
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  );

  const statsQuery = trpc.getEntityStats.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const deleteMutation = trpc.deleteEntity.useMutation({
    onSuccess: () => {
      entitiesQuery.refetch();
      setDeletingEntityId(null);
      toast.success("Entity deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete entity: ${error.message}`);
      setDeletingEntityId(null);
    },
  });

  // Handlers
  const handleAdd = () => {
    setEditingEntityId(undefined);
    setSheetOpen(true);
  };

  const handleEdit = useCallback((id: string) => {
    setEditingEntityId(id);
    setSheetOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this entity?")) {
        return;
      }
      setDeletingEntityId(id);
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (_error) {
        // Error handled in mutation
      }
    },
    [deleteMutation]
  );

  const handleView = useCallback((id: string) => {
    setViewingEntityId(id);
    setViewSheetOpen(true);
  }, []);

  const handleExportCSV = () => {
    // Implement CSV export
    exportToCSV(entities, columns, "entities.csv");
  };

  // Table Columns
  const columns: Column<EntityWithRelations>[] = useMemo(
    () => [
      {
        header: "Name",
        cell: (entity) => (
          <span className="font-medium text-gray-900">{entity.name}</span>
        ),
      },
      {
        header: "Status",
        cell: (entity) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              entity.status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {entity.status}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: (entity) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Actions"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleView(entity.id)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEdit(entity.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Entity
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(entity.id)}
                disabled={deletingEntityId === entity.id}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                {deletingEntityId === entity.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Entity
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [deletingEntityId, handleView, handleEdit, handleDelete]
  );

  const stats = statsQuery.data;
  const entities = entitiesQuery.data?.entities || [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entity Management</h1>
          <p className="text-gray-600">Manage your entities</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Entity
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsQuery.isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))
        ) : stats ? (
          <>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="w-6 h-6 text-blue-600">📦</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Entities</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total || 0}
                  </p>
                </div>
              </div>
            </div>
            {/* Add more stat cards */}
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            Failed to load statistics
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search entities..."
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
              setStatusFilter(e.target.value as EntityStatus | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="All">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
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
        data={entities}
        isLoading={entitiesQuery.isLoading}
        error={entitiesQuery.error}
        onRetry={() => entitiesQuery.refetch()}
        emptyMessage="No entities found matching your filters"
        keyExtractor={(entity) => entity.id}
      />

      {/* Form Sheet */}
      <EntityFormSheet
        entityId={editingEntityId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={() => {
          entitiesQuery.refetch();
          statsQuery.refetch();
        }}
      />

      {/* View Sheet */}
      <EntityViewSheet
        entityId={viewingEntityId}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />
    </div>
  );
}
```

---

## 2. Form Sheet Component Structure

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EntityStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

const entitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  status: z.nativeEnum(EntityStatus),
  // Add more fields
});

type EntityInput = z.infer<typeof entitySchema>;

interface EntityFormSheetProps {
  entityId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EntityFormSheet({
  entityId,
  open,
  onOpenChange,
  onSuccess,
}: EntityFormSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EntityInput>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: EntityStatus.ACTIVE,
    },
  });

  const entityQuery = trpc.getEntityById.useQuery(
    entityId ? { id: entityId } : { id: "" },
    { enabled: !!entityId && open }
  );

  const createMutation = trpc.createEntity.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      reset();
      toast.success("Entity created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create entity: ${error.message}`);
    },
  });

  const updateMutation = trpc.updateEntity.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      toast.success("Entity updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update entity: ${error.message}`);
    },
  });

  // Auto-generate slug from name
  const entityName = watch("name");
  useEffect(() => {
    if (!entityId && entityName) {
      const slug = entityName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [entityName, entityId, setValue]);

  // Load entity data for editing
  useEffect(() => {
    if (entityQuery.data && entityId) {
      reset({
        name: entityQuery.data.name,
        slug: entityQuery.data.slug,
        description: entityQuery.data.description || "",
        status: entityQuery.data.status,
      });
    } else if (!entityId) {
      reset({
        name: "",
        slug: "",
        description: "",
        status: EntityStatus.ACTIVE,
      });
    }
  }, [entityQuery.data, entityId, reset]);

  const onSubmit = async (data: EntityInput) => {
    if (entityId) {
      await updateMutation.mutateAsync({ id: entityId, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {entityId ? "Edit Entity" : "Create New Entity"}
          </SheetTitle>
          <SheetDescription>
            {entityId
              ? "Update entity information"
              : "Fill in the details to create a new entity"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name", { required: "Name is required" })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Entity name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="text-gray-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              {...register("slug", { required: "Slug is required" })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="entity-slug"
            />
            {errors.slug && (
              <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              {...register("status")}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value={EntityStatus.ACTIVE}>Active</option>
              <option value={EntityStatus.INACTIVE}>Inactive</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-500 mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Saving..."
                : entityId
                  ? "Update Entity"
                  : "Create Entity"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

---

## 3. View Sheet Component Structure

```typescript
"use client";

import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

interface EntityViewSheetProps {
  entityId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntityViewSheet({
  entityId,
  open,
  onOpenChange,
}: EntityViewSheetProps) {
  const entityQuery = trpc.getEntityById.useQuery(
    entityId ? { id: entityId } : { id: "" },
    { enabled: !!entityId && open }
  );

  if (!entityId) return null;

  const entity = entityQuery.data;

  if (entityQuery.isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!entity) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <div className="text-center py-8 text-gray-500">
            Entity not found
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{entity.name}</SheetTitle>
          <SheetDescription>Entity Details</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Entity Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{entity.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Slug</p>
                <p className="font-medium">{entity.slug}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    entity.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {entity.status}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dates</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(entity.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated</p>
                <p className="font-medium">
                  {new Date(entity.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

## 4. CSV Export Utility

```typescript
// src/utils/csv-export.ts

export function exportToCSV<T>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
) {
  if (!data.length) {
    toast.error("No data to export");
    return;
  }

  // Create CSV header
  const header = columns.map((col) => col.label).join(",");

  // Create CSV rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        // Handle null/undefined
        if (value === null || value === undefined) return "";
        // Handle objects/arrays
        if (typeof value === "object") {
          return JSON.stringify(value).replace(/,/g, ";");
        }
        // Escape commas and quotes
        return String(value).replace(/,/g, ";").replace(/"/g, '""');
      })
      .join(",")
  );

  // Combine header and rows
  const csv = [header, ...rows].join("\n");

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

---

## 5. Common Color Classes

```typescript
// Status Colors
const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

// Button Colors
const buttonColors = {
  primary: "bg-[#38761d] text-white hover:bg-opacity-90",
  secondary: "border border-gray-300 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};
```

---

## 6. Loading Skeleton Pattern

```typescript
{isLoading ? (
  [1, 2, 3, 4].map((i) => (
    <div
      key={i}
      className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse"
    >
      <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  ))
) : (
  // Actual content
)}
```

---

## 7. Error Handling Pattern

```typescript
const mutation = trpc.someMutation.useMutation({
  onSuccess: () => {
    query.refetch();
    toast.success("Operation successful");
  },
  onError: (error) => {
    console.error("Operation failed:", error);
    toast.error(`Failed: ${error.message}`);
  },
});
```

---

*Use these patterns consistently across all admin features for maintainability and consistency.*

