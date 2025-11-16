# Comprehensive Testing Checklist
## Trichomes E-Commerce Platform

This document lists every part of the application that needs thorough testing to avoid bottlenecks, race conditions, data inconsistencies, and user experience issues.

---

## 🔴 **CRITICAL PATH TESTING** (Revenue Impact)

### **1. Checkout & Payment Flow** ⚠️ **HIGHEST PRIORITY**

#### **1.1 Guest Checkout Flow**
- [ ] **Cart Loading (Guest)**
  - [ ] Load products from localStorage on page load
  - [ ] Handle missing products (deleted items)
  - [ ] Handle price changes between sessions
  - [ ] Handle out-of-stock items
  - [ ] Validate product quantities match availability
  - [ ] Test with empty cart
  - [ ] Test with large cart (50+ items)

- [ ] **Address Form (Guest)**
  - [ ] All required fields validation
  - [ ] Optional fields (state, postal_code) handling
  - [ ] Form validation errors display correctly
  - [ ] Address form submission
  - [ ] Form state persistence on navigation
  - [ ] Form reset after successful order

- [ ] **Shipping Calculation (Guest)**
  - [ ] Standard shipping calculation
  - [ ] Express shipping calculation
  - [ ] Free shipping threshold
  - [ ] Shipping based on location (state/city)
  - [ ] Shipping based on weight
  - [ ] Shipping cost updates when address changes
  - [ ] Shipping method selection persistence
  - [ ] Edge cases: Missing address fields

- [ ] **Promo Code Validation (Guest)**
  - [ ] Valid promo code application
  - [ ] Invalid promo code rejection
  - [ ] Expired promo code rejection
  - [ ] Minimum order value validation
  - [ ] Maximum discount limit
  - [ ] Free shipping promo codes
  - [ ] Percentage vs fixed discount
  - [ ] Promo code removal
  - [ ] Multiple promo codes (if applicable)
  - [ ] Promo code after price changes

- [ ] **Payment Initialization (Guest)**
  - [ ] Monnify SDK initialization
  - [ ] Payment reference generation
  - [ ] Total amount calculation (subtotal + shipping - discount + tax)
  - [ ] Payment modal opens correctly
  - [ ] Payment cancellation handling
  - [ ] Payment timeout handling
  - [ ] Network error during payment
  - [ ] Concurrent payment attempts prevention

- [ ] **Order Creation (Guest)**
  - [ ] Order created after successful payment
  - [ ] Order number generation uniqueness
  - [ ] Order items match cart items
  - [ ] Order totals match payment amount
  - [ ] Shipping address saved correctly
  - [ ] Guest email stored correctly
  - [ ] Order status set to PENDING
  - [ ] Payment status set to COMPLETED
  - [ ] Payment record created with transaction ID
  - [ ] Order confirmation email sent
  - [ ] Redirect to order confirmation page
  - [ ] localStorage cart cleared after order

#### **1.2 Authenticated Checkout Flow**
- [ ] **Cart Loading (Authenticated)**
  - [ ] Load cart from database
  - [ ] Cart sync on page load (if localStorage has items)
  - [ ] Handle merged cart conflicts
  - [ ] Handle deleted products in cart
  - [ ] Handle price changes
  - [ ] Handle out-of-stock items
  - [ ] Real-time cart count updates
  - [ ] Test with empty cart
  - [ ] Test with large cart (50+ items)

- [ ] **Address Management (Authenticated)**
  - [ ] Load saved addresses
  - [ ] Select saved address
  - [ ] Create new address at checkout
  - [ ] Save new address option (checkbox)
  - [ ] Set default address
  - [ ] Edit address before checkout
  - [ ] Address form validation
  - [ ] Multiple addresses handling

- [ ] **Shipping Calculation (Authenticated)**
  - [ ] Standard shipping calculation
  - [ ] Express shipping calculation
  - [ ] Free shipping threshold
  - [ ] Shipping based on selected address
  - [ ] Shipping method selection
  - [ ] Shipping cost updates

- [ ] **Promo Code Validation (Authenticated)**
  - [ ] Valid promo code application
  - [ ] User-specific promo code limits
  - [ ] Usage limit per user
  - [ ] New customer promo codes
  - [ ] Existing customer promo codes
  - [ ] Promo code after user qualification changes

- [ ] **Payment Initialization (Authenticated)**
  - [ ] Monnify SDK initialization
  - [ ] Payment reference generation
  - [ ] Total amount calculation
  - [ ] User ID included in metadata
  - [ ] Payment modal opens correctly
  - [ ] Payment cancellation handling

- [ ] **Order Creation (Authenticated)**
  - [ ] Order created after successful payment
  - [ ] Order linked to user correctly
  - [ ] Shipping address linked correctly
  - [ ] Order items created correctly
  - [ ] Product quantities updated
  - [ ] Cart cleared after order
  - [ ] Loyalty points awarded (if applicable)
  - [ ] Order confirmation email sent
  - [ ] Order history updated
  - [ ] Cart count updated in header

#### **1.3 Payment Webhook Processing**
- [ ] **Webhook Reception**
  - [ ] Webhook endpoint accessible
  - [ ] HMAC signature verification
  - [ ] Invalid signature rejection
  - [ ] Missing signature handling
  - [ ] Webhook payload parsing

- [ ] **Idempotency Handling**
  - [ ] Duplicate webhook processing prevention
  - [ ] Payment reference uniqueness check
  - [ ] Transaction reference uniqueness
  - [ ] Idempotency key storage
  - [ ] Concurrent webhook processing handling

- [ ] **Order Status Updates**
  - [ ] Payment status updated correctly
  - [ ] Order status updated correctly
  - [ ] Status history recorded
  - [ ] Email notifications sent
  - [ ] Failed webhook handling

- [ ] **Error Scenarios**
  - [ ] Order not found handling
  - [ ] Payment already processed
  - [ ] Amount mismatch handling
  - [ ] Database error handling
  - [ ] Email failure doesn't block webhook

### **2. Cart Management** ⚠️ **CRITICAL**

#### **2.1 Cart Operations (Authenticated)**
- [ ] **Add to Cart**
  - [ ] Add single item to cart
  - [ ] Add existing item (quantity increment)
  - [ ] Add item with quantity > 1
  - [ ] Out-of-stock item prevention
  - [ ] Maximum quantity enforcement
  - [ ] Cart count updates in header
  - [ ] Real-time sync across tabs
  - [ ] Network error handling
  - [ ] Optimistic UI updates

