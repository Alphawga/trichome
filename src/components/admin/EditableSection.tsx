"use client";

import { useState, type ReactNode } from "react";

interface EditableSectionProps {
    children: ReactNode;
    sectionName: string;
    isEditing: boolean;
    onEditClick: () => void;
    editForm: ReactNode;
}

/**
 * Wrapper component that makes a section editable.
 * Shows edit button on hover, toggles between preview and inline editor.
 */
export function EditableSection({
    children,
    sectionName,
    isEditing,
    onEditClick,
    editForm,
}: EditableSectionProps) {
    const [isHovered, setIsHovered] = useState(false);

    if (isEditing) {
        return (
            <div className="relative border-2 border-[#38761d] rounded-lg">
                {/* Edit Mode Header */}
                <div className="absolute -top-3 left-4 px-2 bg-white">
                    <span className="text-xs font-medium text-[#38761d]">
                        Editing: {sectionName}
                    </span>
                </div>
                {editForm}
            </div>
        );
    }

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Edit Button Overlay */}
            {isHovered && (
                <div className="absolute inset-0 bg-black/5 border-2 border-dashed border-[#38761d] rounded-lg z-10 pointer-events-none">
                    <div className="absolute top-2 right-2 pointer-events-auto">
                        <button
                            type="button"
                            onClick={onEditClick}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#38761d] text-white text-sm font-medium rounded-lg shadow-lg hover:bg-[#2a5a15] transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
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
                            Edit {sectionName}
                        </button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                        <span className="text-xs text-[#38761d] font-medium bg-white px-2 py-1 rounded shadow">
                            {sectionName}
                        </span>
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}
