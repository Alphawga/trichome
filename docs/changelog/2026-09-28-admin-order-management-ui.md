# Admin order management UI

## Changed

- Rebuilt the order preview as a read-only drawer with exact status badges, customer phone, contact controls, item details, totals, and a clear link to the management page.
- Kept the compact table-row action menu and separated Preview, Manage order, and Track shipment into distinct actions.
- Reworked the full order page into a responsive management workspace with one primary status action and secondary actions in a restrained overflow menu.
- Replaced emoji controls and unfinished actions with consistent icons, reusable UI primitives, and focused dialogs for status, notes, tracking, and cancellation.
- Centralized order and payment labels so statuses such as Confirmed, Ready for pickup, and Partially refunded are no longer collapsed into misleading values.
- Added Cloudinary thumbnail size hints and regression coverage for the shared order display helpers.

## Validation

- Targeted Biome checks pass for all changed order files.
- Both admin order routes compile and return successfully in Next.js development mode.
- All 106 Jest tests pass.
- Full-project type-check and lint remain blocked by unrelated pre-existing errors outside the admin order files.
