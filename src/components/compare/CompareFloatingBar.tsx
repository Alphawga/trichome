"use client";

import Link from "next/link";
import { useCompare } from "@/app/contexts/compare-context";
import { CompareIcon, XIcon } from "@/components/ui/icons";

export function CompareFloatingBar() {
    const { comparedProductIds, clearCompare } = useCompare();

    if (comparedProductIds.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-[#1E3024] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <CompareIcon className="w-5 h-5" />
                    <span className="font-medium font-body text-sm">
                        {comparedProductIds.length} Product
                        {comparedProductIds.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={clearCompare}
                        className="text-white/60 hover:text-white text-xs font-medium uppercase tracking-wider transition-colors"
                    >
                        Clear
                    </button>

                    <div className="w-px h-4 bg-white/20"></div>

                    <Link
                        href="/compare"
                        className="text-sm font-bold uppercase tracking-wide hover:underline decoration-1 underline-offset-4"
                    >
                        Compare
                    </Link>
                </div>
            </div>
        </div>
    );
}
