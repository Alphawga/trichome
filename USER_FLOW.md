# Trichome E-Commerce Platform - Complete User Flow Documentation

## Overview
This document outlines the complete user journey through the Trichome beauty and skincare e-commerce platform, from discovery to post-purchase.

---

## 1. DISCOVERY PHASE

### 1.1 Landing Page (/)
**Entry Point**: User arrives at homepage

**Elements**:
- **Header**: Promotional banner (green gradient), logo, main navigation, search, cart/wishlist counts
- **Hero Section**: Full-screen carousel with 4 slides showcasing products and promotions (auto-advances every 5 seconds)
- **Product Sections**: Featured products, categories, brands
- **Footer**: Site links, social media, contact information

**User Actions**:
- Browse hero carousel
- Click navigation links (Brands, Shop, Products, Consultation, About Us, Sign In)
- Search for products
- View cart (count badge)
- View wishlist (count badge)
- Click "Shop Now" CTAs

**Navigation Options**:
1. `/brands` → Browse by brand
2. `/shop` → General shopping hub
3. `/products` → All products listing
4. `/consultation` → Book expert consultation
5. `/about` → Learn about Trichome
6. `/auth/signin` → User authentication

---

## 2. SHOPPING PHASE

### 2.1 Shop Page (/shop)
**Purpose**: Central shopping hub with categorized navigation

**Features**:
- Hero section with value proposition
- Quick links to:
  - All Products
  - Shop by Brand
  - Book Consultation
- Category grid (dynamically loaded from database)
- Each category card shows:
  - Category image or placeholder
  - Category name
  - Description
  - Number of subcategories
- CTA to consultation service

**User Actions**:
- Click category → `/products?category={slug}`
- Click "All Products" → `/products`
- Click "Shop by Brand" → `/brands`
- Click "Book Consultation" → `/consultation`

---

### 2.2 Brands Page (/brands)
**Purpose**: Shop all products with brand filtering

**Features**:
- **ProductFilter Component** (reusable):
  - Search bar
  - Price range slider (₦0 - ₦100,000)
  - Brand checkboxes (dynamic, extracted from products)
  - Skin concerns checkboxes
  - Key ingredients checkboxes
  - Apply Filters button
  - Clear All button
- **Product Grid**: Responsive grid (1-4 columns)
- **Sort Options**: Featured, Price (asc/desc), Name (A-Z/Z-A)
- **Pagination**: Load more button
- **Active Filters Display**: Chip-style tags with remove option

**User Actions**:
- Search products by name
- Filter by price, brand, concerns, ingredients
- Sort products
- Click product → `/products/{slug}`
- Add to cart (authenticated users only)
- Toggle wishlist (authenticated users only)
- Load more products

**Database Integration**:
- `trpc.getProducts.useQuery()` - Fetch products with pagination
- `trpc.addToCart.useMutation()` - Add product to cart
- `trpc.addToWishlist.useMutation()` - Add to wishlist
- `trpc.removeFromWishlist.useMutation()` - Remove from wishlist
- `trpc.getWishlist.useQuery()` - Check wishlist status

---

### 2.3 Products Page (/products)
**Purpose**: Browse all products with advanced filtering

**Features**: Same as Brands page but without brand-specific focus
- Can filter by category via URL param: `/products?category={name}`
- Uses existing FilterSidebar component
- Full product filtering and sorting
- Breadcrumb navigation

**User Actions**: Same as Brands page

---

### 2.4 Product Detail Page (/products/[slug])
**Purpose**: View detailed product information

**Features** (Expected):
- Product images carousel
- Product name, price, description
- Specifications and ingredients
- Stock status
- Quantity selector
- Add to Cart button
- Add to Wishlist button
- Related products
- Reviews/ratings
- Product recommendations

**User Actions**:
- View product details
- Select quantity
- Add to cart
- Add to wishlist
- View related products
- Read/write reviews

---

## 3. CART & CHECKOUT PHASE

### 3.1 Cart Page (/cart)
**Database Integrated**: ✅

**Features**:
- Cart items list with:
  - Product image
  - Product name (linked)
  - Unit price
  - Category
  - Quantity controls (+/-)
  - Line total
  - Move to wishlist button
  - Remove button
- Order summary:
  - Subtotal
  - Shipping cost (₦4,500 or Free)
  - Tax (calculated at checkout)
  - Total
- Proceed to Checkout button
- Empty cart state with "Start Shopping" CTA
- Loading state
- Authentication check (redirects to sign-in if not authenticated)

**User Actions**:
- Update quantities
- Remove items
- Move items to wishlist
- Proceed to checkout

