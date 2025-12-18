"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import superjson from "superjson";
import { AuthProvider } from "@/app/contexts/auth-context";
import { CompareProvider } from "@/app/contexts/compare-context";
import { Toaster } from "@/components/ui/sonner";
import { getBaseUrl } from "@/lib/helper-function";
import { trpc } from "@/utils/trpc";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CompareProvider>
              {children}
            </CompareProvider>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
