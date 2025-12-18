"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { toast } from "sonner";

interface CompareContextType {
    comparedProductIds: string[];
    addToCompare: (productId: string) => void;
    removeFromCompare: (productId: string) => void;
    clearCompare: () => void;
    isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_PRODUCTS = 4;
const STORAGE_KEY = "trichomes_compare_ids";

export function CompareProvider({ children }: { children: ReactNode }) {
    const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setComparedProductIds(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load compare list", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedProductIds));
        }
    }, [comparedProductIds, isLoaded]);

    const addToCompare = (productId: string) => {
        if (comparedProductIds.includes(productId)) {
            toast.info("Product is already in comparison list");
            return;
        }

        if (comparedProductIds.length >= MAX_COMPARE_PRODUCTS) {
            toast.warning(
                `You can strictly compare up to ${MAX_COMPARE_PRODUCTS} products. Please remove one to add another.`,
            );
            return;
        }

        setComparedProductIds((prev) => [...prev, productId]);
        toast.success("Added to comparison");
    };

    const removeFromCompare = (productId: string) => {
        setComparedProductIds((prev) => prev.filter((id) => id !== productId));
        // Toast is optional here, maybe distracting if removing from a list UI
    };

    const clearCompare = () => {
        setComparedProductIds([]);
        toast.success("Comparison list cleared");
    };

    const isInCompare = (productId: string) => {
        return comparedProductIds.includes(productId);
    };

    return (
        <CompareContext.Provider
            value={{
                comparedProductIds,
                addToCompare,
                removeFromCompare,
                clearCompare,
                isInCompare,
            }}
        >
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error("useCompare must be used within a CompareProvider");
    }
    return context;
}
