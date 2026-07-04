"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";

export function PageViewTracker() {
  const pathname = usePathname();
  const trackPageView = trpc.trackPageView.useMutation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: trackPageView.mutate is stable in effect but not memoized by useMutation; only pathname should retrigger this
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    trackPageView.mutate();
  }, [pathname]);

  return null;
}
