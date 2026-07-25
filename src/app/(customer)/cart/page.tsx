import type { Metadata } from "next";
import { CartPageClient } from "./CartPageClient";

export const metadata: Metadata = { title: "Shopping Cart" };

export default function Page() {
  return <CartPageClient />;
}