**Database Operations**:
- `trpc.getCart.useQuery()` - Fetch cart items
- `trpc.updateCartItem.useMutation()` - Update quantity
- `trpc.removeFromCart.useMutation()` - Remove item
- `trpc.addToWishlist.useMutation()` - Move to wishlist
- Real-time cart count updates via cache invalidation

**Navigation**:
- Continue Shopping → `/`
- Proceed to Checkout → `/checkout` (if authenticated) or `/account` (if not)

---

### 3.2 Wishlist Page (/wishlist)
**Database Integrated**: ✅

**Features**:
- Wishlist items list with:
  - Product image
  - Product name
  - Price
  - Stock status
  - Category
  - Add to Cart button (if in stock)
  - Remove button
- Quick Actions:
  - Add all in-stock items to cart
- Empty wishlist state
- Loading state
- Authentication check

**User Actions**:
- Add items to cart
- Remove items from wishlist
- Navigate to product details
- Add all in-stock items to cart

**Database Operations**:
- `trpc.getWishlist.useQuery()` - Fetch wishlist
- `trpc.removeFromWishlist.useMutation()` - Remove item
- `trpc.addToCart.useMutation()` - Add to cart
- Real-time wishlist count updates

---

### 3.3 Checkout Page (/checkout)
**Status**: Pending implementation

**Expected Features**:
- Shipping address form/selection
- Billing address (same as shipping option)
- Payment method selection
- Order review
- Coupon/promo code input
- Final order summary
- Place Order button

**Required Database Operations**:
- `trpc.createOrder.useMutation()` - Create order
- `trpc.clearCart.useMutation()` - Clear cart after successful order
- Address management endpoints
- Payment processing integration

---

## 4. ACCOUNT MANAGEMENT PHASE

### 4.1 Authentication Pages

#### Sign In (/auth/signin)
**Purpose**: User authentication

**Features**:
- Email/password login
- "Remember me" option
- Forgot password link
- Sign up link
- Social login options (optional)

**Post-Login Behavior**:
- Check `localStorage` for `trichomes_checkout_redirect`
- If true → redirect to `/checkout`
- If false → redirect to previous page or `/profile`

#### Sign Up (/auth/signup)
**Purpose**: User registration

**Features**:
- First name, last name
- Email, phone
- Password (with strength indicator)
- Terms & conditions acceptance
- Sign in link

---

### 4.2 Profile Page (/profile)
**Status**: Pending database integration

**Expected Features**:
- Personal information
- Saved addresses
- Account settings
- Change password
- Email preferences
- Order history link
- Wishlist link

---

### 4.3 Order History Page (/order-history)
**Database Integrated**: ✅

**Features**:
- Orders table with:
  - Order number (monospace font)
  - Items count
  - Total amount
  - Order status (color-coded badges)
  - Order date (dd-MM-yyyy format)
  - View Order link → `/track-order?order={orderNumber}`
- Pagination controls
- Empty state with "Start Shopping" CTA
- Loading state
- Authentication check

**Order Statuses**:
- `PENDING` → Yellow badge
- `PROCESSING` → Blue badge
- `SHIPPED` → Blue badge
- `DELIVERED` → Green badge
- `CANCELLED` → Red badge

**Database Operations**:
- `trpc.getMyOrders.useQuery()` - Fetch user orders with pagination

---

### 4.4 Track Order Page (/track-order)
**Status**: Pending database integration

**URL Parameter**: `?order={orderNumber}`

**Expected Features**:
- Order status timeline
- Shipping information
- Delivery address
- Order items list
- Tracking number
- Estimated delivery date
- Contact support option

**Required Database Operations**:
- `trpc.getOrderByNumber.useQuery()` - Fetch order details
- `trpc.getOrderById.useQuery()` - Alternative by ID

---

## 5. CUSTOMER SERVICE PHASE

### 5.1 Consultation Booking Page (/consultation)
**Status**: ✅ Created (needs backend integration)

**Features**:
- Benefits section (3 cards):
  - Expert Guidance
  - Flexible Scheduling
  - Personalized Plan
- Booking form:
  - Personal information (first name, last name, email, phone)
  - Consultation type selection (Skincare, Makeup, Full - 30/60 min)
  - Date picker (minimum: today)
  - Time slot selection (9 AM - 5 PM)
  - Skin concerns checkboxes (12 options)
  - Additional notes textarea
- Contact information
- Form validation
- Success/error toast notifications

**Consultation Types**:
1. Skincare Consultation - 30 min
2. Makeup Consultation - 30 min
3. Full Beauty Consultation - 60 min

**Skin Concerns**: Acne, Dry Skin, Oily Skin, Combination Skin, Sensitive Skin, Anti-Aging, Dark Spots, Dullness, Large Pores, Redness, Fine Lines, Other

**User Actions**:
- Fill consultation form
- Submit booking
- Receive email confirmation (to be implemented)

