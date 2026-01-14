"use client";

import Link from "next/link";
import {
    EDITABLE_PAGES,
    type EditablePage,
} from "@/lib/constants/content-types";

export default function AdminContentPage() {
    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Website Content</h1>
                <p className="text-gray-600 mt-1">
                    Edit content and images shown on the main website
                </p>
            </div>

            {/* Page Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {EDITABLE_PAGES.map((page: EditablePage) => (
                    <Link
                        key={page.slug}
                        href={`/admin/content/${page.slug}`}
                        className="group block bg-white rounded-lg border border-gray-200 p-6 hover:border-[#38761d] hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#38761d] transition-colors">
                                    {page.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#38761d]/10 flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-[#38761d]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <title>Edit</title>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">
                                Editable sections
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {page.sections.map((section) => (
                                    <span
                                        key={section.type}
                                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                                    >
                                        {section.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
