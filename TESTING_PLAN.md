# Trichomes E-Commerce Testing Plan

## Table of Contents
1. [Manual Testing Plan](#manual-testing-plan)
2. [Automated Testing Plan](#automated-testing-plan)
3. [Pre-Delivery Checklist](#pre-delivery-checklist)
4. [Test Environment Setup](#test-environment-setup)

---

## Manual Testing Plan

### 1. Authentication & User Management

#### 1.1 User Registration
- [ ] **Sign Up Form**
  - [ ] Fill all required fields (first name, last name, email, phone, password)
  - [ ] Test password strength indicator
  - [ ] Test password confirmation mismatch
  - [ ] Test invalid email format
  - [ ] Test phone number validation
  - [ ] Verify terms & conditions checkbox requirement
  - [ ] Test newsletter opt-in checkbox
  - [ ] Submit form and verify account creation
  - [ ] Verify email verification sent (check logs/email)

- [ ] **Sign Up Validation**
  - [ ] Try registering with existing email
  - [ ] Test with weak password
  - [ ] Test with missing required fields
  - [ ] Test XSS attempts in input fields

- [ ] **Google OAuth Sign Up**
  - [ ] Click "Continue with Google"
  - [ ] Complete Google authentication flow
  - [ ] Verify account created with Google data
  - [ ] Verify redirect to home page

#### 1.2 User Sign In
- [ ] **Credentials Sign In**
  - [ ] Sign in with valid credentials
  - [ ] Test "Remember me" checkbox
  - [ ] Try invalid email
  - [ ] Try invalid password
  - [ ] Try non-existent account
  - [ ] Verify redirect after login (home or checkout if from cart)

- [ ] **Google OAuth Sign In**
  - [ ] Sign in with Google
  - [ ] Verify redirect to correct page

- [ ] **Password Recovery**
  - [ ] Click "Forgot password?"
  - [ ] Enter registered email
  - [ ] Verify reset email sent
  - [ ] Click reset link in email
  - [ ] Enter new password
  - [ ] Confirm password reset
  - [ ] Sign in with new password

#### 1.3 User Profile
- [ ] **View Profile**
  - [ ] Navigate to account page
  - [ ] Verify user information displayed correctly
  - [ ] Check profile image (if implemented)

- [ ] **Edit Profile**
  - [ ] Update first name
  - [ ] Update last name
  - [ ] Update phone number
  - [ ] Upload/change profile image
  - [ ] Save changes
  - [ ] Verify updates reflected

- [ ] **Change Password**
  - [ ] Enter current password
  - [ ] Enter new password
  - [ ] Confirm new password
  - [ ] Test password mismatch
  - [ ] Test wrong current password
  - [ ] Save and verify password changed

---

### 2. Product Browsing & Search

#### 2.1 Homepage
- [ ] **Hero Section**
  - [ ] Verify hero banner loads
  - [ ] Test CTA button navigation
  - [ ] Check responsive design (mobile, tablet, desktop)

- [ ] **Featured Products**
  - [ ] Verify featured products display
  - [ ] Test product card hover states
  - [ ] Click product to view details
  - [ ] Verify "Add to Cart" quick action

- [ ] **Categories Section**
  - [ ] Verify all categories display
  - [ ] Click category to filter products
  - [ ] Check category images load

#### 2.2 Product Listing Page
- [ ] **Product Display**
  - [ ] Navigate to /products
  - [ ] Verify all products load
  - [ ] Check pagination works
  - [ ] Test "Load More" if applicable
  - [ ] Verify product images load
  - [ ] Check product prices display correctly

- [ ] **Filters**
  - [ ] Filter by category
  - [ ] Filter by price range
  - [ ] Filter by brand (if implemented)
  - [ ] Test multiple filters simultaneously
  - [ ] Clear filters
  - [ ] Verify URL updates with filters

- [ ] **Sorting**
  - [ ] Sort by: Newest
  - [ ] Sort by: Price (Low to High)
  - [ ] Sort by: Price (High to Low)
  - [ ] Sort by: Popular
  - [ ] Verify sort persists when filtering

- [ ] **Search**
  - [ ] Search for product by name
  - [ ] Search for product by SKU
  - [ ] Search for product by description keywords
  - [ ] Test empty search
  - [ ] Test search with no results
  - [ ] Test special characters in search

#### 2.3 Product Detail Page
- [ ] **Product Information**
  - [ ] Verify product name, price, SKU display
  - [ ] Check product images gallery
  - [ ] Test image zoom/lightbox
  - [ ] Verify product description
  - [ ] Check short description
  - [ ] Verify category and brand info

- [ ] **Product Actions**
  - [ ] Select quantity
  - [ ] Test quantity increment/decrement
  - [ ] Test max quantity validation
  - [ ] Click "Add to Cart"
  - [ ] Verify success toast notification
  - [ ] Click "Add to Wishlist"
  - [ ] Click "Buy Now" (direct checkout)

- [ ] **Product Variants** (if applicable)
  - [ ] Select different sizes
  - [ ] Verify price updates
  - [ ] Verify stock status updates

- [ ] **Stock Status**
  - [ ] Verify "In Stock" shows when available
  - [ ] Verify "Out of Stock" shows when unavailable
  - [ ] Test adding out-of-stock product (should fail)
  - [ ] Verify low stock warning

#### 2.4 Product Comparison
- [ ] Navigate to /compare
- [ ] Add products to comparison (from product list)
- [ ] Verify max 4 products
- [ ] Compare product features
- [ ] Remove products from comparison
- [ ] Clear all comparisons

---

### 3. Shopping Cart

#### 3.1 Cart Operations
- [ ] **View Cart**
  - [ ] Navigate to /cart
  - [ ] Verify all cart items display
  - [ ] Check product images, names, prices
  - [ ] Verify quantities correct

- [ ] **Update Cart**
  - [ ] Increase item quantity
  - [ ] Decrease item quantity
  - [ ] Test quantity = 0 (should remove item)
  - [ ] Remove item with remove button
  - [ ] Verify cart totals update

- [ ] **Cart Calculations**
  - [ ] Verify subtotal correct
  - [ ] Add promo code (if applicable)
  - [ ] Verify discount applied
  - [ ] Verify shipping cost calculation
  - [ ] Verify tax calculation (if applicable)
  - [ ] Verify total correct

- [ ] **Guest Cart**
  - [ ] Add items as guest (localStorage)
  - [ ] Verify cart persists on refresh
  - [ ] Sign in and verify cart merges

- [ ] **Empty Cart**
  - [ ] View empty cart page
  - [ ] Verify "Continue Shopping" link works

---

### 4. Checkout Process

#### 4.1 Checkout as Guest
- [ ] **Guest Information**
  - [ ] Navigate to checkout without signing in
  - [ ] Click "Continue as Guest"
  - [ ] Fill shipping information form
  - [ ] Test form validation
  - [ ] Verify email format validation

#### 4.2 Checkout as Registered User
- [ ] **Saved Addresses**
  - [ ] Sign in before checkout
  - [ ] Select saved address
  - [ ] Edit selected address
  - [ ] Add new address
  - [ ] Verify "Save address" checkbox works

- [ ] **Shipping Information**
  - [ ] Enter first name, last name
  - [ ] Enter email
  - [ ] Enter phone number
  - [ ] Enter address line 1
  - [ ] Enter address line 2 (optional)
  - [ ] Enter city
  - [ ] Enter state
  - [ ] Enter postal code
  - [ ] Select country

#### 4.3 Shipping Method
- [ ] **Select Shipping**
  - [ ] View available shipping methods
  - [ ] Select Standard Shipping
  - [ ] Select Express Shipping
  - [ ] Verify shipping cost updates
  - [ ] Verify free shipping threshold (₦50,000+)

#### 4.4 Promo Codes
- [ ] **Apply Promo Code**
  - [ ] Enter valid promo code
  - [ ] Click "Apply"
  - [ ] Verify discount applied
  - [ ] Verify total updated
  - [ ] Remove promo code
  - [ ] Try invalid promo code
  - [ ] Try expired promo code

#### 4.5 Order Review
- [ ] **Order Summary**
  - [ ] Verify all items listed
  - [ ] Verify quantities correct
  - [ ] Verify prices correct
  - [ ] Check subtotal
  - [ ] Check shipping cost
  - [ ] Check tax (if applicable)
  - [ ] Check discount
  - [ ] Verify final total

#### 4.6 Payment
- [ ] **Monnify Payment**
  - [ ] Click "Continue to Payment"
  - [ ] Verify Monnify modal opens
  - [ ] Test payment with card
  - [ ] Test payment with bank transfer
  - [ ] Complete payment
  - [ ] Verify redirect to order confirmation

- [ ] **Payment Errors**
  - [ ] Test declined card
  - [ ] Test cancelled payment
  - [ ] Verify error messages
  - [ ] Verify order not created on failure

#### 4.7 Order Confirmation
- [ ] **Confirmation Page**
  - [ ] Verify "Order Confirmed" message
  - [ ] Check order number displays
  - [ ] Verify order details correct
  - [ ] Verify shipping address correct
  - [ ] Check estimated delivery date
  - [ ] Click "View Order" button
  - [ ] Verify confirmation email sent

---

### 5. Order Management

#### 5.1 Order History
- [ ] **View Orders**
  - [ ] Navigate to /order-history
  - [ ] Verify all orders listed
  - [ ] Check order statuses display
  - [ ] Verify order dates
  - [ ] Verify order totals

- [ ] **Order Details**
  - [ ] Click on order to view details
  - [ ] Verify order number
  - [ ] Check payment status
  - [ ] Check order status
  - [ ] Verify items list
  - [ ] Check shipping address
  - [ ] View order timeline/history

#### 5.2 Order Tracking
- [ ] **Track Order**
  - [ ] Navigate to /track-order
  - [ ] Enter order number
  - [ ] Enter email
  - [ ] Submit tracking form
  - [ ] Verify tracking information displays
  - [ ] Check order status updates
  - [ ] Verify tracking number (if shipped)

---

### 6. Wishlist

- [ ] **Add to Wishlist**
  - [ ] Click heart icon on product
  - [ ] Verify toast notification
  - [ ] Sign in if prompted (guest users)

- [ ] **View Wishlist**
  - [ ] Navigate to wishlist page
  - [ ] Verify all wishlist items display
  - [ ] Check product information

- [ ] **Wishlist Actions**
  - [ ] Add item to cart from wishlist
  - [ ] Remove item from wishlist
  - [ ] Clear entire wishlist

---

### 7. Consultation Booking

- [ ] **Consultation Form**
  - [ ] Navigate to /consultation
  - [ ] Fill personal information
  - [ ] Select consultation type (Skincare, Makeup, Full Beauty)
  - [ ] Select preferred date
  - [ ] Select preferred time slot
  - [ ] Select skin concerns (checkboxes)
  - [ ] Add additional notes
  - [ ] Submit form

- [ ] **Form Validation**
  - [ ] Test required fields
  - [ ] Test email validation
  - [ ] Test phone validation
  - [ ] Test date selection (should be future date)
  - [ ] Verify success message

---

### 8. Admin Panel

#### 8.1 Admin Authentication
- [ ] **Admin Login**
  - [ ] Sign in with admin credentials
  - [ ] Verify redirect to /admin
  - [ ] Test non-admin access (should be denied)

#### 8.2 Dashboard
- [ ] **Overview**
  - [ ] Verify total revenue displays
  - [ ] Check total orders count
  - [ ] Check total products count
  - [ ] Check total customers count
  - [ ] Verify recent orders list
  - [ ] Check sales charts/graphs

#### 8.3 Products Management
- [ ] **Product List**
  - [ ] Navigate to /admin/products
  - [ ] Verify all products listed
  - [ ] Check product images display
  - [ ] Verify stock levels
  - [ ] Check product statuses

- [ ] **Add Product**
  - [ ] Click "Add New Product"
  - [ ] Fill product name (auto-generates slug)
  - [ ] Verify slug auto-generation
  - [ ] Upload product image
  - [ ] Enter SKU
  - [ ] Enter price
  - [ ] Enter cost price (optional)
  - [ ] Enter compare price (optional)
  - [ ] Enter quantity
  - [ ] Set low stock threshold
  - [ ] Select category
  - [ ] Select status (Draft, Active, Inactive)
  - [ ] Enter short description
  - [ ] Enter full description
  - [ ] Check "Featured Product"
  - [ ] Check "Taxable"
  - [ ] Check "Requires Shipping"
  - [ ] Click "Create Product"
  - [ ] Verify success message
  - [ ] Verify product appears in list

- [ ] **Edit Product**
  - [ ] Click actions menu on product
  - [ ] Click "Edit Product"
  - [ ] Modify product details
  - [ ] Change product image
  - [ ] Update price
  - [ ] Update quantity
  - [ ] Click "Update Product"
  - [ ] Verify changes saved

- [ ] **View Product Details**
  - [ ] Click "View Details" in actions menu
  - [ ] Verify all product information displays
  - [ ] Check image displays correctly
  - [ ] Verify variant information (if applicable)

- [ ] **Delete Product**
  - [ ] Click "Delete Product" in actions menu
  - [ ] Verify confirmation dialog
  - [ ] Confirm deletion
  - [ ] Verify product removed from list

- [ ] **Product Filters**
  - [ ] Search products by name
  - [ ] Filter by category
  - [ ] Filter by status
  - [ ] Test multiple filters together

- [ ] **Export Products**
  - [ ] Click "Export CSV"
  - [ ] Verify CSV file downloads
  - [ ] Check CSV contains correct data

#### 8.4 Orders Management
- [ ] **Orders List**
  - [ ] Navigate to /admin/orders
  - [ ] Verify all orders listed
  - [ ] Check order numbers display
  - [ ] Verify customer names
  - [ ] Check order statuses
  - [ ] Check payment statuses
  - [ ] Verify order totals

- [ ] **Order Details**
  - [ ] Click on order to view details
  - [ ] Verify customer information
  - [ ] Check shipping address
  - [ ] Verify order items
  - [ ] Check payment information
  - [ ] View order timeline

- [ ] **Update Order Status**
  - [ ] Change order status to "Confirmed"
  - [ ] Change status to "Processing"
  - [ ] Change status to "Shipped"
  - [ ] Add tracking number
  - [ ] Change status to "Delivered"
  - [ ] Verify status history updates

- [ ] **Order Filters**
  - [ ] Filter by order status
  - [ ] Filter by payment status
  - [ ] Filter by date range
  - [ ] Search by order number
  - [ ] Search by customer name

#### 8.5 Customers Management
- [ ] **Customers List**
  - [ ] Navigate to /admin/customers
  - [ ] Verify all customers listed
  - [ ] Check customer details
  - [ ] View customer roles

- [ ] **Customer Details**
  - [ ] Click on customer
  - [ ] View customer profile
  - [ ] Check order history
  - [ ] View addresses
  - [ ] Check account status

- [ ] **Update Customer**
  - [ ] Edit customer information
  - [ ] Change customer role (if applicable)
  - [ ] Update customer status
  - [ ] Save changes

#### 8.6 Categories Management
- [ ] **Categories List**
  - [ ] View all categories
  - [ ] Check parent-child relationships
  - [ ] Verify category images

- [ ] **Add Category**
  - [ ] Create new category
  - [ ] Upload category image
  - [ ] Set parent category (for subcategory)
  - [ ] Set sort order
  - [ ] Save category

- [ ] **Edit/Delete Category**
  - [ ] Edit category details
  - [ ] Delete category
  - [ ] Verify products update

---

### 9. Responsive Design Testing

#### 9.1 Mobile (320px - 767px)
- [ ] **Navigation**
  - [ ] Test mobile menu hamburger
  - [ ] Verify menu opens/closes
  - [ ] Test navigation links
  - [ ] Check cart icon
  - [ ] Test search bar

- [ ] **Pages**
  - [ ] Homepage layout
  - [ ] Product listing page
  - [ ] Product detail page
  - [ ] Cart page
  - [ ] Checkout page
  - [ ] Account pages
  - [ ] Admin pages (if mobile-friendly)

- [ ] **Forms**
  - [ ] Test all input fields
  - [ ] Verify keyboard behavior
  - [ ] Check button sizes (touch-friendly)

#### 9.2 Tablet (768px - 1024px)
- [ ] Test all major pages
- [ ] Verify grid layouts
- [ ] Check navigation behavior
- [ ] Test forms and interactions

#### 9.3 Desktop (1025px+)
- [ ] Test all pages at 1920x1080
- [ ] Test at 1366x768
- [ ] Verify hover states
- [ ] Check desktop-specific features

---

### 10. Browser Compatibility

- [ ] **Chrome** (Latest)
  - [ ] Test all major flows
  - [ ] Check console for errors
  
- [ ] **Firefox** (Latest)
  - [ ] Test all major flows
  - [ ] Check console for errors

- [ ] **Safari** (Latest - Mac/iOS)
  - [ ] Test all major flows
  - [ ] Check console for errors

- [ ] **Edge** (Latest)
  - [ ] Test all major flows
  - [ ] Check console for errors

- [ ] **Mobile Browsers**
  - [ ] Chrome Mobile (Android)
  - [ ] Safari Mobile (iOS)

---

### 11. Performance Testing

- [ ] **Page Load Times**
  - [ ] Homepage < 3 seconds
  - [ ] Product pages < 2 seconds
  - [ ] Cart/Checkout < 2 seconds

- [ ] **Image Optimization**
  - [ ] Verify images use Next.js Image component
  - [ ] Check image sizes appropriate
  - [ ] Test lazy loading

- [ ] **API Response Times**
  - [ ] Products load quickly
  - [ ] Cart operations instant
  - [ ] Search responds quickly

---

### 12. Security Testing

- [ ] **Authentication**
  - [ ] Try accessing admin without login
  - [ ] Try accessing protected routes
  - [ ] Test session expiration
  - [ ] Test logout functionality

- [ ] **Input Validation**
  - [ ] Test XSS in text fields
  - [ ] Test SQL injection attempts
  - [ ] Test special characters
  - [ ] Test file upload restrictions

- [ ] **Payment Security**
  - [ ] Verify HTTPS in production
  - [ ] Check payment data not logged
  - [ ] Verify Monnify integration secure

---

### 13. Email Notifications

- [ ] **User Emails**
  - [ ] Registration confirmation
  - [ ] Password reset email
  - [ ] Order confirmation email
  - [ ] Order shipped notification
  - [ ] Order delivered notification

- [ ] **Admin Emails**
  - [ ] New order notification
  - [ ] Low stock alert
  - [ ] New user registration

---

### 14. Error Handling

- [ ] **404 Page**
  - [ ] Navigate to non-existent route
  - [ ] Verify custom 404 page
  - [ ] Test "Go Home" button

- [ ] **500 Error Page**
  - [ ] Trigger server error
  - [ ] Verify error page displays
  - [ ] Check error logged

- [ ] **Network Errors**
  - [ ] Disconnect internet
  - [ ] Try loading page
  - [ ] Verify offline message
  - [ ] Reconnect and verify recovery

- [ ] **Form Errors**
  - [ ] Verify validation messages clear
  - [ ] Check error styling
  - [ ] Test error recovery

---

## Automated Testing Plan

### 1. Unit Tests (Jest + React Testing Library)

#### 1.1 Components
```typescript
// tests/components/ProductCard.test.tsx
- Test product card renders correctly
- Test "Add to Cart" button click
- Test "Add to Wishlist" button click
- Test price formatting
- Test out-of-stock state
```

#### 1.2 Utilities
```typescript
// tests/utils/currency.test.ts
- Test currency formatting
- Test price calculations
- Test discount calculations

// tests/utils/validation.test.ts
- Test email validation
- Test phone validation
- Test password strength
```

#### 1.3 Hooks
```typescript
// tests/hooks/useCart.test.ts
- Test add to cart
- Test remove from cart
- Test update quantity
- Test clear cart

// tests/hooks/useAuth.test.ts
- Test login flow
- Test logout flow
- Test session management
```

### 2. Integration Tests (Jest + MSW)

#### 2.1 API Routes
```typescript
// tests/api/products.test.ts
- Test GET /api/products
- Test GET /api/products/:id
- Test POST /api/products (admin)
- Test PUT /api/products/:id (admin)
- Test DELETE /api/products/:id (admin)

// tests/api/cart.test.ts
- Test GET /api/cart
- Test POST /api/cart/add
- Test PUT /api/cart/update
- Test DELETE /api/cart/remove

// tests/api/orders.test.ts
- Test POST /api/orders (create order)
- Test GET /api/orders (user orders)
- Test GET /api/orders/:id
- Test PUT /api/orders/:id/status (admin)
```

#### 2.2 Authentication Flow
```typescript
// tests/auth/signin.test.ts
- Test successful login
- Test failed login
- Test session creation
- Test redirect after login

// tests/auth/signup.test.ts
- Test successful registration
- Test duplicate email
- Test password validation
```

### 3. End-to-End Tests (Playwright)

#### 3.1 Critical User Flows
```typescript
// e2e/checkout-flow.spec.ts
test('Complete checkout as guest', async ({ page }) => {
  // 1. Browse products
  // 2. Add to cart
  // 3. Go to checkout
  // 4. Fill shipping info
  // 5. Complete payment
  // 6. Verify order confirmation
});

test('Complete checkout as registered user', async ({ page }) => {
  // 1. Sign in
  // 2. Add products to cart
  // 3. Checkout with saved address
  // 4. Complete payment
  // 5. Verify order in history
});

// e2e/product-search.spec.ts
test('Search and filter products', async ({ page }) => {
  // 1. Enter search term
  // 2. Apply filters
  // 3. Sort results
  // 4. Verify results correct
});

// e2e/wishlist.spec.ts
test('Manage wishlist', async ({ page }) => {
  // 1. Sign in
  // 2. Add items to wishlist
  // 3. View wishlist
  // 4. Move item to cart
  // 5. Remove item
});
```

#### 3.2 Admin Flows
```typescript
// e2e/admin/product-management.spec.ts
test('Create and manage product', async ({ page }) => {
  // 1. Admin login
  // 2. Navigate to products
  // 3. Create new product
  // 4. Edit product
  // 5. Delete product
});

// e2e/admin/order-management.spec.ts
test('Process order', async ({ page }) => {
  // 1. Admin login
  // 2. View orders
  // 3. Update order status
  // 4. Add tracking number
  // 5. Mark as shipped
});
```

### 4. API Tests (Postman/Newman)

```json
// Collection: Trichomes API Tests
{
  "tests": {
    "Products": [
      "GET /api/products - List all products",
      "GET /api/products/:id - Get product by ID",
      "POST /api/products - Create product (admin)",
      "PUT /api/products/:id - Update product (admin)",
      "DELETE /api/products/:id - Delete product (admin)"
    ],
    "Orders": [
      "POST /api/orders - Create order",
      "GET /api/orders - Get user orders",
      "GET /api/orders/:id - Get order details",
      "PUT /api/orders/:id - Update order status (admin)"
    ],
    "Authentication": [
      "POST /api/auth/signin - User login",
      "POST /api/auth/signup - User registration",
      "POST /api/auth/signout - User logout"
    ]
  }
}
```

### 5. Performance Tests (Lighthouse CI)

```yaml
# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/products',
        'http://localhost:3000/products/vitamin-c-serum',
        'http://localhost:3000/cart',
        'http://localhost:3000/checkout'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }]
      }
    }
  }
};
```

---

## Pre-Delivery Checklist

### 1. Code Quality
- [ ] All linter errors fixed
- [ ] All TypeScript errors resolved
- [ ] Code formatted consistently
- [ ] No console.log() in production
- [ ] No commented-out code
- [ ] Environment variables documented

### 2. Database
- [ ] Migrations tested
- [ ] Seed data works correctly
- [ ] Backup strategy in place
- [ ] Indexes optimized
- [ ] Database credentials secure

### 3. Security
- [ ] Environment variables secure
- [ ] API keys not in code
- [ ] HTTPS configured
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection enabled

### 4. Performance
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] Bundle size optimized
- [ ] Caching strategy implemented
- [ ] CDN configured (if applicable)

### 5. SEO
- [ ] Meta tags present on all pages
- [ ] sitemap.xml generated
- [ ] robots.txt configured
- [ ] Open Graph tags added
- [ ] Twitter Card tags added
- [ ] Structured data added

### 6. Analytics & Monitoring
- [ ] Google Analytics installed
- [ ] Error tracking setup (Sentry/LogRocket)
- [ ] Uptime monitoring configured
- [ ] Performance monitoring setup

### 7. Documentation
- [ ] README.md complete
- [ ] API documentation created
- [ ] Admin guide written
- [ ] User guide created (if needed)
- [ ] Deployment guide written
- [ ] Environment variables documented

### 8. Deployment
- [ ] Production build tested
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Email service configured
- [ ] Payment gateway in live mode
- [ ] Backups scheduled

### 9. Legal
- [ ] Privacy policy page added
- [ ] Terms of service page added
- [ ] Cookie consent implemented (if EU users)
- [ ] GDPR compliance checked (if applicable)

### 10. Client Handover
- [ ] Admin credentials provided
- [ ] Payment dashboard access shared
- [ ] Email service credentials shared
- [ ] Database access documented
- [ ] Hosting dashboard access shared
- [ ] Training session scheduled
- [ ] Support plan communicated

---

## Test Environment Setup

### Local Development
```bash
# Install dependencies
pnpm install

# Setup database
pnpm prisma migrate dev
pnpm prisma db seed

# Run tests
pnpm test                 # Unit tests
pnpm test:e2e            # E2E tests
pnpm test:integration    # Integration tests

# Start dev server
pnpm dev
```

### Staging Environment
```bash
# Deploy to staging
git push staging main

# Run smoke tests
pnpm test:smoke

# Run full test suite
pnpm test:all
```

### Production Checklist
```bash
# Build production
pnpm build

# Test production build locally
pnpm start

# Run production tests
pnpm test:prod

# Deploy to production
pnpm deploy
```

---

## Test Data

### Test Accounts
```
Admin:
  Email: admin@trichomes.com
  Password: demo123

Customer:
  Email: customer@example.com
  Password: demo123

Staff:
  Email: staff@trichomes.com
  Password: demo123
```

### Test Payment Cards (Monnify Test Mode)
```
Success Card:
  Number: 5061 0200 0000 0000 151
  CVV: 123
  Expiry: 12/25

Declined Card:
  Number: 5061 0200 0000 0000 143
  CVV: 123
  Expiry: 12/25
```

### Test Promo Codes
```
WELCOME10 - 10% off first order
FREESHIP - Free shipping
SAVE20 - ₦2000 off orders over ₦20,000
```

---

## Reporting Issues

### Bug Report Template
```markdown
**Title:** [Brief description]

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/Mac/Linux/iOS/Android]
- Screen Size: [Desktop/Tablet/Mobile]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Console Errors:**
[If any]

**Priority:**
- [ ] Critical (blocks release)
- [ ] High (must fix before release)
- [ ] Medium (should fix)
- [ ] Low (nice to have)
```

---

## Testing Timeline

### Week 1: Manual Testing
- Days 1-2: Authentication & User Management
- Days 3-4: Product Browsing & Shopping Cart
- Day 5: Checkout Process

### Week 2: Admin & Automated Tests
- Days 1-2: Admin Panel Testing
- Days 3-4: Write/Run Automated Tests
- Day 5: Performance & Security Testing

### Week 3: Refinement & Documentation
- Days 1-2: Fix Critical Bugs
- Days 3-4: Regression Testing
- Day 5: Final Checks & Documentation

---

## Success Criteria

### Must Have (Release Blockers)
- [ ] No critical bugs
- [ ] All core user flows work
- [ ] Payment processing works
- [ ] Admin can manage products/orders
- [ ] Responsive on all devices
- [ ] Production environment stable

### Should Have
- [ ] All high-priority bugs fixed
- [ ] 80%+ automated test coverage
- [ ] Performance scores > 80
- [ ] All browsers supported

### Nice to Have
- [ ] All medium-priority bugs fixed
- [ ] 90%+ automated test coverage
- [ ] Performance scores > 90
- [ ] Additional features documented

---

**Last Updated:** [Date]
**Testing Lead:** [Your Name]
**Client:** [Client Name]

