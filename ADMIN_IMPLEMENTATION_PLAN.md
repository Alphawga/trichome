# Admin Section Implementation Plan

## Overview
This document outlines the implementation plan for all admin features and fixes, following established coding standards and best practices.

---

## Coding Standards & Patterns

### Component Structure
- **Client Components**: Use `"use client"` directive
- **Form Handling**: Use `react-hook-form` with `zodResolver` for validation
- **API Calls**: Use tRPC (`trpc.useQuery`, `trpc.useMutation`)
- **UI Components**: Use Sheet components for modals, DataTable for listings
- **Notifications**: Use `toast` from `sonner`
- **Naming Conventions**:
  - Pages: `AdminXxxPage` (e.g., `AdminBrandsPage`)
  - Form Sheets: `XxxFormSheet` (e.g., `BrandFormSheet`)
  - View Sheets: `XxxViewSheet` (e.g., `BrandViewSheet`)
  - Types: `XxxWithRelations` for extended types

### File Structure
```
src/app/admin/
  ├── [feature]/
  │   ├── page.tsx              # Main listing page
  │   ├── [feature]FormSheet.tsx # Create/Edit form
  │   └── [feature]ViewSheet.tsx # View details
```

### Common Patterns
1. **State Management**: Use `useState` for local state, tRPC for server state
2. **Loading States**: Show skeleton loaders during data fetching
3. **Error Handling**: Display error messages with retry options
4. **Empty States**: Show helpful messages when no data exists
5. **Filtering**: Implement search, status, and category filters
6. **Statistics Cards**: Display key metrics at the top of pages
7. **Actions Dropdown**: Use dropdown menu for row actions
8. **Confirmation Dialogs**: Use `confirm()` for destructive actions

---

## Phase 1: Critical Fixes (Priority: HIGH)

### Task 1.1: Fix Order Detail Page
**File**: `src/app/admin/orders/[id]/page.tsx`

**Current Issue**: Uses mock data instead of tRPC queries

**Implementation Steps**:
1. Replace mock data with tRPC query:
   ```typescript
   const orderQuery = trpc.getOrderByNumber.useQuery(
     { orderNumber: orderId },
     { enabled: !!orderId }
   );
   ```

2. Implement order status update mutation:
   ```typescript
   const updateStatusMutation = trpc.updateOrderStatus.useMutation({
     onSuccess: () => {
       orderQuery.refetch();
       toast.success("Order status updated successfully");
     },
     onError: (error) => {
       toast.error(`Failed to update status: ${error.message}`);
     },
   });
   ```

3. Implement tracking number update:
   - Add `updateTrackingNumber` mutation in `src/server/modules/orders.ts`
   - Create form input for tracking number
   - Connect to mutation

4. Connect quick actions:
   - Send Tracking Email: Implement email sending (use tRPC mutation)
   - Print Shipping Label: Generate PDF (client-side or server-side)
   - Generate Invoice: Create invoice PDF
   - Cancel Order: Use `updateOrderStatus` with CANCELLED status

5. Display order status history from `status_history` relation

**Estimated Time**: 1-2 days

**Dependencies**: 
- Verify `updateOrderStatus` mutation exists in `src/server/modules/orders.ts`
- Create `updateTrackingNumber` mutation if missing

---

### Task 1.2: Implement CSV Export Utility
**File**: `src/utils/csv-export.ts` (new)

**Implementation Steps**:
1. Create CSV export utility function:
   ```typescript
   export function exportToCSV<T>(
     data: T[],
     columns: { key: keyof T; label: string }[],
     filename: string
   ) {
     // Implementation
   }
   ```

2. Implement for each entity:
   - Products export
   - Orders export
   - Customers export
   - Promotions export

3. Add export buttons to all admin pages:
   - Replace `console.log` with actual export function
   - Show loading state during export
   - Handle errors gracefully

**Estimated Time**: 1 day

**Files to Update**:
- `src/app/admin/products/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/customers/page.tsx`
- `src/app/admin/promotions/page.tsx`

---

### Task 1.3: Update Admin Sidebar Navigation
**File**: `src/components/admin/admin-sidebar.tsx`