**Required Backend**:
- Consultation booking endpoint
- Email notification service
- Calendar integration
- Admin dashboard for managing bookings

---

### 5.2 About Us Page (/about)
**Status**: ✅ Created

**Content Sections**:
1. **Hero**: Company tagline and mission
2. **Our Story**: Company history and values narrative
3. **Our Values** (3 pillars):
   - Authenticity (100% genuine products)
   - Education (Expert guidance)
   - Customer Care (Priority support)
4. **Why Choose Us** (6 reasons):
   - Curated Selection
   - Expert Consultations
   - Fast & Reliable Delivery
   - Easy Returns (30 days)
   - Secure Payments
   - Loyalty Rewards
5. **CTA Section**: Dual CTAs to "Start Shopping" and "Book Consultation"

**User Actions**:
- Learn about company
- Navigate to shop
- Book consultation

---

## 6. GLOBAL COMPONENTS

### 6.1 Header (Sticky)
**Elements**:
- **Promotional Bar**: Green gradient with promotional text
- **Main Navigation**:
  - Logo (links to `/`)
  - Nav Links: Brands, Shop, Products, Consultation, About Us, Sign In
  - Search bar (inline)
  - Icons: WhatsApp, Wishlist (with count), Profile, Cart (with count)

**Behavior**:
- Sticky positioning (stays at top)
- Cart/wishlist counts update in real-time
- Conditional Sign In/Profile link based on auth state

---

### 6.2 Footer
**Elements**:
- Site links
- Social media
- Contact information
- Newsletter signup
- Legal links (Privacy, Terms)

---

### 6.3 Reusable Components

#### ProductFilter Component
**Location**: `src/components/product/product-filter.tsx`

**Props**:
- `searchTerm`, `onSearchTermChange`
- `price`, `onPriceChange`
- `selectedBrands`, `selectedConcerns`, `selectedIngredients`
- `onToggleFilter`, `onApplyFilters`, `onClearFilters`
- `filterOptions` (brands, concerns, ingredients, categories)
- Toggle flags: `showSearch`, `showPrice`, `showCategories`, etc.

**Features**:
- Modular design
- Can show/hide specific filter sections
- Supports checkbox and radio filters
- Price range slider
- Search input
- Apply/Clear actions

**Usage**:
- Brands page
- Products page (potential)
- Any future filtered listing pages

---

#### ProductGrid Component
**Location**: `src/components/product/product-grid.tsx`

**Features**:
- Responsive grid layout
- Product cards with:
  - Image
  - Name
  - Price
  - Add to Cart button
  - Wishlist toggle
- Hover states
- Stock indicators

---

## 7. COMPLETE USER JOURNEYS

### Journey 1: First-Time Visitor → Purchase
1. Land on homepage `/`
2. Browse hero carousel, view featured products
3. Click "Shop by Brand" → `/brands`
4. Filter by skin concern "Acne"
5. Sort by "Price: Low to High"
6. Click product → `/products/{slug}`
7. View details, click "Add to Cart"
8. Redirected to `/auth/signin` (not authenticated)
9. Create account → redirected to `/cart`
10. Review cart, click "Proceed to Checkout"
11. Fill shipping/payment info → `/checkout`
12. Place order → Order confirmation
13. Receive email confirmation

---

### Journey 2: Returning Customer → Quick Reorder
1. Land on homepage `/`
2. Sign in (already has account)
3. Navigate to `/profile`
4. Click "Order History" → `/order-history`
5. Find previous order, click "View Order"
6. Track order status → `/track-order?order={number}`
7. See product, click "Reorder"
8. Added to cart, proceed to checkout
9. Use saved address and payment method
10. Complete purchase

---

### Journey 3: Consultation Seeker → Personalized Shopping
1. Land on homepage `/`
2. Click "Book a Consultation" → `/consultation`
3. Fill consultation form:
   - Personal info
   - Select "Skincare Consultation"
   - Choose date/time
   - Select concerns: "Dry Skin", "Anti-Aging"
4. Submit booking
5. Receive confirmation
6. Attend consultation (virtual/in-store)
7. Receive personalized product recommendations
8. Navigate to `/shop`
9. Add recommended products to cart
10. Complete purchase

---

### Journey 4: Browser → Wishlist User
1. Browse `/products`
2. See interesting products
3. Click heart icon (add to wishlist)
4. Prompted to sign in → `/auth/signin`
5. Sign in, product added to wishlist
6. Continue browsing, add more items
7. Navigate to `/wishlist`
8. Review saved items
9. Click "Add all in-stock items to cart"
10. Proceed to checkout

---

## 8. DATABASE INTEGRATION STATUS

