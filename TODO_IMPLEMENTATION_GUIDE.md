# TODO Implementation Guide
## Trichomes E-Commerce - Critical Fixes & Improvements

**Principles**: Componentization, DRY (Don't Repeat Yourself), Type Safety, Reusability

---

## 🔴 **CRITICAL PRIORITY (Must Fix Before Launch)**

### **TODO-1: Implement Order Creation After Payment Success**
**Status**: ✅ Completed  
**Priority**: CRITICAL  
**Estimated Time**: 4-6 hours

**Requirements**:
1. Create tRPC endpoint `createOrderWithPayment` that:
   - Accepts payment response from Monnify
   - Creates shipping address if doesn't exist
   - Creates order record
   - Creates payment record with transaction ID
   - Validates payment amount matches order total
   - Returns order number and details

2. Create reusable `useOrderCreation` hook to:
   - Handle order creation logic
   - Manage loading states
   - Handle errors gracefully
   - Update cart count after success

3. Components to create/extract:
   - `PaymentHandler` component (reusable payment logic)
   - `OrderCreationStatus` component (loading/success/error states)

**Files to modify**:
- `src/server/modules/orders.ts` - Add `createOrderWithPayment` endpoint
- `src/app/(customer)/checkout/page.tsx` - Connect payment callback to order creation
- `src/hooks/useOrderCreation.ts` - New hook
- `src/components/checkout/PaymentHandler.tsx` - New component

**DRY Principle**: Extract payment handling logic to reusable component

---

### **TODO-2: Create Order Confirmation Page**
**Status**: ✅ Completed  
**Priority**: CRITICAL  
**Estimated Time**: 3-4 hours

**Requirements**:
1. Create `/order-confirmation` page that:
   - Accepts order number from URL params or state
   - Displays order summary (reuse OrderSummary component)
   - Shows shipping address
   - Displays tracking information
   - Provides print/email receipt option
   - Shows next steps

2. Components to create:
   - `OrderConfirmation` page component
   - `OrderDetailsCard` component (reusable)
   - `ShippingAddressCard` component (reusable)
   - `TrackingInfo` component (reusable)

3. Extract reusable components:
   - `OrderSummary` (from checkout page)
   - `OrderItemList` (from cart/checkout)

**Files to create**:
- `src/app/(customer)/order-confirmation/page.tsx`
- `src/components/orders/OrderDetailsCard.tsx`
- `src/components/orders/ShippingAddressCard.tsx`
- `src/components/orders/TrackingInfo.tsx`

**Files to modify**:
- Extract `OrderSummary` to `src/components/orders/OrderSummary.tsx`
- Extract `OrderItemList` to `src/components/orders/OrderItemList.tsx`

**DRY Principle**: Reuse OrderSummary and OrderItemList components

---

### **TODO-3: Fix Checkout Flow to Call Order Creation API**
**Status**: ✅ Completed  
**Priority**: CRITICAL  
**Estimated Time**: 2-3 hours

**Requirements**:
1. Modify checkout page to:
   - Create order BEFORE initiating payment
   - Store order ID temporarily
   - Pass order reference to payment
   - Handle payment callback
   - Update order status based on payment result

2. Create `useCheckoutFlow` hook to:
   - Manage multi-step checkout state
   - Handle form validation
   - Coordinate order creation and payment

3. Extract address form to reusable component:
   - `AddressForm` component (reusable across checkout, profile, order confirmation)

**Files to modify**:
- `src/app/(customer)/checkout/page.tsx` - Refactor checkout flow
- `src/server/modules/orders.ts` - Add pre-payment order creation

**Files to create**:
- `src/components/forms/AddressForm.tsx` - Reusable address form
- `src/hooks/useCheckoutFlow.ts` - Checkout flow hook

**DRY Principle**: Extract address form logic to reusable component

---

### **TODO-4: Implement Payment Webhook Handler**
**Status**: ✅ Completed  
**Priority**: CRITICAL  
**Estimated Time**: 3-4 hours

**Requirements**:
1. Create API route `/api/webhooks/monnify` that:
   - Verifies webhook signature
   - Handles payment status updates
   - Updates order payment status
   - Creates payment record if not exists
   - Sends confirmation emails
   - Handles failed payments

2. Create payment verification utility:
   - `verifyMonnifyWebhook` function
   - `updateOrderPaymentStatus` function

**Files to create**:
- `src/app/api/webhooks/monnify/route.ts`
- `src/lib/payments/monnify-webhook.ts`
- `src/lib/payments/payment-utils.ts`

**DRY Principle**: Centralize payment verification logic

---

### **TODO-5: Clear Cart After Successful Order**
**Status**: ✅ Completed  
**Priority**: CRITICAL  
**Estimated Time**: 1 hour

**Requirements**:
1. Ensure cart is cleared after order creation
2. Update header cart count immediately
3. Create `useCartSync` hook to manage cart state

**Files to modify**:
- `src/server/modules/orders.ts` - Ensure cart clearing happens
- `src/app/(customer)/checkout/page.tsx` - Trigger cart invalidation

**Files to create**:
- `src/hooks/useCartSync.ts` - Centralized cart sync logic

**DRY Principle**: Centralize cart sync logic in hook

---

### **TODO-6: Create Reusable AddressForm Component**
**Status**: ✅ Completed  
**Priority**: CRITICAL  
**Estimated Time**: 2-3 hours

**Requirements**:
1. Extract address form from checkout page
2. Make it reusable for:
   - Checkout
   - Profile address management
   - Order confirmation display
   - Edit mode

3. Component props:
   - `onSubmit`: Callback function
   - `initialValues`: Optional initial address data
   - `mode`: 'create' | 'edit' | 'display'
   - `showSaveOption`: Boolean for saving address

**Files to create**:
- `src/components/forms/AddressForm.tsx`
- `src/components/forms/AddressFormFields.tsx` (individual fields)

**Files to modify**:
- `src/app/(customer)/checkout/page.tsx` - Use AddressForm
- `src/app/(customer)/profile/page.tsx` - Use AddressForm

**DRY Principle**: Single source of truth for address form logic

---

### **TODO-7: Implement Address Management Endpoints**
**Status**: ✅ Completed  
**Priority**: CRITICAL  
**Estimated Time**: 2-3 hours

**Requirements**:
1. Create tRPC endpoints:
   - `createAddress` - Save new address
   - `updateAddress` - Update existing address
   - `deleteAddress` - Delete address
   - `getAddresses` - Get user's saved addresses
   - `setDefaultAddress` - Set default shipping address

2. Validation:
   - Use Zod schemas for address validation
   - Reuse validation across frontend and backend

**Files to create**:
- `src/server/modules/addresses.ts`
- `src/lib/validations/address.ts` - Shared validation schema

**Files to modify**:
- `src/server/trpc.ts` - Add address router
- `src/lib/validations/address.ts` - Export for frontend use

**DRY Principle**: Shared validation schema between frontend and backend

---

### **TODO-8: Create Reusable OrderSummary Component**
**Status**: ✅ Completed  
**Priority**: CRITICAL  
**Estimated Time**: 2 hours

**Requirements**:
1. Extract order summary from checkout and cart pages
2. Make it reusable with props:
   - `items`: Order items array
   - `subtotal`: Number
   - `shipping`: Number
   - `tax`: Number
   - `discount`: Number
   - `total`: Number
   - `showActions`: Boolean (checkout button, etc.)
   - `variant`: 'checkout' | 'confirmation' | 'history'

**Files to create**:
- `src/components/orders/OrderSummary.tsx`

**Files to modify**:
- `src/app/(customer)/checkout/page.tsx` - Use OrderSummary
- `src/app/(customer)/cart/page.tsx` - Use OrderSummary
- `src/app/(customer)/order-confirmation/page.tsx` - Use OrderSummary

**DRY Principle**: Single component for all order summary displays

---

## 🟠 **HIGH PRIORITY (Fix Soon After Launch)**

### **TODO-9: Implement Guest Checkout Flow**
**Status**: ✅ Completed  
**Priority**: HIGH  
**Estimated Time**: 4-5 hours

**Requirements**:
1. Allow checkout without account creation
2. Store email for order tracking
3. Provide optional account creation after order
4. Use localStorage cart for guest users
5. Create `useGuestCheckout` hook

**Components to create**:
- `GuestCheckoutForm` component
- `AccountCreationPrompt` component (shown after guest order)

**Files to create**:
- `src/hooks/useGuestCheckout.ts`
- `src/components/checkout/GuestCheckoutForm.tsx`
- `src/components/checkout/AccountCreationPrompt.tsx`

**Files to modify**:
- `src/app/(customer)/checkout/page.tsx` - Add guest checkout mode
- `src/app/(customer)/account/page.tsx` - Remove non-functional guest checkout button

**DRY Principle**: Reuse checkout form components for both authenticated and guest flows

---

### **TODO-10: Fix localStorage Cart Sync on Authentication**
**Status**: ✅ Completed  
**Priority**: HIGH  
**Estimated Time**: 2-3 hours

**Requirements**:
1. Merge localStorage cart with database cart on login
2. Handle quantity conflicts (keep maximum)
3. Show notification about merged items
4. Create `useCartSync` hook

**Files to create**:
- `src/hooks/useCartSync.ts`
- `src/lib/cart/sync-cart.ts` - Cart sync utility

**Files to modify**:
- `src/app/contexts/auth-context.tsx` - Trigger cart sync on login
- `src/utils/local-cart.ts` - Add sync functionality

**DRY Principle**: Centralize cart sync logic in utility function

---

### **TODO-11: Create Reusable CartSync Utility**
**Status**: ✅ Completed  
**Priority**: HIGH  
**Estimated Time**: 1-2 hours

**Requirements**:
1. Centralize cart sync logic between localStorage and database
2. Handle:
   - Merging items
   - Resolving conflicts
   - Updating quantities
   - Clearing localStorage after sync

**Files to create**:
- `src/lib/cart/sync-cart.ts`
- `src/lib/cart/cart-utils.ts` - Cart helper functions

**DRY Principle**: Single utility for all cart sync operations

---

### **TODO-12: Implement Password Reset Flow**
**Status**: ✅ Completed  
**Priority**: HIGH  
**Estimated Time**: 3-4 hours

**Requirements**:
1. Create password reset email endpoint
2. Generate secure reset tokens
3. Create reset password page functionality
4. Validate tokens and allow password reset
5. Create reusable password reset components

**Components to create**:
- `PasswordResetForm` component (reusable)
- `PasswordStrengthIndicator` component (already exists, may need extraction)

**Files to create**:
- `src/server/modules/auth.ts` - Add password reset endpoints
- `src/lib/email/password-reset.ts` - Email template
- `src/components/auth/PasswordResetForm.tsx`

**Files to modify**:
- `src/app/auth/forgot-password/page.tsx` - Connect to backend
- `src/app/auth/reset-password/page.tsx` - Implement reset logic

**DRY Principle**: Reuse password form components and validation

---

### **TODO-13: Implement Proper Password Hashing**
**Status**: ✅ Completed  
**Priority**: HIGH  
**Estimated Time**: 2 hours

**Requirements**:
1. Replace demo password check with bcrypt
2. Hash passwords on user creation
3. Verify passwords on login
4. Create password utility functions

**Files to create**:
- `src/lib/auth/password.ts` - Password hashing utilities

**Files to modify**:
- `src/lib/auth.ts` - Use bcrypt for password verification
- `src/server/modules/auth.ts` - Hash passwords on creation
- `prisma/schema.prisma` - Ensure password field exists

**DRY Principle**: Centralize password hashing logic

---

### **TODO-14: Create Email Notification Service**
**Status**: ✅ Completed

### **TODO-15: Implement Shipping Address Saving at Checkout**
**Status**: ✅ Completed

### **TODO-16: Create PaymentStatus Component**
**Status**: ✅ Completed

### **TODO-17: Add Order Confirmation Email**
**Status**: ✅ Completed

### **TODO-18: Create OrderStatusTimeline Component**
**Status**: ✅ Completed

### **TODO-19: Implement Consultation Booking Backend**
**Status**: ✅ Completed

### **TODO-20: Create Promo Code System**
**Status**: ✅ Completed  
**Priority**: HIGH  
**Estimated Time**: 4-5 hours

**Requirements**:
1. Create email service utility
2. Create email templates:
   - Order confirmation
   - Payment confirmation
   - Shipping updates
   - Password reset
   - Order status changes

3. Create reusable email components:
   - `EmailTemplate` base component
   - Individual email templates

**Files to create**:
- `src/lib/email/email-service.ts`
- `src/lib/email/templates/OrderConfirmation.tsx`
- `src/lib/email/templates/PaymentConfirmation.tsx`
- `src/lib/email/templates/PasswordReset.tsx`
- `src/lib/email/templates/ShippingUpdate.tsx`

**DRY Principle**: Reusable email template components

---

### **TODO-15: Implement Shipping Address Saving at Checkout**
**Status**: Pending  
**Priority**: HIGH  
**Estimated Time**: 2 hours

**Requirements**:
1. Save address during checkout if user opts in
2. Set as default shipping address
3. Reuse AddressForm component
4. Show saved addresses dropdown

**Files to modify**:
- `src/app/(customer)/checkout/page.tsx` - Add address saving
- `src/components/forms/AddressForm.tsx` - Add save option

**DRY Principle**: Reuse AddressForm component and address management endpoints

---

### **TODO-16: Create PaymentStatus Component**
**Status**: Pending  
**Priority**: HIGH  
**Estimated Time**: 1-2 hours

**Requirements**:
1. Reusable component to display payment status
2. Show status with icons and colors
3. Support multiple status types

**Files to create**:
- `src/components/payments/PaymentStatus.tsx`

**DRY Principle**: Single component for payment status display across app

---

### **TODO-17: Add Order Confirmation Email**
**Status**: Pending  
**Priority**: HIGH  
**Estimated Time**: 2-3 hours

**Requirements**:
1. Send email after order creation
2. Include order details, summary, and tracking info
3. Reuse email template components

**Files to modify**:
- `src/server/modules/orders.ts` - Send email after order creation
- Use email service from TODO-14

**DRY Principle**: Reuse email template components

---

### **TODO-18: Create OrderStatusTimeline Component**
**Status**: Pending  
**Priority**: HIGH  
**Estimated Time**: 2-3 hours

**Requirements**:
1. Reusable component for order status progression
2. Visual timeline with steps
3. Show completed, current, and pending statuses
4. Use in track order page and order details

**Files to create**:
- `src/components/orders/OrderStatusTimeline.tsx`

**Files to modify**:
- `src/app/(customer)/track-order/page.tsx` - Use OrderStatusTimeline
- `src/app/(customer)/order-history/page.tsx` - Use for order details modal

**DRY Principle**: Single component for status timeline across app

---

## 🟡 **MEDIUM PRIORITY (Nice to Have Soon)**

### **TODO-19: Implement Consultation Booking Backend**
**Status**: Pending  
**Priority**: MEDIUM  
**Estimated Time**: 4-5 hours

**Components to create**:
- `ConsultationBookingForm` component (extract from page)
- `ConsultationCalendar` component (reusable)

**Files to create**:
- `src/server/modules/consultations.ts`
- `src/components/consultation/ConsultationBookingForm.tsx`

**DRY Principle**: Extract form logic to reusable component

---

### **TODO-20: Create Promo Code System**
**Status**: Pending  
**Priority**: MEDIUM  
**Estimated Time**: 3-4 hours

**Components to create**:
- `PromoCodeInput` component (reusable)
- `DiscountDisplay` component (reusable)

**DRY Principle**: Reusable promo code components

---

### **TODO-21: Implement Dynamic Shipping Calculation**
**Status**: Pending  
**Priority**: MEDIUM  
**Estimated Time**: 3-4 hours

**Components to create**:
- `ShippingCalculator` utility
- `ShippingMethodSelector` component

**DRY Principle**: Centralize shipping calculation logic

---

### **TODO-22: Add Product Reviews and Ratings**
**Status**: Pending  
**Priority**: MEDIUM  
**Estimated Time**: 5-6 hours

**Components to create**:
- `ReviewCard` component
- `ReviewForm` component
- `RatingDisplay` component (reusable)
- `ReviewList` component

**DRY Principle**: Reusable review and rating components

---

### **TODO-23: Create RelatedProducts Component**
**Status**: Pending  
**Priority**: MEDIUM  
**Estimated Time**: 2-3 hours

**Components to create**:
- `RelatedProducts` component (reusable)

**DRY Principle**: Reusable product grid component

---

### **TODO-24: Implement Order Tracking Integration**
**Status**: Pending  
**Priority**: MEDIUM  
**Estimated Time**: 4-5 hours

**Components to create**:
- `TrackingUpdates` component
- `TrackingMap` component (if applicable)

**DRY Principle**: Reusable tracking components

---

### **TODO-25: Create SavedAddresses Component**
**Status**: Pending  
**Priority**: MEDIUM  
**Estimated Time**: 2-3 hours

**Components to create**:
- `SavedAddresses` component (reusable)
- `AddressCard` component (reusable)

**DRY Principle**: Reusable address management components

---

### **TODO-26: Add Shipping Method Selection**
**Status**: Pending  
**Priority**: MEDIUM  
**Estimated Time**: 2-3 hours

**Components to create**:
- `ShippingMethodSelector` component (reusable)

**DRY Principle**: Reusable shipping method component

---

## 🟢 **LOW PRIORITY (Future Enhancements)**

### **TODO-27: Complete Google OAuth Implementation**
**Status**: Pending  
**Priority**: LOW

**DRY Principle**: Reuse existing OAuth components

---

### **TODO-28: Implement Advanced Search Features**
**Status**: Pending  
**Priority**: LOW

**Components to create**:
- `SearchBar` component (extract and enhance)
- `SearchSuggestions` component
- `SearchHistory` component

**DRY Principle**: Reusable search components

---

### **TODO-29: Create Loyalty Program**
**Status**: Pending  
**Priority**: LOW

**Components to create**:
- `LoyaltyCard` component (reusable)
- `PointsDisplay` component (reusable)

**DRY Principle**: Reusable loyalty program components

---

### **TODO-30: Add WhatsApp Integration**
**Status**: Pending  
**Priority**: LOW

**Components to create**:
- `WhatsAppButton` component (reusable)
- `WhatsAppWidget` component (reusable)

**DRY Principle**: Reusable WhatsApp components

---

### **TODO-31: Create Product Comparison Feature**
**Status**: Pending  
**Priority**: LOW

**Components to create**:
- `ComparisonTable` component (reusable)
- `CompareButton` component (reusable)

**DRY Principle**: Reusable comparison components

---

## 📋 **SHARED UTILITIES TO CREATE**

### **Component Utilities**
- `src/lib/utils/format.ts` - Currency, date formatting
- `src/lib/utils/validation.ts` - Shared validation functions
- `src/lib/utils/constants.ts` - Shared constants

### **Type Definitions**
- `src/types/order.ts` - Order-related types
- `src/types/address.ts` - Address types
- `src/types/payment.ts` - Payment types
- `src/types/cart.ts` - Cart types

### **Hooks to Create**
- `useCartSync` - Cart synchronization
- `useOrderCreation` - Order creation logic
- `useCheckoutFlow` - Checkout flow management
- `useGuestCheckout` - Guest checkout logic
- `useAddressManagement` - Address CRUD operations

---

## 🎯 **IMPLEMENTATION BEST PRACTICES**

### **Component Structure**
```
src/
├── components/
│   ├── checkout/          # Checkout-specific components
│   ├── orders/            # Order-related components (reusable)
│   ├── forms/             # Reusable form components
│   ├── payments/          # Payment-related components
│   └── shared/            # Truly shared components
├── hooks/
│   ├── useCartSync.ts
│   ├── useOrderCreation.ts
│   └── useCheckoutFlow.ts
├── lib/
│   ├── cart/              # Cart utilities
│   ├── email/             # Email utilities
│   ├── payments/          # Payment utilities
│   └── validations/       # Shared validation schemas
└── types/                 # Shared TypeScript types
```

### **DRY Principles to Follow**
1. **Extract reusable components**: OrderSummary, AddressForm, etc.
2. **Share validation schemas**: Use Zod schemas on both frontend and backend
3. **Centralize utilities**: Cart sync, payment handling, email sending
4. **Reuse hooks**: Common logic in custom hooks
5. **Shared types**: Define types once, use everywhere

### **Component Design Patterns**
1. **Compound Components**: For complex components like AddressForm
2. **Render Props**: For flexible component composition
3. **Custom Hooks**: For stateful logic reuse
4. **Higher-Order Components**: For cross-cutting concerns (if needed)

---

## 🚀 **RECOMMENDED IMPLEMENTATION ORDER**

### **Phase 1: Critical Fixes (Week 1)**
1. TODO-6: Create AddressForm component (foundation)
2. TODO-7: Implement Address management endpoints
3. TODO-8: Create OrderSummary component
4. TODO-3: Fix checkout flow
5. TODO-1: Implement order creation
6. TODO-2: Create order confirmation page
7. TODO-4: Implement payment webhook
8. TODO-5: Clear cart after order

### **Phase 2: High Priority (Week 2)**
9. TODO-13: Implement password hashing
10. TODO-10: Fix cart sync
11. TODO-11: Create CartSync utility
12. TODO-12: Password reset flow
13. TODO-14: Email service
14. TODO-17: Order confirmation email
15. TODO-9: Guest checkout (if needed)

### **Phase 3: Medium Priority (Week 3-4)**
16. Remaining medium priority items

### **Phase 4: Low Priority (Future)**
17. Future enhancements

---

## ✅ **CHECKLIST FOR EACH TODO**

Before marking a TODO as complete:
- [ ] Component is reusable and follows DRY principles
- [ ] Types are properly defined and shared
- [ ] Validation schemas are shared between frontend/backend
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Tests are written (if applicable)
- [ ] Documentation is updated
- [ ] Code is reviewed for code smells