**Implementation Steps**:
1. Add missing navigation items:
   ```typescript
   const navItems = [
     { path: "/admin", label: "Dashboard", icon: <InventoryIcon /> },
     { path: "/admin/products", label: "Products", icon: <ProductsIcon /> },
     { path: "/admin/categories", label: "Categories", icon: <CategoriesIcon /> },
     { path: "/admin/brands", label: "Brands", icon: <BrandsIcon /> },
     { path: "/admin/orders", label: "Orders", icon: <OrdersIcon /> },
     { path: "/admin/customers", label: "Customers", icon: <CustomersIcon /> },
     { path: "/admin/promotions", label: "Promotions", icon: <PromotionsIcon /> },
     { path: "/admin/consultations", label: "Consultations", icon: <ConsultationsIcon /> },
     { path: "/admin/reviews", label: "Reviews", icon: <ReviewsIcon /> },
     { path: "/admin/analytics", label: "Analytics", icon: <AnalyticsIcon /> },
     { path: "/admin/settings", label: "Settings", icon: <SettingsIcon /> },
     { path: "/admin/permissions", label: "Permissions", icon: <PermissionsIcon /> },
   ];
   ```

2. Add missing icons to `src/components/ui/icons.tsx`

**Estimated Time**: 30 minutes

---

## Phase 2: Essential Admin Pages (Priority: HIGH)

### Task 2.1: Brands Management
**Files to Create**:
- `src/app/admin/brands/page.tsx`
- `src/app/admin/brands/BrandFormSheet.tsx`
- `src/app/admin/brands/BrandViewSheet.tsx`

**Backend Requirements**:
- Verify/Implement tRPC procedures in `src/server/modules/brands.ts`:
  - `getBrands`
  - `getBrandById`
  - `createBrand`
  - `updateBrand`
  - `deleteBrand`
  - `getBrandStats`

**Implementation Steps**:

1. **Create Brands Listing Page** (`page.tsx`):
   - Follow pattern from `src/app/admin/products/page.tsx`
   - Display stats cards (Total Brands, Active, Inactive)
   - Implement filters (status, search)
   - Use DataTable component
   - Add "Add New Brand" button
   - Implement delete with confirmation

2. **Create Brand Form Sheet** (`BrandFormSheet.tsx`):
   - Follow pattern from `src/app/admin/categories/CategoryFormSheet.tsx`
   - Fields:
     - Name (required)
     - Slug (auto-generated from name)
     - Description (optional, textarea)
     - Logo (ImageUploader)
     - Image (ImageUploader, optional)
     - Status (ProductStatus enum: ACTIVE, INACTIVE, DRAFT)
     - Sort Order (number)
   - Validation with Zod schema
   - Handle create and update modes

3. **Create Brand View Sheet** (`BrandViewSheet.tsx`):
   - Display brand details
   - Show associated products count
   - Display logo and image
   - Show creation/update dates

**Estimated Time**: 2-3 days

**Dependencies**: 
- Verify brand tRPC procedures exist
- Create if missing

---

### Task 2.2: Consultations Management
**Files to Create**:
- `src/app/admin/consultations/page.tsx`
- `src/app/admin/consultations/ConsultationViewSheet.tsx`
- `src/app/admin/consultations/ConsultationFormSheet.tsx` (for status updates)

**Backend Requirements**:
- Verify/Implement tRPC procedures in `src/server/modules/consultations.ts`:
  - `getConsultations`
  - `getConsultationById`
  - `updateConsultationStatus`
  - `getConsultationStats`

**Implementation Steps**:

1. **Create Consultations Listing Page** (`page.tsx`):
   - Display stats cards (Total, Pending, Confirmed, Completed, Cancelled)
   - Filters:
     - Status (PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
     - Type (SKIN_ANALYSIS, PRODUCT_RECOMMENDATION, ROUTINE_BUILDING, GENERAL)
     - Date range
     - Search (name, email, phone)
   - Table columns:
     - Customer Name
     - Email
     - Phone
     - Type
     - Preferred Date/Time
     - Status
     - Actions

2. **Create Consultation View Sheet** (`ConsultationViewSheet.tsx`):
   - Display all consultation details
   - Show customer information
   - Display skin concerns
   - Show status history
   - Action buttons:
     - Confirm Consultation
     - Mark as Completed
     - Cancel Consultation
     - Send Email Reminder

3. **Create Consultation Form Sheet** (`ConsultationFormSheet.tsx`):
   - For status updates only
   - Status dropdown
   - Notes field (for cancellation reason, etc.)
   - Confirmation checkbox for destructive actions

**Estimated Time**: 2-3 days

---

### Task 2.3: Reviews Management
**Files to Create**:
- `src/app/admin/reviews/page.tsx`
- `src/app/admin/reviews/ReviewViewSheet.tsx`
- `src/app/admin/reviews/ReviewModerationSheet.tsx`

**Backend Requirements**:
- Verify/Implement tRPC procedures in `src/server/modules/reviews.ts`:
  - `getReviews`
  - `getReviewById`
  - `approveReview`
  - `rejectReview`
  - `getReviewStats`

**Implementation Steps**:

1. **Create Reviews Listing Page** (`page.tsx`):
   - Display stats cards (Total, Pending, Approved, Rejected)
   - Filters:
     - Status (PENDING, APPROVED, REJECTED)
     - Rating (1-5 stars)
     - Product (search/select)
     - Date range
   - Table columns:
     - Product (with image)
     - Customer
     - Rating (stars)
     - Review Title
     - Status
     - Date
     - Actions

2. **Create Review View Sheet** (`ReviewViewSheet.tsx`):
   - Display full review content
   - Show product details
   - Show customer information
   - Display helpful count
   - Action buttons:
     - Approve Review
     - Reject Review
     - Delete Review

3. **Create Review Moderation Sheet** (`ReviewModerationSheet.tsx`):
   - Quick moderation interface
   - Approve/Reject buttons
   - Rejection reason field
   - Bulk actions support

**Estimated Time**: 2-3 days

---

## Phase 3: Enhanced Features (Priority: MEDIUM)

### Task 3.1: Analytics Dashboard
**File**: `src/app/admin/analytics/page.tsx`

**Backend Requirements**:
- Verify/Implement tRPC procedures in `src/server/modules/analytics.ts`:
  - `getAnalytics`
  - `getAnalyticsByDateRange`
  - `getAnalyticsStats`

**Implementation Steps**:

1. **Create Analytics Dashboard**:
   - Date range selector (Today, Week, Month, Year, Custom)
   - Key Metrics Cards:
     - Total Visitors
     - Page Views
     - Orders
     - Revenue
     - Conversion Rate
     - Bounce Rate
   - Charts (using a charting library like recharts):
     - Revenue over time (line chart)
     - Orders over time (line chart)
     - Top products (bar chart)
     - Traffic sources (pie chart)
   - Tables:
     - Top performing products
     - Most viewed pages
     - Recent orders

**Estimated Time**: 3-4 days

**Dependencies**:
- Install charting library: `npm install recharts`
- Verify analytics data collection is working

---

### Task 3.2: System Settings
**Files to Create**:
- `src/app/admin/settings/page.tsx`
- `src/app/admin/settings/SettingFormSheet.tsx`

**Backend Requirements**:
- Verify/Implement tRPC procedures in `src/server/modules/settings.ts`:
  - `getSettings`
  - `getSettingByKey`
  - `updateSetting`
  - `createSetting`

**Implementation Steps**:

1. **Create Settings Page**:
   - Group settings by category:
     - General Settings
       - Site Name
       - Site Description
       - Contact Email
       - Contact Phone
     - Shipping Settings
       - Default Shipping Cost
       - Free Shipping Threshold
       - Shipping Zones
     - Tax Settings
       - Tax Rate
       - Tax Included in Price
     - Payment Settings
       - Payment Methods Enabled
       - Monnify API Keys (masked)
     - Email Settings
       - SMTP Configuration
       - Email Templates
   - Use form sheets for editing
   - Validation for each setting type

**Estimated Time**: 2-3 days

---

### Task 3.3: Payment Management
**Files to Create**:
- `src/app/admin/payments/page.tsx`
- `src/app/admin/payments/PaymentViewSheet.tsx`

**Backend Requirements**:
- Verify/Implement tRPC procedures in `src/server/modules/payments.ts`:
  - `getPayments`
  - `getPaymentById`
  - `processRefund`
  - `getPaymentStats`

**Implementation Steps**:

1. **Create Payments Listing Page**:
   - Display stats cards (Total, Completed, Pending, Failed, Refunded)
   - Filters:
     - Status
     - Payment Method
     - Date range
     - Transaction ID search
   - Table columns:
     - Transaction ID
     - Order Number
     - Customer
     - Amount
     - Payment Method
     - Status
     - Date
     - Actions

2. **Create Payment View Sheet**:
   - Display payment details
   - Show gateway response
   - Display failure reason if failed
   - Action buttons:
     - Process Refund
     - View Gateway Details
     - Download Receipt

**Estimated Time**: 2-3 days

---

## Phase 4: Improvements & Enhancements (Priority: LOW)

### Task 4.1: Implement Pagination
**Files to Update**: All admin listing pages

**Implementation Steps**:
1. Add pagination state to all listing pages
2. Pass `page` and `limit` to tRPC queries
3. Use pagination component (create if missing)
4. Update "Load More" buttons to use pagination

**Estimated Time**: 1 day

---

### Task 4.2: Quick Actions Functionality
**Files to Update**: Dashboard, Orders page

**Implementation Steps**:
1. Dashboard Quick Actions:
   - Add Product → Navigate to `/admin/products` with form open
   - View Orders → Navigate to `/admin/orders`
   - Customer List → Navigate to `/admin/customers`
   - Generate Report → Open report generation modal

2. Orders Quick Actions:
   - Process Pending Orders → Filter and show pending orders
   - Update Shipping → Navigate to bulk shipping update
   - Generate Report → Export orders report

**Estimated Time**: 1 day

---

### Task 4.3: Bulk Actions
**Files to Update**: Products, Orders, Customers, Reviews pages

**Implementation Steps**:
1. Add checkbox column to DataTable
2. Implement selection state
3. Add bulk action dropdown:
   - Products: Bulk status update, bulk delete
   - Orders: Bulk status update
   - Customers: Bulk status update
   - Reviews: Bulk approve/reject
4. Show confirmation for bulk actions

**Estimated Time**: 2 days

---

## Implementation Checklist

### Phase 1: Critical Fixes
- [ ] Task 1.1: Fix Order Detail Page
  - [ ] Replace mock data with tRPC
  - [ ] Implement status update
  - [ ] Implement tracking number update
  - [ ] Connect quick actions
- [ ] Task 1.2: Implement CSV Export
  - [ ] Create utility function
  - [ ] Add to Products page
  - [ ] Add to Orders page
  - [ ] Add to Customers page
  - [ ] Add to Promotions page
- [ ] Task 1.3: Update Admin Sidebar
  - [ ] Add all missing links
  - [ ] Add missing icons

### Phase 2: Essential Pages
- [ ] Task 2.1: Brands Management
  - [ ] Create listing page
  - [ ] Create form sheet
  - [ ] Create view sheet
  - [ ] Verify backend procedures
- [ ] Task 2.2: Consultations Management
  - [ ] Create listing page
  - [ ] Create view sheet
  - [ ] Create form sheet
  - [ ] Verify backend procedures
- [ ] Task 2.3: Reviews Management
  - [ ] Create listing page
  - [ ] Create view sheet
  - [ ] Create moderation sheet
  - [ ] Verify backend procedures

### Phase 3: Enhanced Features
- [ ] Task 3.1: Analytics Dashboard
  - [ ] Create dashboard page
  - [ ] Implement charts
  - [ ] Add date range filtering
  - [ ] Verify backend procedures
- [ ] Task 3.2: System Settings
  - [ ] Create settings page
  - [ ] Create form sheet
  - [ ] Verify backend procedures
- [ ] Task 3.3: Payment Management
  - [ ] Create listing page
  - [ ] Create view sheet
  - [ ] Verify backend procedures

### Phase 4: Improvements
- [ ] Task 4.1: Implement Pagination
- [ ] Task 4.2: Quick Actions Functionality
- [ ] Task 4.3: Bulk Actions

---

## Testing Requirements

### Unit Testing
- [ ] Test CSV export utility with various data types
- [ ] Test form validation schemas
- [ ] Test tRPC mutation error handling

### Integration Testing
- [ ] Test complete CRUD flows for each entity
- [ ] Test filter and search functionality
- [ ] Test status updates and their effects
- [ ] Test CSV exports with real data

### E2E Testing
- [ ] Test admin authentication and authorization
- [ ] Test order status update flow
- [ ] Test brand creation and product association
- [ ] Test review moderation flow

---

## Code Review Checklist

For each new feature, ensure:
- [ ] Follows established component patterns
- [ ] Uses TypeScript with proper types
- [ ] Implements proper error handling
- [ ] Shows loading states
- [ ] Handles empty states
- [ ] Includes proper validation
- [ ] Uses consistent styling (Tailwind classes)
- [ ] Follows accessibility best practices
- [ ] Includes proper error messages
- [ ] Implements proper cleanup (useEffect cleanup)

---

## Estimated Timeline

- **Phase 1 (Critical Fixes)**: 3-4 days
- **Phase 2 (Essential Pages)**: 6-9 days
- **Phase 3 (Enhanced Features)**: 7-10 days
- **Phase 4 (Improvements)**: 4 days

**Total Estimated Time**: 20-27 days (4-5 weeks)

---

## Notes

1. **Backend Verification**: Before implementing each feature, verify that the required tRPC procedures exist. If missing, create them following the existing patterns in `src/server/modules/`.

2. **Icon Requirements**: Some features may require new icons. Add them to `src/components/ui/icons.tsx` following the existing pattern.

3. **Schema Validation**: All forms should use Zod schemas for validation, following the pattern in existing form sheets.

4. **Error Handling**: Always implement proper error handling with user-friendly messages using `toast.error()`.

5. **Loading States**: Always show loading states during data fetching and mutations.

6. **Responsive Design**: Ensure all admin pages are responsive and work on mobile devices.

---

*Last Updated: [Current Date]*
*Next Review: After Phase 1 completion*

