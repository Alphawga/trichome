# 2026-07-02 — Admin dashboard table/badge/color redesign

## What changed

Admin dashboard tables and status pills were inconsistent: a shared `DataTable<T>` (hand-rolled `<table>`) existed but 4 pages bypassed it with copy-pasted raw markup, status badges were reimplemented per page as inline ternaries, and three different "brand green" values were in play (`#38761d` hardcoded across 31 admin files, a dead `--trichomes-primary-green` CSS var, and the real brand color `trichomes.primary: #528c35`).

- Added missing shadcn/ui primitives: `table.tsx`, `badge.tsx` (extended with `success`/`warning`/`danger`/`info`/`neutral` variants), `card.tsx`, `skeleton.tsx`.
- Repointed `--primary` in `globals.css` to the real brand green (`hsl(100 45% 38%)` ≈ `#528c35`); deleted the dead `--trichomes-primary-green` var.
- Rebuilt `src/components/ui/data-table.tsx` internally on the new shadcn `Table` primitives (same `Column<T>`/`DataTableProps<T>` API, so no call-site changes needed); added an optional `onRowClick` prop.
- Added `src/components/ui/status-badge.tsx`, rolled out across products/orders/customers/brands/categories/reviews/payments/consultations/promotions, replacing inline `bg-*-100 text-*-800` ternaries.
- Migrated the 4 raw-`<table>` holdouts (dashboard recent-orders/products, permissions users table, order-detail line items, analytics table) onto `DataTable`.
- Rewrote `src/components/admin/admin-header.tsx` to use shadcn `DropdownMenu` (Radix) instead of hand-rolled `useRef`+`mousedown` click-outside dropdowns.
- Fixed sidebar active-state color token; converted dashboard stat cards to `Card`/`CardContent`.

## Why

User request: "admin is very ugly, tables and designs are bad." Root causes were concrete (missing primitives, duplicated markup, color drift), not vague — see the approved plan for the full audit.

## Bugs caught and fixed during `/code-review`

- **Permissions page dropdown actions triggered the row's click-to-view handler.** Adding a row-click (`onRowClick`) to `DataTable` for the permissions page meant React's synthetic-event bubbling carried dropdown-item clicks (Edit/Delete/Manage Permissions) up to the row, even though the items render via a Radix Portal — only the dropdown *trigger* button had `stopPropagation()`, not the menu items. Clicking "Delete User" would also navigate away mid-action. Fixed by stopping propagation once at `DropdownMenuContent`.
- **Order-detail line-items table showed an unwanted hover highlight.** `rowClassName="border-b last:border-0"` (intended to disable hover, matching the original static table) couldn't override shadcn `TableRow`'s baked-in `hover:bg-muted/50` — `tailwind-merge` only cancels a *competing* utility, and the override had no `hover:*` class at all. Fixed by adding `hover:bg-transparent` to that call site.

## Still open (flagged, not fixed — color/taxonomy decisions, not bugs)

- `StatusBadge`'s fixed 5-variant palette (`success`/`warning`/`danger`/`info`/`neutral`) can't represent every status distinction the old hand-rolled colors had: dashboard "Processing" vs "Shipped" (was blue/purple, now both `info`) and payments "Refunded" (was a distinct orange, now `info`) lost their unique color. Needs a product decision on whether to add a 6th variant.
- Order-detail page (`orders/[id]/page.tsx`) still has several hardcoded `#38761d`/`#40702A` links/buttons outside the table cell this pass touched — one page, two shades of green.
- Status→variant mapping is duplicated per page (~9 files) rather than centralized; consistent with the project's "no premature abstraction" convention but means a new enum value requires a manual sweep with no compiler-enforced touchpoint.
- Sidebar remains a fixed, non-collapsible `w-64` column — likely broken on mobile/tablet; explicitly out of scope for this pass (flagged in the original plan).
- `DataTable`'s pagination controls still use raw Tailwind classes instead of the shadcn `Button` component used elsewhere in this pass.