- [ ] **Update Cart Item**
  - [ ] Quantity increase
  - [ ] Quantity decrease
  - [ ] Quantity set to 0 (removal)
  - [ ] Quantity exceeds stock limit
  - [ ] Multiple items updated simultaneously
  - [ ] Concurrent updates handling
  - [ ] Optimistic UI updates
  - [ ] Server response validation

- [ ] **Remove from Cart**
  - [ ] Remove single item
  - [ ] Remove multiple items
  - [ ] Remove all items (clear cart)
  - [ ] Cart count updates
  - [ ] Empty cart state display
  - [ ] Optimistic UI updates

- [ ] **Cart Sync on Login**
  - [ ] localStorage cart merged with database cart
  - [ ] Quantity conflicts resolution (higher wins)
  - [ ] Out-of-stock items removed
  - [ ] Deleted products removed
  - [ ] User notification on conflicts
  - [ ] Cart state after merge

- [ ] **Cart Queries**
  - [ ] Cart loaded on page load
  - [ ] Cart count query performance
  - [ ] Cart invalidation after mutations
  - [ ] Refetch on window focus
  - [ ] Cache invalidation timing

#### **2.2 Cart Operations (Guest)**
- [ ] **LocalStorage Cart**
  - [ ] Add item to localStorage cart
  - [ ] Update quantity in localStorage
  - [ ] Remove item from localStorage
  - [ ] Clear localStorage cart
  - [ ] Cart persistence across sessions
  - [ ] Cart limit handling (storage quota)
  - [ ] localStorage disabled handling
  - [ ] Multiple browser tabs sync

- [ ] **Cart Display (Guest)**
  - [ ] Load products for localStorage cart
  - [ ] Handle missing products
  - [ ] Handle price changes
  - [ ] Handle out-of-stock items
  - [ ] Cart totals calculation

### **3. Product Browsing & Search** ⚠️ **HIGH TRAFFIC**

#### **3.1 Product Listing**
- [ ] **Products Query**
  - [ ] Load products with pagination
  - [ ] Filter by category
  - [ ] Filter by price range
  - [ ] Filter by status (ACTIVE only)
  - [ ] Sort by price (asc/desc)
  - [ ] Sort by newest
  - [ ] Sort by popularity
  - [ ] Sort by featured
  - [ ] Search by name/description
  - [ ] Combined filters
  - [ ] Empty results handling
  - [ ] Loading states
  - [ ] Error states
  - [ ] Query performance with large dataset (1000+ products)

- [ ] **Product Filters**
  - [ ] Category filter selection
  - [ ] Price range slider
  - [ ] Multiple filter combinations
  - [ ] Filter reset
  - [ ] Filter persistence in URL
  - [ ] Mobile filter sidebar
  - [ ] Filter animation performance

- [ ] **Pagination**
  - [ ] Next page navigation
  - [ ] Previous page navigation
  - [ ] Page number selection
  - [ ] Page size changes
  - [ ] Total count display
  - [ ] Edge cases (last page, first page)

- [ ] **Product Grid**
  - [ ] Responsive grid layout
  - [ ] Image loading performance
  - [ ] Lazy loading images
  - [ ] Image error handling
  - [ ] Product card hover effects
  - [ ] Quick add to cart
  - [ ] Quick add to wishlist

#### **3.2 Advanced Search**
- [ ] **SearchBar Component**
  - [ ] Search input focus/blur
  - [ ] Autocomplete suggestions (2+ characters)
  - [ ] Search suggestions display
  - [ ] Select suggestion
  - [ ] Search history display
  - [ ] Search history selection
  - [ ] Clear search history
  - [ ] Popular searches display
  - [ ] Select popular search
  - [ ] Search submission (Enter key)
  - [ ] Search button click
  - [ ] Debounced search (300ms)
  - [ ] Search query in URL
  - [ ] Empty search handling
  - [ ] Mobile search experience
  - [ ] Search dropdown positioning

- [ ] **Search Queries**
  - [ ] Search by product name
  - [ ] Search by description
  - [ ] Search by SKU
  - [ ] Case-insensitive search
  - [ ] Partial word matching
  - [ ] Search with special characters
  - [ ] Search performance with large dataset
  - [ ] Search result pagination

#### **3.3 Product Detail Page**
- [ ] **Product Loading**
  - [ ] Load product by ID/slug
  - [ ] Product not found handling
  - [ ] Loading state
  - [ ] Error state
  - [ ] Image gallery
  - [ ] Primary image display
  - [ ] Image zoom functionality
  - [ ] Multiple images navigation

- [ ] **Product Information**
  - [ ] Product name display
  - [ ] Product description
  - [ ] Product price
  - [ ] Compare price (if applicable)
  - [ ] Stock status
  - [ ] Quantity selector
  - [ ] Category link
  - [ ] Brand information

- [ ] **Add to Cart (Product Page)**
  - [ ] Add to cart with default quantity (1)
  - [ ] Add to cart with custom quantity
  - [ ] Quantity exceeds stock limit
  - [ ] Out-of-stock item handling
  - [ ] Loading state during add
  - [ ] Success notification
  - [ ] Error notification
  - [ ] Cart count update

- [ ] **Wishlist (Product Page)**
  - [ ] Add to wishlist
  - [ ] Remove from wishlist
  - [ ] Wishlist state persistence
  - [ ] Wishlist count update

- [ ] **Related Products**
  - [ ] Related products loading
  - [ ] Related products by category
  - [ ] Related products display
  - [ ] Related products navigation
  - [ ] Empty related products handling

- [ ] **Reviews & Ratings**
  - [ ] Load product reviews
  - [ ] Display approved reviews only
  - [ ] Review pagination
  - [ ] Review filtering (rating, helpful)
  - [ ] Submit review (authenticated only)
  - [ ] Review form validation
  - [ ] Review submission
  - [ ] Review approval workflow (admin)
  - [ ] Average rating calculation
  - [ ] Review helpful votes
  - [ ] Mark review helpful

- [ ] **WhatsApp Integration**
  - [ ] WhatsApp button display
  - [ ] WhatsApp link with pre-filled message
  - [ ] Product name in message
  - [ ] WhatsApp widget (floating)

