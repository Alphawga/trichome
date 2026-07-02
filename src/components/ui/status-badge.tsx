import type * as React from "react";

import { Badge } from "@/components/ui/badge";

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface StatusBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  variant: StatusVariant;
}

export function StatusBadge({
  variant,
  className,
  ...props
}: StatusBadgeProps) {
  return <Badge variant={variant} className={className} {...props} />;
}
