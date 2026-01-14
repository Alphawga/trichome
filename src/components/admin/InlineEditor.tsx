"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ui/image-uploader";
import { LogoLoader } from "@/components/ui/logo-loader";
import type { FieldType } from "@/lib/constants/content-types";
import { trpc } from "@/utils/trpc";

// Available pages for link dropdown
const AVAILABLE_PAGES = [
    { value: "/", label: "Home" },
    { value: "/products", label: "Products" },
    { value: "/products?sort=featured", label: "Products - Featured" },
    { value: "/products?sort=popular", label: "Products - Popular" },
    { value: "/products?sort=newest", label: "Products - New Arrivals" },
    { value: "/brands", label: "Brands" },
    { value: "/about", label: "About Us" },
    { value: "/consultation", label: "Consultation" },
    { value: "/contact", label: "Contact" },
    { value: "/faq", label: "FAQ" },
] as const;

interface ContentData {
    id?: string;
    type: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    content?: string | null;
    button_text?: string | null;
    button_link?: string | null;
    image_url?: string | null;
}

interface InlineEditorProps {
    contentType: string;
    sectionName: string;
    initialData?: ContentData | null;
    onSave: () => void;
    onCancel: () => void;
    /** Which fields to show in the editor */
    fields?: FieldType[];
}

/**
 * Inline editor form for editing content sections.
 * Only shows the fields specified in the fields prop.
 */
export function InlineEditor({
    contentType,
    sectionName,
    initialData,
    onSave,
    onCancel,
    fields = ["title", "subtitle", "description", "image_url"],
}: InlineEditorProps) {
    const [formData, setFormData] = useState<ContentData>({
        type: contentType,
        title: "",
        subtitle: "",
        description: "",
        content: "",
        button_text: "",
        button_link: "",
        image_url: "",
    });

    const utils = trpc.useUtils();

    const upsertMutation = trpc.upsertContent.useMutation({
        onSuccess: () => {
            toast.success(`${sectionName} updated successfully`);
            utils.getPageContent.invalidate();
            utils.getContentByType.invalidate();
            onSave();
        },
        onError: (error) => {
            toast.error(`Failed to update: ${error.message}`);
        },
    });

    // Initialize form with existing data
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                subtitle: initialData.subtitle || "",
                description: initialData.description || "",
                content: initialData.content || "",
                button_text: initialData.button_text || "",
                button_link: initialData.button_link || "",
                image_url: initialData.image_url || "",
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        upsertMutation.mutate({
            type: contentType,
            title: formData.title || "",
            subtitle: formData.subtitle || null,
            description: formData.description || null,
            content: formData.content || null,
            button_text: formData.button_text || null,
            button_link: formData.button_link || null,
            image_url: formData.image_url || null,
            status: "PUBLISHED",
        });
    };

    const updateField = (
        field: keyof ContentData,
        value: string | null | undefined,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Check which fields to show
    const showTitle = fields.includes("title");
    const showSubtitle = fields.includes("subtitle");
    const showDescription = fields.includes("description");
    const showContent = fields.includes("content");
    const showButtonText = fields.includes("button_text");
    const showButtonLink = fields.includes("button_link");
    const showImage = fields.includes("image_url");

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white">
            <div className="space-y-4">
                {/* Title Field */}
                {showTitle && (
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#38761d] focus:border-[#38761d] text-gray-900"
                            placeholder="Enter title..."
                        />
                    </div>
                )}

                {/* Subtitle Field */}
                {showSubtitle && (
                    <div>
                        <label
                            htmlFor="subtitle"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Subtitle
                        </label>
                        <input
                            id="subtitle"
                            type="text"
                            value={formData.subtitle || ""}
                            onChange={(e) => updateField("subtitle", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#38761d] focus:border-[#38761d] text-gray-900"
                            placeholder="Enter subtitle..."
                        />
                    </div>
                )}

                {/* Description Field */}
                {showDescription && (
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) => updateField("description", e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#38761d] focus:border-[#38761d] text-gray-900"
                            placeholder="Enter description..."
                        />
                    </div>
                )}

                {/* Content Field (for longer text) */}
                {showContent && (
                    <div>
                        <label
                            htmlFor="content"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={formData.content || ""}
                            onChange={(e) => updateField("content", e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#38761d] focus:border-[#38761d] text-gray-900"
                            placeholder="Enter content... (Use double line breaks for paragraphs)"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Use blank lines to separate paragraphs
                        </p>
                    </div>
                )}

                {/* Button Text and Link */}
                {(showButtonText || showButtonLink) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {showButtonText && (
                            <div>
                                <label
                                    htmlFor="button_text"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Button Text
                                </label>
                                <input
                                    id="button_text"
                                    type="text"
                                    value={formData.button_text || ""}
                                    onChange={(e) => updateField("button_text", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#38761d] focus:border-[#38761d] text-gray-900"
                                    placeholder="e.g. Shop Now"
                                />
                            </div>
                        )}
                        {showButtonLink && (
                            <div>
                                <label
                                    htmlFor="button_link"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Button Link
                                </label>
                                <select
                                    id="button_link"
                                    value={formData.button_link || ""}
                                    onChange={(e) => updateField("button_link", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#38761d] focus:border-[#38761d] text-gray-900 bg-white"
                                >
                                    <option value="">Select a page...</option>
                                    {AVAILABLE_PAGES.map((page) => (
                                        <option key={page.value} value={page.value}>
                                            {page.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {/* Image Upload */}
                {showImage && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image
                        </label>
                        <ImageUploader
                            value={formData.image_url || undefined}
                            onChange={(url) => updateField("image_url", url)}
                            onRemove={() => updateField("image_url", "")}
                            disabled={upsertMutation.isPending}
                            folder="content"
                        />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={upsertMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={upsertMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#38761d] rounded-lg hover:bg-[#2a5a15] disabled:opacity-50 flex items-center gap-2"
                >
                    {upsertMutation.isPending ? (
                        <>
                            <LogoLoader size="sm" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>
        </form>
    );
}