### **4. Authentication & Authorization** ⚠️ **SECURITY CRITICAL**

#### **4.1 User Registration**
- [ ] **Sign Up Form**
  - [ ] All required fields validation
  - [ ] Email format validation
  - [ ] Password strength validation
  - [ ] Password confirmation match
  - [ ] Phone number validation (if applicable)
  - [ ] Terms acceptance checkbox
  - [ ] Form submission
  - [ ] Loading state
  - [ ] Success handling
  - [ ] Error handling (duplicate email)
  - [ ] Error handling (weak password)
  - [ ] Email verification requirement (if applicable)
  - [ ] Redirect after signup

- [ ] **Password Hashing**
  - [ ] Password hashed with bcrypt
  - [ ] Password not stored in plain text
  - [ ] Password salt generation
  - [ ] Hash verification on login

- [ ] **Google OAuth**
  - [ ] OAuth button click
  - [ ] OAuth redirect flow
  - [ ] OAuth callback handling
  - [ ] New user creation via OAuth
  - [ ] Existing user login via OAuth
  - [ ] OAuth account linking
  - [ ] OAuth error handling
  - [ ] OAuth cancellation handling

#### **4.2 User Login**
- [ ] **Credentials Login**
  - [ ] Email/password validation
  - [ ] Invalid email handling
  - [ ] Invalid password handling
  - [ ] User not found handling
  - [ ] Inactive user handling
  - [ ] OAuth-only account handling (no password)
  - [ ] Remember me checkbox
  - [ ] Session creation
  - [ ] Redirect after login
  - [ ] Checkout redirect (if applicable)
  - [ ] Previous page redirect

- [ ] **Session Management**
  - [ ] Session creation on login
  - [ ] Session validation on protected routes
  - [ ] Session expiration handling
  - [ ] Session refresh
  - [ ] Multiple tab session sync
  - [ ] Session destruction on logout

#### **4.3 Password Reset**
- [ ] **Forgot Password**
  - [ ] Email input validation
  - [ ] Email not found handling (no enumeration)
  - [ ] Reset token generation
  - [ ] Reset email sent
  - [ ] Token expiration (24 hours)
  - [ ] Invalid token handling
  - [ ] Expired token handling
  - [ ] Multiple reset requests handling

- [ ] **Reset Password**
  - [ ] Token validation
  - [ ] New password validation
  - [ ] Password confirmation match
  - [ ] Password strength requirements
  - [ ] Password update
  - [ ] Token invalidation after use
  - [ ] Redirect after reset
  - [ ] Login required after reset

#### **4.4 Authorization Checks**
- [ ] **Protected Routes**
  - [ ] Redirect to signin if not authenticated
  - [ ] Redirect to home if unauthorized
  - [ ] Admin routes protection
  - [ ] Staff routes protection
  - [ ] Customer routes access
  - [ ] Guest checkout access

- [ ] **Role-Based Access**
  - [ ] Admin can access admin panel
  - [ ] Staff can access admin panel
  - [ ] Customer cannot access admin panel
  - [ ] Staff cannot access admin-only features
  - [ ] Role checking in tRPC procedures

---

## 🟠 **HIGH TRAFFIC AREAS** (Performance Impact)

### **5. Homepage & Landing** ⚠️ **FIRST IMPRESSION**

#### **5.1 Homepage Loading**
- [ ] **Page Load Performance**
  - [ ] Initial page load time (< 2s)
  - [ ] Time to First Contentful Paint (FCP)
  - [ ] Time to Interactive (TTI)
  - [ ] Image optimization
  - [ ] Hero carousel loading
  - [ ] Product sections loading
  - [ ] Above-the-fold content priority

- [ ] **Hero Carousel**
  - [ ] Auto-advance (5 seconds)
  - [ ] Manual navigation (arrows/dots)
  - [ ] Touch/swipe navigation (mobile)
  - [ ] Carousel pause on hover
  - [ ] Image loading optimization
  - [ ] Transition animations
  - [ ] Multiple carousel slides (4 slides)

- [ ] **Featured Products**
  - [ ] Featured products query
  - [ ] Featured products display
  - [ ] Product grid layout
  - [ ] Product card interactions
  - [ ] Quick add to cart
  - [ ] Quick add to wishlist
  - [ ] Empty featured products handling

- [ ] **Category Sections**
  - [ ] Category loading
  - [ ] Category navigation
  - [ ] Category grid display
  - [ ] Category image loading

#### **5.2 Header Navigation**
- [ ] **Header Performance**
  - [ ] Header load time
  - [ ] Cart count query performance
  - [ ] Wishlist count query performance
  - [ ] Header sticky behavior
  - [ ] Mobile menu performance

- [ ] **Search Bar (Header)**
  - [ ] Search bar functionality
  - [ ] Autocomplete performance
  - [ ] Search dropdown positioning
  - [ ] Mobile search experience

- [ ] **Navigation Menus**
  - [ ] Dropdown menu hover
  - [ ] Dropdown menu click
  - [ ] Mobile menu toggle
  - [ ] Mobile submenu expand
  - [ ] Navigation link highlighting
  - [ ] Active route indication

### **6. Product Listing Pages** ⚠️ **CATALOG PERFORMANCE**

#### **6.1 Products Page**
- [ ] **Initial Load**
  - [ ] Products query performance (12 products)
  - [ ] Categories query performance
  - [ ] Category tree loading
  - [ ] Filter sidebar loading
  - [ ] Product grid rendering
  - [ ] Image lazy loading
  - [ ] Skeleton loading states

- [ ] **Filtering Performance**
  - [ ] Category filter response time
  - [ ] Price filter response time
  - [ ] Search filter response time
  - [ ] Combined filters performance
  - [ ] Filter reset performance
  - [ ] Filter URL parameter updates

- [ ] **Pagination Performance**
  - [ ] Next page load time
  - [ ] Previous page load time
  - [ ] Page number navigation
  - [ ] Large dataset pagination (1000+ products)
  - [ ] Pagination URL updates

- [ ] **Sorting Performance**
  - [ ] Sort by price (asc/desc)
  - [ ] Sort by newest
  - [ ] Sort by popularity
  - [ ] Sort by featured
  - [ ] Sort performance with large dataset