### ✅ Fully Integrated
- **Cart Page**: All operations (get, update, remove, add to wishlist)
- **Wishlist Page**: All operations (get, add, remove, add to cart)
- **Order History Page**: Fetch orders with pagination
- **Header Counts**: Real-time cart and wishlist counts
- **Products Listing**: Fetch products with filters, pagination
- **Brands Page**: Full product browsing with mutations

### ⏳ Pending Integration
- **Profile Page**: User data, addresses, settings
- **Track Order Page**: Order details and status
- **Checkout Page**: Order creation, payment processing
- **Consultation Page**: Booking endpoint
- **Product Detail Page**: Product data, reviews

---

## 9. AUTHENTICATION FLOW

### Unauthenticated User Actions:
- Browse products ✅
- View product details ✅
- Search and filter ✅
- View cart ❌ (redirected to sign in)
- View wishlist ❌ (redirected to sign in)
- Add to cart ❌ (prompted to sign in)
- Add to wishlist ❌ (prompted to sign in)
- Checkout ❌ (redirected to sign in)
- View order history ❌ (redirected to sign in)

### Authenticated User Actions:
- All of the above ✅
- Manage cart ✅
- Manage wishlist ✅
- Complete checkout ✅
- View order history ✅
- Track orders ✅
- Update profile ✅

---

## 10. KEY FEATURES SUMMARY

### Shopping Experience
✅ Product browsing with filters
✅ Advanced search
✅ Product categorization
✅ Brand filtering
✅ Price range filtering
✅ Sorting options
✅ Pagination/Load more
✅ Product grid/list views
✅ Responsive design

### Cart & Checkout
✅ Persistent cart (database-backed)
✅ Quantity management
✅ Remove items
✅ Move to wishlist
✅ Real-time price calculation
⏳ Checkout process
⏳ Multiple payment methods
⏳ Shipping calculation
⏳ Coupon/promo codes

### User Account
✅ Authentication (sign in/up)
✅ Order history
✅ Wishlist management
⏳ Profile management
⏳ Address book
⏳ Order tracking
⏳ Password reset

### Customer Service
✅ Consultation booking form
✅ About us page
✅ Contact information
⏳ Live chat support
⏳ FAQ page
⏳ Returns/refunds

### Technical Features
✅ tRPC for type-safe APIs
✅ Prisma ORM for database
✅ Real-time data with React Query
✅ Toast notifications (Sonner)
✅ Form validation
✅ Loading states
✅ Error handling
✅ Responsive design
✅ SEO-friendly URLs
✅ Breadcrumb navigation

---

## 11. NEXT STEPS FOR COMPLETION

### High Priority
1. **Implement Checkout Flow**
   - Shipping address management
   - Payment gateway integration
   - Order creation endpoint
   - Email confirmations

2. **Complete Profile Page**
   - User data display/edit
   - Address management
   - Password change
   - Order history integration

3. **Product Detail Page**
   - Full product information
   - Image gallery
   - Add to cart/wishlist
   - Related products
   - Reviews system

4. **Track Order Functionality**
   - Order status tracking
   - Shipping updates
   - Delivery timeline

### Medium Priority
5. **Consultation Backend**
   - Booking endpoint
   - Email notifications
   - Calendar integration
   - Admin management

6. **Search Enhancement**
   - Real-time search suggestions
   - Search history
   - Popular searches
   - Advanced filters

7. **Reviews & Ratings**
   - Product reviews
   - Star ratings
   - Review moderation
   - Helpful votes

### Low Priority
8. **Loyalty Program**
   - Points system
   - Rewards tracking
   - Exclusive offers

9. **Social Features**
   - Share products
   - Social login
   - Referral program

10. **Analytics**
    - User behavior tracking
    - Conversion optimization
    - A/B testing

---

## 12. ROUTES MAP

### Public Routes
- `/` - Homepage
- `/shop` - Shopping hub
- `/brands` - Shop by brand
- `/products` - All products
- `/products?category={slug}` - Category products
- `/products/{slug}` - Product detail
- `/consultation` - Book consultation
- `/about` - About us
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up

### Protected Routes (Require Authentication)
- `/cart` - Shopping cart
- `/wishlist` - Wishlist
- `/checkout` - Checkout
- `/profile` - User profile
- `/order-history` - Order history
- `/track-order` - Track order

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer management
- `/admin/permissions` - Permissions management

---

## CONCLUSION

The Trichome e-commerce platform provides a comprehensive shopping experience with:
- **Seamless browsing** via multiple entry points (brands, categories, search)
- **Intelligent filtering** with reusable components
- **Secure checkout** with authentication
- **Order management** with history and tracking
- **Customer support** via consultations
- **Database integration** for real-time data

The platform is built with modern technologies (Next.js 14, tRPC, Prisma) ensuring type safety, performance, and scalability.