#### **6.2 Brands Page**
- [ ] **Brand Filtering**
  - [ ] Brand filter selection
  - [ ] Multiple brand selection
  - [ ] Brand filter removal
  - [ ] Products filtered by brand
  - [ ] Brand filter URL updates

- [ ] **Ingredient Filtering** (if applicable)
  - [ ] Ingredient filter selection
  - [ ] Multiple ingredient selection
  - [ ] Ingredient filter performance

### **7. Cart Page** ⚠️ **CONVERSION IMPACT**

#### **7.1 Cart Display**
- [ ] **Cart Loading**
  - [ ] Authenticated cart loading
  - [ ] Guest cart loading
  - [ ] Cart sync on page load
  - [ ] Cart loading performance
  - [ ] Empty cart state
  - [ ] Cart items display

- [ ] **Cart Operations**
  - [ ] Quantity update performance
  - [ ] Remove item performance
  - [ ] Multiple item updates
  - [ ] Cart totals recalculation
  - [ ] Shipping cost display
  - [ ] Discount display
  - [ ] Tax display
  - [ ] Total calculation accuracy

- [ ] **Cart Actions**
  - [ ] Move to wishlist
  - [ ] Remove from cart
  - [ ] Update quantity
  - [ ] Clear cart
  - [ ] Proceed to checkout button
  - [ ] Continue shopping link

#### **7.2 Cart Synchronization**
- [ ] **Multi-Tab Sync**
  - [ ] Cart updates sync across tabs
  - [ ] Real-time cart count updates
  - [ ] Concurrent cart modifications
  - [ ] Race condition prevention
  - [ ] Last-write-wins vs merge strategy

- [ ] **Login Cart Sync**
  - [ ] localStorage cart merged on login
  - [ ] Quantity conflicts resolution
  - [ ] Product availability re-check
  - [ ] Price changes handling
  - [ ] Deleted products removal
  - [ ] User notification on conflicts

---

## 🟡 **INTEGRATION POINTS** (External Dependencies)

### **8. Payment Gateway Integration**

#### **8.1 Monnify Integration**
- [ ] **Payment Initialization**
  - [ ] Monnify SDK loaded correctly
  - [ ] Payment initialization with correct params
  - [ ] Payment reference generation
  - [ ] Amount formatting (NGN)
  - [ ] Customer information passed correctly
  - [ ] Metadata passed correctly
  - [ ] Callback URLs configured

- [ ] **Payment Processing**
  - [ ] Payment modal opens
  - [ ] Payment methods available
  - [ ] Payment form submission
  - [ ] Payment success callback
  - [ ] Payment failure callback
  - [ ] Payment cancellation callback
  - [ ] Payment timeout handling
  - [ ] Network error during payment

- [ ] **Webhook Processing**
  - [ ] Webhook endpoint accessible
  - [ ] HMAC signature verification
  - [ ] Webhook payload parsing
  - [ ] Idempotency handling
  - [ ] Order status updates
  - [ ] Payment status updates
  - [ ] Email notifications
  - [ ] Error handling
  - [ ] Retry mechanism

- [ ] **Payment Verification**
  - [ ] Payment amount verification
  - [ ] Payment status verification
  - [ ] Transaction reference storage
  - [ ] Payment record creation
  - [ ] Duplicate payment prevention

### **9. Email Service Integration**

#### **9.1 Email Delivery**
- [ ] **Order Confirmation Email**
  - [ ] Email sent after order creation
  - [ ] Email template rendering
  - [ ] Order details in email
  - [ ] Shipping address in email
  - [ ] Tracking number in email (if available)
  - [ ] Email delivery confirmation
  - [ ] Email failure handling

- [ ] **Payment Confirmation Email**
  - [ ] Email sent after payment success
  - [ ] Payment details in email
  - [ ] Transaction ID in email
  - [ ] Email template rendering

- [ ] **Shipping Update Email**
  - [ ] Email sent on status change
  - [ ] Tracking information in email
  - [ ] Delivery estimate in email

- [ ] **Password Reset Email**
  - [ ] Email sent on password reset request
  - [ ] Reset link in email
  - [ ] Link expiration handling
  - [ ] Email template rendering

- [ ] **Email Service Errors**
  - [ ] Email service down handling
  - [ ] Invalid email address handling
  - [ ] Email delivery failure logging
  - [ ] Email doesn't block order creation

### **10. Tracking Service Integration**

#### **10.1 Order Tracking**
- [ ] **Tracking Number Lookup**
  - [ ] Tracking number format validation
  - [ ] Tracking provider API integration
  - [ ] Tracking information retrieval
  - [ ] Tracking API error handling
  - [ ] Fallback to order status
  - [ ] Caching tracking information

- [ ] **Tracking Updates**
  - [ ] Real-time tracking updates
  - [ ] Tracking event timeline
  - [ ] Tracking status display
  - [ ] Estimated delivery date
  - [ ] Location information
  - [ ] Tracking update frequency

---

## 🔵 **DATA CONSISTENCY & RACE CONDITIONS**

### **11. Database Operations**

#### **11.1 Order Creation**
- [ ] **Concurrent Order Creation**
  - [ ] Multiple users ordering same product simultaneously
  - [ ] Stock quantity race conditions
  - [ ] Last item purchase handling
  - [ ] Inventory lock mechanism
  - [ ] Transaction isolation levels
  - [ ] Rollback on errors

- [ ] **Product Quantity Updates**
  - [ ] Quantity decrement atomicity
  - [ ] Reserved quantity increment
  - [ ] Sale count increment
  - [ ] Negative quantity prevention
  - [ ] Concurrent quantity updates
  - [ ] Quantity update in transaction

- [ ] **Order Status Updates**
  - [ ] Status update atomicity
  - [ ] Status history creation
  - [ ] Concurrent status updates
  - [ ] Status transition validation

#### **11.2 Cart Operations**
- [ ] **Cart Item Updates**
  - [ ] Concurrent cart updates
  - [ ] Cart item uniqueness constraint
  - [ ] Quantity update atomicity
  - [ ] Cart clear operation
  - [ ] Cart merge conflicts

- [ ] **Cart Sync Race Conditions**
  - [ ] Login cart sync while adding items
  - [ ] Multiple tabs adding items simultaneously
  - [ ] Cart sync completion detection
  - [ ] Cart state consistency

#### **11.3 Payment Processing**
- [ ] **Payment Webhook Race Conditions**
  - [ ] Multiple webhooks for same payment
  - [ ] Webhook processing during order creation
  - [ ] Payment verification during order creation
  - [ ] Idempotency key management
  - [ ] Payment status consistency

- [ ] **Payment Amount Verification**
  - [ ] Amount mismatch detection
  - [ ] Partial payment handling
  - [ ] Overpayment handling
  - [ ] Currency mismatch handling

### **12. LocalStorage & Client State**

#### **12.1 LocalStorage Operations**
- [ ] **Cart Storage**
  - [ ] localStorage write performance
  - [ ] localStorage read performance
  - [ ] localStorage quota limits
  - [ ] localStorage disabled handling
  - [ ] localStorage corruption handling
  - [ ] localStorage clear operations

- [ ] **Search History**
  - [ ] Search history storage
  - [ ] Search history limit (10 items)
  - [ ] Search history clear
  - [ ] Search history persistence

- [ ] **State Synchronization**
  - [ ] localStorage and database sync
  - [ ] Multiple tab state sync
  - [ ] State conflict resolution
  - [ ] State persistence across sessions

---

## 🟢 **USER EXPERIENCE FLOWS**

### **13. Wishlist Management**

#### **13.1 Wishlist Operations**
- [ ] **Add to Wishlist**
  - [ ] Add product to wishlist (authenticated)
  - [ ] Prompt login if not authenticated
  - [ ] Wishlist count update
  - [ ] Wishlist state persistence
  - [ ] Optimistic UI update

- [ ] **Remove from Wishlist**
  - [ ] Remove product from wishlist
  - [ ] Wishlist count update
  - [ ] Wishlist page update
  - [ ] Optimistic UI update

- [ ] **Wishlist Page**
  - [ ] Load wishlist items
  - [ ] Wishlist items display
  - [ ] Add to cart from wishlist
  - [ ] Remove from wishlist
  - [ ] Empty wishlist state
  - [ ] Wishlist pagination (if applicable)

### **14. Order Management**

#### **14.1 Order History**
- [ ] **Order Listing**
  - [ ] Load user orders
  - [ ] Order pagination
  - [ ] Order filtering (status, date)
  - [ ] Order sorting
  - [ ] Order details display
  - [ ] Empty order history

- [ ] **Order Details**
  - [ ] Load order by number
  - [ ] Order items display
  - [ ] Shipping address display
  - [ ] Payment details display
  - [ ] Order status timeline
  - [ ] Tracking information
  - [ ] Order not found handling
  - [ ] Unauthorized access handling

#### **14.2 Order Tracking**
- [ ] **Track Order Page**
  - [ ] Load order tracking information
  - [ ] Tracking number display
  - [ ] Tracking events timeline
  - [ ] Estimated delivery date
  - [ ] Shipping address display
  - [ ] Order not found handling
  - [ ] Guest order tracking (with email)

### **15. Profile Management**

#### **15.1 Profile Display**
- [ ] **User Information**
  - [ ] Load user profile
  - [ ] Display user name
  - [ ] Display user email
  - [ ] Display user phone
  - [ ] Display loyalty points
  - [ ] Display loyalty tier
  - [ ] Profile image display

#### **15.2 Address Management**
- [ ] **Saved Addresses**
  - [ ] Load saved addresses
  - [ ] Display addresses list
  - [ ] Add new address
  - [ ] Edit address
  - [ ] Delete address
  - [ ] Set default address
  - [ ] Address validation
  - [ ] Multiple addresses handling

### **16. Consultation Booking**

#### **16.1 Consultation Form**
- [ ] **Form Submission**
  - [ ] Form validation
  - [ ] Required fields check
  - [ ] Date/time validation
  - [ ] Consultation type selection
  - [ ] Skin concerns selection
  - [ ] Form submission
  - [ ] Loading state
  - [ ] Success handling
  - [ ] Error handling

- [ ] **Consultation Management**
  - [ ] Consultation created in database
  - [ ] Email confirmation sent
  - [ ] Consultation status tracking
  - [ ] Admin consultation management

### **17. Product Comparison**

#### **17.1 Comparison Flow**
- [ ] **Add to Comparison**
  - [ ] Add product to comparison
  - [ ] Maximum products limit (4)
  - [ ] Comparison page navigation
  - [ ] Comparison URL with products

- [ ] **Comparison Display**
  - [ ] Load products for comparison
  - [ ] Comparison table display
  - [ ] Product attributes comparison
  - [ ] Remove product from comparison
  - [ ] Add more products
  - [ ] Empty comparison state

### **18. Loyalty Program**

#### **18.1 Loyalty Points**
- [ ] **Points Display**
  - [ ] Load user loyalty points
  - [ ] Points display
  - [ ] Tier display
  - [ ] Progress to next tier
  - [ ] Tier benefits display

- [ ] **Points Awarding**
  - [ ] Points awarded after order
  - [ ] Points calculation accuracy
  - [ ] Tier upgrade on points threshold
  - [ ] Points history (if applicable)

---

## ⚫ **EDGE CASES & ERROR HANDLING**

### **19. Error Scenarios**

#### **19.1 Network Errors**
- [ ] **API Failures**
  - [ ] Network timeout handling
  - [ ] Network error handling
  - [ ] API error responses
  - [ ] Retry logic for failed requests
  - [ ] Error message display
  - [ ] Fallback UI states

- [ ] **Offline Handling**
  - [ ] Offline detection
  - [ ] Offline cart management
  - [ ] Offline state persistence
  - [ ] Online reconnection handling

#### **19.2 Data Errors**
- [ ] **Missing Data**
  - [ ] Missing product images
  - [ ] Missing product information
  - [ ] Missing user data
  - [ ] Missing order data
  - [ ] Missing address data

- [ ] **Invalid Data**
  - [ ] Invalid product IDs
  - [ ] Invalid order numbers
  - [ ] Invalid email addresses
  - [ ] Invalid phone numbers
  - [ ] Invalid addresses

#### **19.3 State Errors**
- [ ] **State Inconsistency**
  - [ ] Cart state out of sync
  - [ ] Wishlist state out of sync
  - [ ] User session expired
  - [ ] Order state mismatch
  - [ ] Payment state mismatch

### **20. Edge Cases**

#### **20.1 Quantity Edge Cases**
- [ ] **Product Quantity**
  - [ ] Add to cart when quantity = 0
  - [ ] Add to cart when quantity < requested
  - [ ] Update quantity to exceed stock
  - [ ] Update quantity to negative
  - [ ] Update quantity to 0 (should remove)
  - [ ] Concurrent quantity checks

#### **20.2 Price Edge Cases**
- [ ] **Price Changes**
  - [ ] Price increases after adding to cart
  - [ ] Price decreases after adding to cart
  - [ ] Product price = 0
  - [ ] Negative price prevention
  - [ ] Price calculation rounding errors
  - [ ] Currency conversion (if applicable)

#### **20.3 Order Edge Cases**
- [ ] **Order Creation**
  - [ ] Order with all items out of stock
  - [ ] Order with zero total
  - [ ] Order with negative total
  - [ ] Order with missing shipping address
  - [ ] Order with invalid payment
  - [ ] Order creation timeout

#### **20.4 Payment Edge Cases**
- [ ] **Payment Processing**
  - [ ] Payment with zero amount
  - [ ] Payment with negative amount
  - [ ] Payment with amount > order total
  - [ ] Payment with amount < order total
  - [ ] Payment cancellation after order creation
  - [ ] Payment success but order creation fails
  - [ ] Payment failure but order created

---

## 🟣 **ADMIN PANEL** (Internal Tools)

### **21. Admin Authentication**
- [ ] **Admin Login**
  - [ ] Admin route protection
  - [ ] Admin role verification
  - [ ] Staff role verification
  - [ ] Unauthorized access prevention
  - [ ] Admin session management

### **22. Product Management**
- [ ] **Product CRUD**
  - [ ] Create product
  - [ ] Read product
  - [ ] Update product
  - [ ] Delete product (soft delete)
  - [ ] Product image upload
  - [ ] Product bulk operations
  - [ ] Product status management

### **23. Order Management**
- [ ] **Order Operations**
  - [ ] View all orders
  - [ ] Filter orders (status, date, user)
  - [ ] Search orders
  - [ ] View order details
  - [ ] Update order status
  - [ ] Cancel order
  - [ ] Refund order
  - [ ] Order export

### **24. User Management**
- [ ] **User Operations**
  - [ ] View all users
  - [ ] Search users
  - [ ] View user details
  - [ ] Edit user information
  - [ ] Deactivate user
  - [ ] Activate user
  - [ ] User role management

### **25. Promotion Management**
- [ ] **Promo Code CRUD**
  - [ ] Create promo code
  - [ ] Edit promo code
  - [ ] Delete promo code
  - [ ] View promo code usage
  - [ ] Promo code validation rules

---

## 🔷 **PERFORMANCE BOTTLENECKS**

### **26. Database Query Performance**

#### **26.1 Slow Queries**
- [ ] **Products Queries**
  - [ ] Products query with filters (< 200ms)
  - [ ] Products query with search (< 300ms)
  - [ ] Products query with pagination (< 200ms)
  - [ ] Related products query (< 150ms)
  - [ ] Database indexes on filters
  - [ ] Query result caching

- [ ] **Orders Queries**
  - [ ] Order history query (< 200ms)
  - [ ] Order details query (< 150ms)
  - [ ] Order search query (< 300ms)
  - [ ] Database indexes on orders

- [ ] **Cart Queries**
  - [ ] Cart query (< 100ms)
  - [ ] Cart count query (< 50ms)
  - [ ] Cart sync query (< 200ms)

#### **26.2 N+1 Query Problems**
- [ ] **Product Relations**
  - [ ] Products with categories (eager loading)
  - [ ] Products with images (eager loading)
  - [ ] Products with reviews (eager loading)
  - [ ] Order items with products (eager loading)

- [ ] **Order Relations**
  - [ ] Orders with items (eager loading)
  - [ ] Orders with shipping address (eager loading)
  - [ ] Orders with payments (eager loading)
  - [ ] Orders with status history (eager loading)

### **27. Frontend Performance**

#### **27.1 Component Rendering**
- [ ] **Product Grid Performance**
  - [ ] Render 12 products (< 100ms)
  - [ ] Render 50+ products (< 500ms)
  - [ ] Image lazy loading
  - [ ] Virtual scrolling (if applicable)
  - [ ] Component memoization

- [ ] **List Rendering**
  - [ ] Cart items list performance
  - [ ] Order history list performance
  - [ ] Wishlist items list performance
  - [ ] Review list performance

#### **27.2 State Management**
- [ ] **React Query Caching**
  - [ ] Query cache configuration
  - [ ] Cache invalidation timing
  - [ ] Cache size limits
  - [ ] Stale data handling
  - [ ] Background refetching

- [ ] **Local State**
  - [ ] State update performance
  - [ ] State synchronization
  - [ ] State persistence

### **28. API Performance**

#### **28.1 tRPC Performance**
- [ ] **Endpoint Response Times**
  - [ ] Query endpoints (< 200ms)
  - [ ] Mutation endpoints (< 500ms)
  - [ ] Batch requests performance
  - [ ] Concurrent request handling

- [ ] **Error Handling Performance**
  - [ ] Error response time
  - [ ] Error logging performance
  - [ ] Error recovery time

---

## 🟦 **SECURITY & VALIDATION**

### **29. Input Validation**

#### **29.1 Form Validation**
- [ ] **Client-Side Validation**
  - [ ] Email format validation
  - [ ] Password strength validation
  - [ ] Phone number validation
  - [ ] Address validation
  - [ ] Quantity validation (min/max)
  - [ ] Price validation

- [ ] **Server-Side Validation**
  - [ ] Zod schema validation
  - [ ] Input sanitization
  - [ ] SQL injection prevention
  - [ ] XSS prevention
  - [ ] CSRF protection

#### **29.2 Data Validation**
- [ ] **Order Data**
  - [ ] Order total validation
  - [ ] Order items validation
  - [ ] Shipping address validation
  - [ ] Payment amount validation

- [ ] **User Data**
  - [ ] Email uniqueness
  - [ ] Phone uniqueness (if applicable)
  - [ ] Password strength
  - [ ] User role validation

### **30. Authentication Security**

#### **30.1 Session Security**
- [ ] **Session Management**
  - [ ] Session token generation
  - [ ] Session token validation
  - [ ] Session expiration
  - [ ] Session hijacking prevention
  - [ ] Session fixation prevention

#### **30.2 Password Security**
- [ ] **Password Storage**
  - [ ] Password hashing (bcrypt)
  - [ ] Password salt generation
  - [ ] Password comparison timing attack prevention

- [ ] **Password Reset**
  - [ ] Reset token security
  - [ ] Token expiration
  - [ ] Token one-time use
  - [ ] Email enumeration prevention

### **31. Authorization Security**

#### **31.1 Route Protection**
- [ ] **Protected Routes**
  - [ ] Authentication checks
  - [ ] Authorization checks
  - [ ] Role-based access control
  - [ ] Route guards

#### **31.2 API Protection**
- [ ] **tRPC Procedures**
  - [ ] Protected procedure checks
  - [ ] Admin procedure checks
  - [ ] Staff procedure checks
  - [ ] User ownership verification

---

## 🟪 **MOBILE & RESPONSIVE TESTING**

### **32. Mobile Experience**

#### **32.1 Mobile Navigation**
- [ ] **Mobile Menu**
  - [ ] Menu toggle functionality
  - [ ] Submenu expansion
  - [ ] Menu close on navigation
  - [ ] Touch interactions
  - [ ] Swipe gestures

#### **32.2 Mobile Forms**
- [ ] **Form Usability**
  - [ ] Form input focus
  - [ ] Keyboard appearance
  - [ ] Form validation display
  - [ ] Form submission
  - [ ] Mobile-specific inputs (tel, email)

#### **32.3 Mobile Performance**
- [ ] **Page Load**
  - [ ] Mobile page load time
  - [ ] Image optimization for mobile
  - [ ] Lazy loading on mobile
  - [ ] Touch response time

---

## 🟫 **INTEGRATION TESTING**

### **33. End-to-End Flows**

#### **33.1 Complete Purchase Flow (Guest)**
- [ ] Browse products → Add to cart → Checkout → Payment → Order confirmation
- [ ] Search products → View product → Add to cart → Checkout → Payment
- [ ] Use promo code → Checkout → Payment → Order confirmation

#### **33.2 Complete Purchase Flow (Authenticated)**
- [ ] Sign in → Browse products → Add to cart → Checkout → Payment → Order confirmation
- [ ] Use saved address → Checkout → Payment → Order confirmation
- [ ] Apply promo code → Checkout → Payment → Order confirmation
- [ ] Loyalty points awarded → Order confirmation

#### **33.3 Account Creation Flow**
- [ ] Browse as guest → Add to cart → Checkout → Create account → Complete order
- [ ] Sign up → Email verification (if applicable) → Complete profile → Shop

#### **33.4 Order Tracking Flow**
- [ ] Place order → Receive email → Track order → View tracking updates
- [ ] Guest order → Track with email → View tracking information

---

## 🔶 **LOAD & STRESS TESTING**

### **34. Concurrent Users**

#### **34.1 High Traffic Scenarios**
- [ ] **100 concurrent users**
  - [ ] Homepage load performance
  - [ ] Product listing performance
  - [ ] Search performance
  - [ ] Cart operations performance
  - [ ] Checkout performance

- [ ] **500 concurrent users**
  - [ ] Database connection pool handling
  - [ ] API rate limiting
  - [ ] Server response times
  - [ ] Error rate monitoring

- [ ] **1000+ concurrent users**
  - [ ] System stability
  - [ ] Database performance
  - [ ] Cache effectiveness
  - [ ] CDN performance

#### **34.2 Peak Traffic Scenarios**
- [ ] **Flash Sale Event**
  - [ ] Product page load during sale
  - [ ] Add to cart during high traffic
  - [ ] Checkout completion during peak
  - [ ] Inventory management during sale
  - [ ] Payment processing during peak

- [ ] **Product Launch**
  - [ ] Product detail page load
  - [ ] Concurrent product views
  - [ ] Concurrent add to cart
  - [ ] Order creation spikes

### **35. Data Volume Testing**

#### **35.1 Large Datasets**
- [ ] **Products**
  - [ ] 1000+ products listing
  - [ ] 10,000+ products search
  - [ ] Product pagination with large dataset
  - [ ] Product filtering with large dataset

- [ ] **Orders**
  - [ ] 1000+ orders history
  - [ ] Order pagination performance
  - [ ] Order search performance

- [ ] **Users**
  - [ ] 10,000+ users management
  - [ ] User search performance
  - [ ] User list pagination

---

## 📊 **MONITORING & OBSERVABILITY**

### **36. Error Tracking**

#### **36.1 Error Logging**
- [ ] **Application Errors**
  - [ ] Error logging configuration
  - [ ] Error severity levels
  - [ ] Error context capture
  - [ ] Error aggregation

- [ ] **API Errors**
  - [ ] tRPC error logging
  - [ ] Error response codes
  - [ ] Error message clarity
  - [ ] Error stack traces

#### **36.2 Performance Monitoring**
- [ ] **Metrics Collection**
  - [ ] API response times
  - [ ] Database query times
  - [ ] Page load times
  - [ ] Error rates
  - [ ] User session tracking

---

## 🎯 **PRIORITY TESTING MATRIX**

### **🔴 Critical (Must Test Before Launch)**
1. Checkout & Payment Flow (All scenarios)
2. Order Creation (Authenticated & Guest)
3. Payment Webhook Processing
4. Cart Management (All operations)
5. Authentication & Authorization
6. Product Stock Management
7. Price Calculation Accuracy
8. Email Delivery (Order confirmation)

### **🟠 High Priority (Test Before Production)**
1. Search & Product Listing
2. Cart Synchronization
3. Order History & Tracking
4. Payment Gateway Integration
5. Database Performance
6. Mobile Responsiveness
7. Error Handling
8. Session Management

### **🟡 Medium Priority (Test During Beta)**
1. Wishlist Management
2. Product Comparison
3. Consultation Booking
4. Loyalty Program
5. Reviews & Ratings
6. WhatsApp Integration
7. Admin Panel Features
8. Performance Optimization

### **🟢 Low Priority (Test After Launch)**
1. Advanced Search Features
2. Analytics Integration
3. A/B Testing
4. Third-party Integrations
5. Advanced Admin Features

---

## 🧪 **TESTING TOOLS RECOMMENDATIONS**

### **Unit Testing**
- Jest
- React Testing Library
- Vitest

### **Integration Testing**
- Playwright
- Cypress
- Supertest (API testing)

### **Performance Testing**
- Lighthouse
- WebPageTest
- k6 (Load testing)
- Artillery (Load testing)

### **E2E Testing**
- Playwright
- Cypress

### **Monitoring**
- Sentry (Error tracking)
- Datadog (Performance monitoring)
- LogRocket (Session replay)

---

## 📝 **TESTING CHECKLIST SUMMARY**

**Total Test Cases: ~500+**

**Critical Path Tests: ~150**
**High Priority Tests: ~200**
**Medium Priority Tests: ~100**
**Low Priority Tests: ~50**

**Estimated Testing Time:**
- Critical Path: 3-5 days
- High Priority: 5-7 days
- Medium Priority: 3-5 days
- Low Priority: 2-3 days

**Total: ~13-20 days of dedicated testing**

---

## ⚠️ **SPECIFIC BOTTLENECK CONCERNS**

### **1. Database Transactions (CRITICAL) 🔴**
- **Concern**: Order creation uses multiple separate database operations without transactions
  - Current code in `orders.ts`: Creates order → Updates product quantities → Clears cart (separate operations)
  - **Risk**: If any operation fails, data becomes inconsistent (e.g., order created but stock not updated, or stock updated but order creation fails)
  - **Test**: 
    - Simulate database error during product quantity update
    - Simulate database error during cart clearing
    - Concurrent order creation for same product
    - Multiple users purchasing last item simultaneously
  - **Solution**: Wrap order creation in `prisma.$transaction()` to ensure atomicity
  - **Files Affected**: 
    - `src/server/modules/orders.ts` - `createOrderWithPayment` (lines 388-658)
    - `src/server/modules/orders.ts` - `createGuestOrderWithPayment` (lines 661+)
    - `src/server/modules/orders.ts` - `createOrder` (lines 231-336)

### **2. Stock Race Conditions (CRITICAL) 🔴**
- **Concern**: Stock checks and updates are not atomic
  - Current code: Check stock → Create order → Update quantities (race condition window)
  - **Risk**: Two users can purchase last item if both check stock before either updates
  - **Test**:
    - Two users adding last item to cart simultaneously
    - Two users completing checkout for last item simultaneously
    - High concurrent load on single product
  - **Solution**: Use database transactions with row-level locking or optimistic locking
  - **Files Affected**:
    - `src/server/modules/cart.ts` - `addToCart` (lines 47-115)
    - `src/server/modules/orders.ts` - All order creation functions

### **3. Cart Synchronization Race Conditions (HIGH) 🟠**
- **Concern**: Cart sync operations are sequential, not atomic
  - Current code in `useCartSync.ts`: Loops through items, adding/updating one by one
  - **Risk**: If user adds items while sync is happening, items may be lost or duplicated
  - **Test**:
    - Login while adding items to localStorage cart
    - Add items in multiple tabs while sync is running
    - Cart sync during concurrent cart updates
  - **Solution**: Use batch operations or transactions for cart sync
  - **Files Affected**:
    - `src/hooks/useCartSync.ts` (lines 37-107)
    - `src/lib/cart/sync-cart.ts`

### **4. Payment Webhook Processing (HIGH) 🟠**
- **Concern**: Duplicate webhook processing or missed webhooks
  - **Test**: 
    - Send multiple webhooks for same payment
    - Process webhook while order is being created from frontend
    - Webhook arrives before order creation completes
  - **Solution**: Idempotency keys and proper error handling
  - **Files Affected**:
    - `src/app/api/webhooks/monnify/route.ts`
    - `src/lib/webhooks/monnify.ts`

### **5. Promo Code Race Conditions (MEDIUM) 🟡**
- **Concern**: Promo code usage count increment happens after order creation
  - Current code: Check promo → Create order → Increment usage
  - **Risk**: Multiple orders could use same promo code if they check before usage is incremented
  - **Test**: Multiple users applying same promo code simultaneously
  - **Solution**: Wrap promo code validation and increment in transaction
  - **Files Affected**:
    - `src/server/modules/orders.ts` - Promo code handling (lines 464-498)
    - `src/server/modules/promotions.ts` - `validatePromoCode`

### **6. Search Performance (MEDIUM) 🟡**
- **Concern**: Slow search with large product catalog
  - **Test**: Search with 10,000+ products
  - **Solution**: Database indexes and query optimization
  - **Files Affected**:
    - `src/server/modules/products.ts`
    - `src/server/modules/search.ts`

### **7. Image Loading (MEDIUM) 🟡**
- **Concern**: Slow page load with many product images
  - **Test**: Homepage with 50+ products
  - **Solution**: Image optimization and lazy loading
  - **Files Affected**:
    - `src/components/product/product-card.tsx`
    - `src/app/(customer)/page.tsx`

### **8. Checkout Flow (MEDIUM) 🟡**
- **Concern**: Users abandoning checkout due to errors
  - **Test**: All checkout error scenarios
  - **Solution**: Comprehensive error handling and user feedback
  - **Files Affected**:
    - `src/app/(customer)/checkout/page.tsx`
    - `src/components/checkout/PaymentHandler.tsx`
    - `src/components/checkout/GuestPaymentHandler.tsx`

### **9. localStorage Quota Limits (LOW) 🟢**
- **Concern**: Large cart or search history could exceed localStorage quota (~5-10MB)
  - **Test**: Add 1000+ items to cart (unlikely but possible)
  - **Solution**: Implement storage size checks and cleanup
  - **Files Affected**:
    - `src/utils/local-cart.ts`
    - `src/components/search/SearchBar.tsx`

### **10. N+1 Query Problems (LOW) 🟢**
- **Concern**: Some queries might cause N+1 problems
  - **Current Observation**: Most queries use `Promise.all()` which is good
  - **Test**: Check all list queries for N+1 patterns
  - **Solution**: Use Prisma `include` statements or batch queries
  - **Files Affected**:
    - All query endpoints in `src/server/modules/`

---

This checklist should be used as a guide for comprehensive testing. Each item should be tested in multiple browsers (Chrome, Firefox, Safari, Edge) and on multiple devices (Desktop, Tablet, Mobile).

