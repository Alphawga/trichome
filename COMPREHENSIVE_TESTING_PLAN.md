# 🧪 COMPREHENSIVE TESTING PLAN - TRICHOMES E-COMMERCE PLATFORM

## 📋 Table of Contents
1. [Testing Overview](#testing-overview)
2. [Customer-Facing Features](#customer-facing-features)
3. [Admin Panel Features](#admin-panel-features)
4. [Manual Testing Procedures](#manual-testing-procedures)
5. [Automated Testing](#automated-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Pre-Delivery Checklist](#pre-delivery-checklist)
9. [Bug Tracking Template](#bug-tracking-template)

---

## 🎯 Testing Overview

### Testing Objectives
- ✅ Ensure all features work correctly
- ✅ Verify data integrity across all operations
- ✅ Test authentication and authorization
- ✅ Validate form submissions and error handling
- ✅ Check responsive design on all devices
- ✅ Test payment integration
- ✅ Verify email notifications
- ✅ Test database operations (CRUD)
- ✅ Check performance and load times
- ✅ Ensure security compliance

### Test Environments
- **Local Development**: http://localhost:3000
- **Staging**: [Your staging URL]
- **Production**: [Your production URL]

### Test Data
- **Admin Account**: admin@trichomes.com / demo123
- **Customer Account**: customer@example.com / demo123
- **Test Payment Cards**: Use test mode for Monnify/Payment provider
- **Test Promo Codes**: WELCOME10, NEWUSER20

---

## 🛍️ CUSTOMER-FACING FEATURES

### 1. HOMEPAGE (`/`)

#### Visual & Layout
- [ ] **Hero Section**
  - [ ] Hero image loads correctly
  - [ ] "Shop Now" button is visible and clickable
  - [ ] Hero text is readable on all screen sizes
  - [ ] Background animations work smoothly

- [ ] **Shop by Collection Section**
  - [ ] All 4 category cards display correctly
  - [ ] Category images load properly
  - [ ] Hover effects work on desktop
  - [ ] Cards are responsive on mobile/tablet
  - [ ] Click navigates to correct category page

- [ ] **Featured Products Section**
  - [ ] Shows exactly 4 featured products
  - [ ] Product images load correctly
  - [ ] Product names, prices display properly
  - [ ] "Add to Cart" button works
  - [ ] Wishlist heart icon toggles correctly
  - [ ] Quick view functionality works
  - [ ] Price formatting is correct (₦X,XXX.XX)

- [ ] **Top Sellers Section**
  - [ ] Displays best-selling products
  - [ ] All product interactions work
  - [ ] "View All" button navigates correctly

- [ ] **Footer**
  - [ ] All footer links work
  - [ ] Social media icons link correctly
  - [ ] Newsletter signup works
  - [ ] Contact information is accurate

#### Functionality
- [ ] **Add to Cart (Guest User)**
  - [ ] Click "Add to Cart" on any product
  - [ ] Cart count updates in header
  - [ ] Item is stored in localStorage
  - [ ] Toast notification shows success message
  - [ ] Page doesn't reload

- [ ] **Add to Cart (Authenticated User)**
  - [ ] Click "Add to Cart" on any product
  - [ ] Cart count updates in header
  - [ ] Item is saved to database
  - [ ] Toast notification shows success message

- [ ] **Wishlist Toggle (Guest User)**
  - [ ] Click heart icon redirects to sign-in page
  - [ ] Toast shows "Please sign in" message

- [ ] **Wishlist Toggle (Authenticated User)**
  - [ ] Click heart icon adds to wishlist
  - [ ] Wishlist count updates in header
  - [ ] Heart icon fills/unfills correctly
  - [ ] Toast shows success message

- [ ] **Category Navigation**
  - [ ] Click on category card
  - [ ] Navigates to `/products?category=[slug]`
  - [ ] Products are filtered correctly

---

### 2. PRODUCTS PAGE (`/products`)

#### Display & Filtering
- [ ] **Product Grid**
  - [ ] Products display in grid layout
  - [ ] Shows 12 products per page initially
  - [ ] Responsive grid (4 cols desktop, 2 cols tablet, 1 col mobile)
  - [ ] Product cards show: image, name, price, brand
  - [ ] "Out of Stock" badge shows when quantity = 0
  - [ ] "Sale" badge shows when compare_price exists

- [ ] **Search Functionality**
  - [ ] Type in search box
  - [ ] Results update as you type (debounced)
  - [ ] Search works for product name
  - [ ] Search works for product description
  - [ ] Empty results show "No products found"
  - [ ] Clear search returns all products

- [ ] **Category Filter**
  - [ ] Category dropdown loads all categories
  - [ ] Select category filters products
  - [ ] Category name shows in breadcrumbs
  - [ ] URL updates with category slug
  - [ ] Clear filter shows all products

- [ ] **Price Range Filter**
  - [ ] Slider moves smoothly
  - [ ] Min and max prices display
  - [ ] Products filter as slider moves
  - [ ] Price range resets correctly
  - [ ] Works with other filters

- [ ] **Sort Options**
  - [ ] Featured (default)
  - [ ] Price: Low to High
  - [ ] Price: High to Low
  - [ ] Name: A to Z
  - [ ] Name: Z to A
  - [ ] Newest arrivals
  - [ ] Each sort option works correctly

- [ ] **Pagination**
  - [ ] "Load More" button appears after 12 products
  - [ ] Clicking loads next 12 products
  - [ ] Loading indicator shows while fetching
  - [ ] Smooth scroll to new products
  - [ ] Pagination works with filters

#### Product Interactions
- [ ] **Product Click**
  - [ ] Click on product card
  - [ ] Navigates to `/products/[slug]`
  - [ ] Product details page loads

- [ ] **Quick Add to Cart**
  - [ ] Click "Add to Cart" from grid
  - [ ] Product adds with quantity 1
  - [ ] Cart count updates
  - [ ] Toast notification shows

- [ ] **Wishlist from Grid**
  - [ ] Heart icon click
  - [ ] Adds/removes from wishlist
  - [ ] Icon state updates
  - [ ] Wishlist count updates

---

### 3. PRODUCT DETAILS PAGE (`/products/[id]`)

#### Product Information Display
- [ ] **Image Gallery**
  - [ ] Main product image displays
  - [ ] Thumbnail images show below
  - [ ] Click thumbnail changes main image
  - [ ] Image zoom on hover (desktop)
  - [ ] Swipe/scroll works on mobile
  - [ ] All images load in correct order

- [ ] **Product Details**
  - [ ] Product name displays correctly
  - [ ] Price shows in correct format (₦)
  - [ ] Compare price shows if exists (with strikethrough)
  - [ ] SKU displays
  - [ ] Brand name shows
  - [ ] Category shows and links correctly
  - [ ] Stock status visible (In Stock/Out of Stock)
  - [ ] Short description displays
  - [ ] Full description renders (HTML if applicable)

- [ ] **Product Variants (if applicable)**
  - [ ] Size selector shows available sizes
  - [ ] Color selector shows available colors
  - [ ] Out of stock variants are disabled
  - [ ] Selected variant updates price
  - [ ] Selected variant updates images

#### Actions & Interactions
- [ ] **Quantity Selector**
  - [ ] Default quantity is 1
  - [ ] Plus button increments quantity
  - [ ] Minus button decrements quantity
  - [ ] Cannot go below 1
  - [ ] Cannot exceed available stock
  - [ ] Input field allows manual entry
  - [ ] Invalid inputs are handled

- [ ] **Add to Cart**
  - [ ] Button enabled when product in stock
  - [ ] Button disabled when out of stock
  - [ ] Click adds correct quantity to cart
  - [ ] Cart modal/notification appears
  - [ ] Loading state shows during add
  - [ ] Error handled if stock insufficient

- [ ] **Add to Wishlist**
  - [ ] Heart button visible
  - [ ] Click adds to wishlist (if authenticated)
  - [ ] Redirects to login if guest
  - [ ] Heart fills when in wishlist
  - [ ] Toast notification shows

- [ ] **WhatsApp Inquiry**
  - [ ] WhatsApp button visible
  - [ ] Click opens WhatsApp with pre-filled message
  - [ ] Message includes product name and link
  - [ ] Works on mobile and desktop

- [ ] **Share Product**
  - [ ] Share button visible
  - [ ] Opens share modal/menu
  - [ ] Copy link works
  - [ ] Social share buttons work

#### Additional Sections
- [ ] **Product Tabs/Accordion**
  - [ ] Description tab shows full description
  - [ ] Ingredients tab shows ingredients (if applicable)
  - [ ] How to Use tab shows usage instructions
  - [ ] Accordion expands/collapses smoothly

- [ ] **Reviews Section**
  - [ ] Shows existing reviews
  - [ ] Displays average rating
  - [ ] Star ratings display correctly
  - [ ] Review images load (if applicable)
  - [ ] "Write a Review" button visible
  - [ ] Review form works (if authenticated)

- [ ] **Related Products**
  - [ ] Shows 4 related products
  - [ ] Products from same category
  - [ ] Carousel/grid navigation works
  - [ ] Product clicks work

---

### 4. SHOPPING CART PAGE (`/cart`)

#### Cart Display
- [ ] **Empty Cart State**
  - [ ] Shows "Your cart is empty" message
  - [ ] Displays empty cart icon
  - [ ] "Start Shopping" button works
  - [ ] No order summary visible

- [ ] **Cart with Items**
  - [ ] All cart items display correctly
  - [ ] Product image shows for each item
  - [ ] Product name is clickable (goes to product page)
  - [ ] Unit price displays correctly
  - [ ] Quantity displays correctly
  - [ ] Subtotal per item is accurate
  - [ ] Category badge shows (if applicable)

#### Cart Actions
- [ ] **Update Quantity**
  - [ ] Plus button increments quantity
  - [ ] Minus button decrements quantity
  - [ ] Quantity updates in real-time
  - [ ] Subtotal recalculates automatically
  - [ ] Cannot exceed available stock
  - [ ] Loading state shows during update

- [ ] **Remove Item**
  - [ ] Trash icon visible for each item
  - [ ] Click removes item from cart
  - [ ] Confirmation modal appears (optional)
  - [ ] Cart updates immediately
  - [ ] Toast shows "Item removed"
  - [ ] Cart count in header updates

- [ ] **Move to Wishlist**
  - [ ] Heart icon visible for each item
  - [ ] Click moves item to wishlist
  - [ ] Item removed from cart
  - [ ] Added to wishlist
  - [ ] Requires authentication

- [ ] **Clear Cart**
  - [ ] "Clear Cart" button visible
  - [ ] Confirmation modal appears
  - [ ] All items removed
  - [ ] Cart resets to empty state

#### Order Summary
- [ ] **Price Calculations**
  - [ ] Subtotal is sum of all item totals
  - [ ] Shipping cost displays (₦4,500 standard)
  - [ ] Free shipping shows if threshold met
  - [ ] Tax displays (if applicable)
  - [ ] Discount applies if promo code used
  - [ ] Total = Subtotal + Shipping + Tax - Discount
  - [ ] All amounts format correctly with commas

- [ ] **Promo Code**
  - [ ] Input field visible
  - [ ] "Apply" button works
  - [ ] Valid code applies discount
  - [ ] Discount amount shows
  - [ ] Invalid code shows error message
  - [ ] "Remove" button removes discount
  - [ ] Applied code persists to checkout

- [ ] **Proceed to Checkout**
  - [ ] Button prominently displayed
  - [ ] Disabled if cart empty
  - [ ] Guest user: redirects to sign-in
  - [ ] Auth user: proceeds to checkout
  - [ ] Loading state shows
  - [ ] Cart data carries over

#### Guest vs Authenticated
- [ ] **Guest User**
  - [ ] Cart stored in localStorage
  - [ ] Cart persists on page refresh
  - [ ] "Proceed to Checkout" prompts sign-in
  - [ ] After login, localStorage cart merges

- [ ] **Authenticated User**
  - [ ] Cart stored in database
  - [ ] Cart syncs across devices
  - [ ] Cart persists after logout/login
  - [ ] Can proceed directly to checkout

---

### 5. CHECKOUT PAGE (`/checkout`)

#### Shipping Information
- [ ] **Form Display**
  - [ ] All required fields marked with *
  - [ ] First Name field
  - [ ] Last Name field
  - [ ] Email field
  - [ ] Phone field (with Nigeria prefix)
  - [ ] Address Line 1 field
  - [ ] Address Line 2 field (optional)
  - [ ] City field
  - [ ] State dropdown (Nigerian states)
  - [ ] Postal Code field
  - [ ] Country field (default: Nigeria)

- [ ] **Form Validation**
  - [ ] Empty required fields show error on submit
  - [ ] Email format validated
  - [ ] Phone number format validated
  - [ ] All errors display below fields
  - [ ] Error styling (red border/text)
  - [ ] Form cannot submit with errors
  - [ ] Success styling on valid input

- [ ] **Saved Addresses (Authenticated)**
  - [ ] List of saved addresses shows
  - [ ] Radio buttons to select address
  - [ ] Selected address auto-fills form
  - [ ] "Add New Address" option available
  - [ ] Can edit selected address

- [ ] **Guest Checkout**
  - [ ] Checkbox "Save my information" visible
  - [ ] Prompts to create account
  - [ ] Proceeds without creating account

#### Shipping Method
- [ ] **Shipping Options**
  - [ ] Standard shipping (₦4,500, 5-7 days)
  - [ ] Express shipping (₦9,000, 2-3 days)
  - [ ] Pickup option (Free, if available)
  - [ ] Radio buttons for selection
  - [ ] Selected method highlighted
  - [ ] Shipping cost updates in summary

- [ ] **Shipping Calculation**
  - [ ] Free shipping if order > ₦50,000
  - [ ] Standard rate applies by default
  - [ ] Express rate added if selected
  - [ ] Shipping cost shows in summary

#### Payment
- [ ] **Payment Methods**
  - [ ] Credit/Debit Card option
  - [ ] Bank Transfer option
  - [ ] USSD option
  - [ ] Payment on Delivery (if applicable)
  - [ ] Selected method highlighted

- [ ] **Promo Code Section**
  - [ ] Input field visible
  - [ ] "Apply" button works
  - [ ] Valid code applies discount
  - [ ] Discount reflects in total
  - [ ] Invalid code shows error
  - [ ] Can remove applied code

- [ ] **Order Summary**
  - [ ] All cart items listed
  - [ ] Item quantities shown
  - [ ] Item prices shown
  - [ ] Subtotal calculated
  - [ ] Shipping cost shown
  - [ ] Discount shown (if applicable)
  - [ ] Tax shown (if applicable)
  - [ ] Grand Total calculated correctly
  - [ ] "Edit Cart" link works

#### Place Order
- [ ] **Submit Button**
  - [ ] "Place Order" button visible
  - [ ] Button disabled if form invalid
  - [ ] Loading spinner shows on click
  - [ ] Button text changes "Processing..."

- [ ] **Payment Processing**
  - [ ] Monnify payment modal opens
  - [ ] Modal shows correct amount
  - [ ] Modal shows order details
  - [ ] Can enter card details
  - [ ] Can enter bank details
  - [ ] Test card works
  - [ ] Error handling for failed payments
  - [ ] Can close modal and retry

- [ ] **Success Flow**
  - [ ] Payment success detected
  - [ ] Redirects to order confirmation page
  - [ ] Order number displayed
  - [ ] Confirmation email sent
  - [ ] Cart cleared
  - [ ] Order saved to database

- [ ] **Failure Flow**
  - [ ] Payment failure detected
  - [ ] Error message displayed
  - [ ] Can retry payment
  - [ ] Order status = PENDING
  - [ ] Cart not cleared

---

### 6. ORDER CONFIRMATION PAGE (`/order-confirmation`)

#### Order Details Display
- [ ] **Order Number**
  - [ ] Displays prominently
  - [ ] Format: ORD-XXXXXXXXXX
  - [ ] Can copy to clipboard

- [ ] **Order Status**
  - [ ] Shows current status (PENDING, PROCESSING, etc.)
  - [ ] Status badge styled correctly
  - [ ] Status description shown

- [ ] **Customer Information**
  - [ ] Email address shown
  - [ ] Shipping address shown
  - [ ] Billing address shown (if different)
  - [ ] Phone number shown

- [ ] **Order Items**
  - [ ] All ordered products listed
  - [ ] Product images shown
  - [ ] Product names shown
  - [ ] Quantities shown
  - [ ] Individual prices shown
  - [ ] Item totals calculated

- [ ] **Order Summary**
  - [ ] Subtotal shown
  - [ ] Shipping cost shown
  - [ ] Discount shown (if applicable)
  - [ ] Tax shown (if applicable)
  - [ ] Total amount shown
  - [ ] Payment method shown

- [ ] **Next Steps**
  - [ ] Confirmation message displayed
  - [ ] Expected delivery date shown
  - [ ] Tracking information (if available)
  - [ ] Support contact info visible

#### Actions
- [ ] **Track Order**
  - [ ] "Track Order" button visible
  - [ ] Navigates to tracking page
  - [ ] Order number carried over

- [ ] **View Order History**
  - [ ] "View Orders" button visible
  - [ ] Navigates to order history
  - [ ] Shows all user orders

- [ ] **Continue Shopping**
  - [ ] Button visible
  - [ ] Returns to homepage or products

- [ ] **Print Receipt**
  - [ ] Print button visible
  - [ ] Opens print dialog
  - [ ] Receipt formatted correctly

---

### 7. ORDER TRACKING PAGE (`/track-order`)

#### Guest Tracking
- [ ] **Tracking Form**
  - [ ] Order number input field
  - [ ] Email input field
  - [ ] Both fields required
  - [ ] Validation on submit
  - [ ] "Track Order" button works
  - [ ] Loading state shows

- [ ] **Access from Email**
  - [ ] Tracking link in email works
  - [ ] Pre-fills order number and email
  - [ ] Auto-loads tracking info

#### Tracking Display
- [ ] **Order Status Timeline**
  - [ ] Visual timeline displayed
  - [ ] All status steps shown (Pending → Confirmed → Processing → Shipped → Delivered)
  - [ ] Current status highlighted
  - [ ] Completed steps checkmarked
  - [ ] Timestamps for each step
  - [ ] Descriptions for each step

- [ ] **Shipping Information**
  - [ ] Carrier name shown
  - [ ] Tracking number displayed
  - [ ] Can copy tracking number
  - [ ] Link to carrier site (if available)
  - [ ] Estimated delivery date shown
  - [ ] Origin and destination shown

- [ ] **Tracking Updates**
  - [ ] List of tracking events
  - [ ] Sorted by date (newest first)
  - [ ] Location and description for each event
  - [ ] Timestamps for each event
  - [ ] Auto-refreshes periodically

- [ ] **Order Details**
  - [ ] Order number shown
  - [ ] Order date shown
  - [ ] Items in order listed
  - [ ] Total amount shown
  - [ ] Shipping address shown

#### Error States
- [ ] **Invalid Order**
  - [ ] "Order not found" message
  - [ ] Helpful error text
  - [ ] Option to retry

- [ ] **Order Not Yet Shipped**
  - [ ] Shows status as "Processing"
  - [ ] Message: "Your order is being prepared"
  - [ ] Expected ship date shown

---

### 8. ORDER HISTORY PAGE (`/order-history`)

#### Authentication
- [ ] **Guest User**
  - [ ] Redirects to sign-in page
  - [ ] Shows "Please sign in" message

- [ ] **Authenticated User**
  - [ ] Page loads immediately
  - [ ] Shows user's orders

#### Orders List
- [ ] **Empty State**
  - [ ] "No orders yet" message
  - [ ] "Start Shopping" button
  - [ ] Button navigates to products page

- [ ] **Orders Table**
  - [ ] All user orders listed
  - [ ] Table headers: Order #, Items, Total, Status, Date, Actions
  - [ ] Responsive on mobile (stacked cards)

- [ ] **Order Information**
  - [ ] Order number (clickable)
  - [ ] Order date formatted (DD-MM-YYYY)
  - [ ] Number of items
  - [ ] Total amount with ₦ symbol
  - [ ] Order status badge
  - [ ] Status colors: Green (Delivered), Blue (Shipped), Yellow (Processing), Gray (Pending), Red (Cancelled)

- [ ] **Actions**
  - [ ] "View Order" button/link
  - [ ] Navigates to tracking page
  - [ ] "Buy Again" button (optional)
  - [ ] "Write Review" (if delivered)

#### Pagination
- [ ] **Pagination Controls**
  - [ ] Shows 10 orders per page
  - [ ] "Previous" and "Next" buttons
  - [ ] Current page indicator
  - [ ] Total pages shown
  - [ ] Disabled state for first/last page
  - [ ] Smooth loading between pages

#### Filters
- [ ] **Status Filter**
  - [ ] Dropdown to filter by status
  - [ ] Options: All, Pending, Processing, Shipped, Delivered, Cancelled
  - [ ] Filters apply immediately
  - [ ] Count updates

- [ ] **Date Range Filter**
  - [ ] Date picker for start date
  - [ ] Date picker for end date
  - [ ] "Apply" button
  - [ ] Results filter correctly

- [ ] **Search**
  - [ ] Search by order number
  - [ ] Search by product name
  - [ ] Results update as typing

---

### 9. WISHLIST PAGE (`/wishlist`)

#### Authentication
- [ ] **Guest User**
  - [ ] Redirects to sign-in page
  - [ ] Message: "Please sign in to view wishlist"

- [ ] **Authenticated User**
  - [ ] Wishlist loads immediately
  - [ ] Shows all wishlist items

#### Wishlist Display
- [ ] **Empty Wishlist**
  - [ ] "Your wishlist is empty" message
  - [ ] Empty wishlist icon
  - [ ] "Start Shopping" button
  - [ ] Button navigates to products

- [ ] **Wishlist Items**
  - [ ] Grid layout (4 cols desktop, 2 tablet, 1 mobile)
  - [ ] Product image displayed
  - [ ] Product name shown
  - [ ] Product price shown
  - [ ] "In Stock" or "Out of Stock" badge
  - [ ] Sale badge if discounted

#### Actions
- [ ] **Add to Cart**
  - [ ] "Add to Cart" button per item
  - [ ] Click adds to cart
  - [ ] Item remains in wishlist
  - [ ] Cart count updates
  - [ ] Toast notification

- [ ] **Remove from Wishlist**
  - [ ] X or trash icon per item
  - [ ] Click removes item
  - [ ] Wishlist updates immediately
  - [ ] Wishlist count updates
  - [ ] Toast notification

- [ ] **Move All to Cart**
  - [ ] Button to add all items to cart
  - [ ] Only adds in-stock items
  - [ ] Shows confirmation
  - [ ] Cart updates

- [ ] **Share Wishlist**
  - [ ] "Share" button visible
  - [ ] Generates shareable link
  - [ ] Can copy link
  - [ ] Social sharing options

#### Product Interactions
- [ ] **Product Click**
  - [ ] Click on product image/name
  - [ ] Navigates to product details page
  - [ ] Product page loads correctly

- [ ] **Quick View**
  - [ ] Eye icon for quick view
  - [ ] Opens modal with product details
  - [ ] Can add to cart from modal
  - [ ] Modal closes properly

---

### 10. USER PROFILE PAGE (`/profile`)

#### Profile Information
- [ ] **Personal Details**
  - [ ] First name displays
  - [ ] Last name displays
  - [ ] Email displays
  - [ ] Phone number displays
  - [ ] Profile picture shows (if uploaded)
  - [ ] Default avatar if no picture

- [ ] **Edit Profile**
  - [ ] "Edit Profile" button visible
  - [ ] Click opens edit form
  - [ ] All fields pre-filled with current data
  - [ ] Can update first name
  - [ ] Can update last name
  - [ ] Can update phone number
  - [ ] Email field read-only (or requires verification)
  - [ ] "Save Changes" button
  - [ ] "Cancel" button

- [ ] **Upload Profile Picture**
  - [ ] Upload button/area visible
  - [ ] Click opens file picker
  - [ ] Accepts jpg, png, gif
  - [ ] Image preview before upload
  - [ ] Upload progress indicator
  - [ ] Success/error message
  - [ ] Profile picture updates

- [ ] **Change Password**
  - [ ] "Change Password" button/link
  - [ ] Opens change password form
  - [ ] Current password field
  - [ ] New password field
  - [ ] Confirm new password field
  - [ ] Password strength indicator
  - [ ] Validation: min 8 chars, 1 uppercase, 1 number
  - [ ] Passwords must match
  - [ ] Submit changes password
  - [ ] Success/error toast

#### Saved Addresses
- [ ] **Address List**
  - [ ] All saved addresses displayed
  - [ ] Default address highlighted
  - [ ] Address cards show: Name, Address, City, State, Phone

- [ ] **Add New Address**
  - [ ] "Add New Address" button
  - [ ] Opens address form
  - [ ] All fields: First Name, Last Name, Address 1, Address 2, City, State, Postal Code, Phone
  - [ ] "Set as Default" checkbox
  - [ ] Save button
  - [ ] Validation on all fields

- [ ] **Edit Address**
  - [ ] Edit button per address
  - [ ] Opens pre-filled form
  - [ ] Can modify all fields
  - [ ] Can change default status
  - [ ] Save updates address

- [ ] **Delete Address**
  - [ ] Delete button per address
  - [ ] Confirmation modal appears
  - [ ] Deletes on confirm
  - [ ] Cannot delete default address without setting new default

#### Account Settings
- [ ] **Email Preferences**
  - [ ] Newsletter subscription toggle
  - [ ] Order updates toggle
  - [ ] Promotions toggle
  - [ ] Save preferences

- [ ] **Privacy Settings**
  - [ ] Profile visibility toggle
  - [ ] Order history visibility toggle
  - [ ] Save settings

- [ ] **Account Actions**
  - [ ] "Delete Account" button (red)
  - [ ] Confirmation modal with warning
  - [ ] Requires password to confirm
  - [ ] Account deleted on confirm
  - [ ] Redirects to homepage

---

### 11. CONSULTATION PAGE (`/consultation`)

#### Form Display
- [ ] **Consultation Type**
  - [ ] Radio buttons for types:
    - [ ] Skin Analysis
    - [ ] Product Recommendation
    - [ ] Routine Building
    - [ ] General Inquiry
  - [ ] Required field validation

- [ ] **Personal Information**
  - [ ] Name field (pre-filled if authenticated)
  - [ ] Email field (pre-filled if authenticated)
  - [ ] Phone number field
  - [ ] All fields required
  - [ ] Validation on submit

- [ ] **Skin Concerns**
  - [ ] Checkboxes for common concerns:
    - [ ] Acne
    - [ ] Dark spots/Hyperpigmentation
    - [ ] Dryness
    - [ ] Oiliness
    - [ ] Aging/Wrinkles
    - [ ] Sensitivity
    - [ ] Other (text field)
  - [ ] Multiple selection allowed

- [ ] **Additional Details**
  - [ ] Textarea for detailed message
  - [ ] Character limit indicator
  - [ ] Min 50 characters
  - [ ] Required field

- [ ] **Preferred Contact Method**
  - [ ] Radio buttons: Email, Phone, WhatsApp
  - [ ] Default: Email

- [ ] **Preferred Time**
  - [ ] Date picker for preferred date
  - [ ] Time slot selector (Morning, Afternoon, Evening)
  - [ ] Optional fields

#### Form Submission
- [ ] **Validation**
  - [ ] All required fields checked
  - [ ] Email format validated
  - [ ] Phone format validated
  - [ ] Error messages display
  - [ ] Cannot submit with errors

- [ ] **Submit**
  - [ ] Submit button enabled when valid
  - [ ] Loading state on click
  - [ ] Success message on submit
  - [ ] Confirmation email sent
  - [ ] Form clears after submit

- [ ] **Post-Submission**
  - [ ] Success page/modal shown
  - [ ] Confirmation number displayed
  - [ ] Expected response time mentioned
  - [ ] "Back to Home" button

---

### 12. COMPARE PRODUCTS PAGE (`/compare`)

#### Adding Products to Compare
- [ ] **From Product Grid**
  - [ ] "Compare" checkbox on product cards
  - [ ] Can select up to 4 products
  - [ ] Toast shows "Added to compare"
  - [ ] Compare count updates

- [ ] **Compare Button**
  - [ ] "Compare (X)" button in header/sticky bar
  - [ ] Shows number of products selected
  - [ ] Click navigates to compare page

#### Compare Page Display
- [ ] **Product Columns**
  - [ ] Shows selected products (max 4)
  - [ ] Product images at top
  - [ ] Product names
  - [ ] Prices displayed

- [ ] **Comparison Attributes**
  - [ ] Price
  - [ ] Brand
  - [ ] Category
  - [ ] Ingredients
  - [ ] Suitable for (skin types)
  - [ ] Volume/Size
  - [ ] Rating
  - [ ] Reviews count
  - [ ] In Stock status

- [ ] **Actions**
  - [ ] "Add to Cart" button per product
  - [ ] "Remove from Compare" button per product
  - [ ] "Clear All" button
  - [ ] "Add More Products" button

- [ ] **Responsiveness**
  - [ ] Horizontal scroll on mobile
  - [ ] Table format on desktop
  - [ ] Cards format on mobile

---

### 13. ABOUT PAGE (`/about`)

#### Content Display
- [ ] **Hero Section**
  - [ ] Hero image/banner loads
  - [ ] Page title displays
  - [ ] Breadcrumbs work

- [ ] **About Content**
  - [ ] Company story section
  - [ ] Mission and vision
  - [ ] Values section
  - [ ] Team section (if applicable)
  - [ ] Images load correctly
  - [ ] Text readable on all devices

- [ ] **Call to Action**
  - [ ] "Shop Now" button
  - [ ] "Contact Us" button
  - [ ] "Book Consultation" button
  - [ ] All buttons navigate correctly

---

### 14. BRANDS PAGE (`/brands`)

#### Display
- [ ] **Brands List**
  - [ ] All brands displayed
  - [ ] Brand logos shown
  - [ ] Brand names shown
  - [ ] Grid layout responsive

- [ ] **Brand Filtering**
  - [ ] Search brands by name
  - [ ] Results filter live
  - [ ] Empty state if no matches

- [ ] **Brand Click**
  - [ ] Click on brand
  - [ ] Navigates to products filtered by brand
  - [ ] Brand name in breadcrumbs

---

### 15. REWARDS PAGE (`/rewards`)

#### Rewards Program Information
- [ ] **Tiers Display**
  - [ ] Bronze, Silver, Gold tiers shown
  - [ ] Benefits listed per tier
  - [ ] Points required for each tier
  - [ ] Tier colors styled correctly

- [ ] **User Points (if authenticated)**
  - [ ] Current points balance shown
  - [ ] Current tier displayed
  - [ ] Progress to next tier
  - [ ] Points history visible

- [ ] **How to Earn Points**
  - [ ] List of ways to earn points
  - [ ] Points value for each action
  - [ ] Clear explanations

- [ ] **How to Redeem**
  - [ ] List of redemption options
  - [ ] Points required for each reward
  - [ ] "Redeem" buttons (if enough points)

#### Actions
- [ ] **View Points History**
  - [ ] Button to view history
  - [ ] Table of all point transactions
  - [ ] Date, action, points earned/spent

- [ ] **Redeem Rewards**
  - [ ] Click "Redeem" on reward
  - [ ] Confirmation modal
  - [ ] Points deducted
  - [ ] Reward code/coupon provided

---

### 16. AUTHENTICATION FLOWS

#### Sign Up Page (`/auth/signup`)
- [ ] **Form Fields**
  - [ ] First Name
  - [ ] Last Name
  - [ ] Email
  - [ ] Password (with show/hide toggle)
  - [ ] Confirm Password
  - [ ] All fields required

- [ ] **Validation**
  - [ ] Email format check
  - [ ] Password strength: min 8 chars, 1 uppercase, 1 number
  - [ ] Passwords must match
  - [ ] Errors display inline
  - [ ] Cannot submit with errors

- [ ] **Sign Up Button**
  - [ ] Disabled if form invalid
  - [ ] Loading state on click
  - [ ] Success: redirects to dashboard/home
  - [ ] Error: displays error message

- [ ] **Google Sign Up**
  - [ ] "Sign up with Google" button
  - [ ] Opens Google OAuth
  - [ ] Creates account
  - [ ] Redirects to home/dashboard

- [ ] **Already Have Account**
  - [ ] Link to sign-in page
  - [ ] Link works correctly

#### Sign In Page (`/auth/signin`)
- [ ] **Form Fields**
  - [ ] Email
  - [ ] Password (with show/hide toggle)
  - [ ] "Remember Me" checkbox
  - [ ] All fields required

- [ ] **Validation**
  - [ ] Email format check
  - [ ] Password required
  - [ ] Errors display

- [ ] **Sign In Button**
  - [ ] Disabled if form invalid
  - [ ] Loading state
  - [ ] Success: redirects to intended page or home
  - [ ] Error: displays error message

- [ ] **Google Sign In**
  - [ ] "Sign in with Google" button
  - [ ] Opens Google OAuth
  - [ ] Signs in user
  - [ ] Redirects appropriately

- [ ] **Forgot Password**
  - [ ] Link visible
  - [ ] Navigates to forgot password page

- [ ] **Don't Have Account**
  - [ ] Link to sign-up page
  - [ ] Link works correctly

#### Forgot Password Page (`/auth/forgot-password`)
- [ ] **Email Input**
  - [ ] Email field
  - [ ] Email validation
  - [ ] Required field

- [ ] **Submit**
  - [ ] "Send Reset Link" button
  - [ ] Loading state
  - [ ] Success message
  - [ ] Email sent with reset link
  - [ ] Link expires after time

- [ ] **Email Link**
  - [ ] Click link in email
  - [ ] Navigates to reset password page
  - [ ] Token validated

#### Reset Password Page (`/auth/reset-password`)
- [ ] **Form Fields**
  - [ ] New Password
  - [ ] Confirm New Password
  - [ ] Password strength indicator

- [ ] **Validation**
  - [ ] Password requirements
  - [ ] Passwords must match
  - [ ] Token validation

- [ ] **Submit**
  - [ ] "Reset Password" button
  - [ ] Success: password changed
  - [ ] Redirects to sign-in
  - [ ] Can sign in with new password

#### Account Page (`/account`)
- [ ] **New User Options**
  - [ ] "Sign Up" button
  - [ ] "Sign In" button
  - [ ] "Sign in with Google" button

- [ ] **Returning User**
  - [ ] Already signed in: redirects to profile
  - [ ] Shows user info if authenticated

---

## 👨‍💼 ADMIN PANEL FEATURES

### 1. ADMIN DASHBOARD (`/admin`)

#### Access Control
- [ ] **Authentication**
  - [ ] Non-admin redirected to home
  - [ ] Admin can access
  - [ ] Session persists

#### Dashboard Overview
- [ ] **Statistics Cards**
  - [ ] Total Products count
  - [ ] Total Orders count
  - [ ] Total Customers count
  - [ ] Total Revenue (₦)
  - [ ] All stats accurate
  - [ ] Real-time updates

- [ ] **Charts (if applicable)**
  - [ ] Sales chart displays
  - [ ] Revenue chart displays
  - [ ] Time period selector works
  - [ ] Charts update based on filters

- [ ] **Recent Orders**
  - [ ] Latest 5-10 orders listed
  - [ ] Order number, customer, amount, status shown
  - [ ] Click navigates to order details

- [ ] **Top Products Table**
  - [ ] Shows top selling products
  - [ ] Product image, name, category, price, stock
  - [ ] Sortable columns
  - [ ] "View All" link to products page

- [ ] **Quick Actions**
  - [ ] Add Product button
  - [ ] Add Category button
  - [ ] View Orders button
  - [ ] All buttons navigate correctly

#### Search & Filters
- [ ] **Global Search**
  - [ ] Search bar in header
  - [ ] Searches products
  - [ ] Searches orders
  - [ ] Searches customers
  - [ ] Results display correctly

- [ ] **Export Reports**
  - [ ] Export button visible
  - [ ] Options: CSV, PDF
  - [ ] Date range selector
  - [ ] Export generates file
  - [ ] File downloads correctly

---

### 2. PRODUCTS MANAGEMENT (`/admin/products`)

#### Products List
- [ ] **Display**
  - [ ] All products listed
  - [ ] Product image, name, SKU, price, stock, status
  - [ ] Grid or table view toggle
  - [ ] Responsive on mobile

- [ ] **Search & Filters**
  - [ ] Search by name, SKU
  - [ ] Filter by category (dropdown)
  - [ ] Filter by status (Active, Draft, Archived)
  - [ ] Filter by stock (In Stock, Low Stock, Out of Stock)
  - [ ] Filters apply immediately

- [ ] **Sorting**
  - [ ] Sort by name
  - [ ] Sort by price
  - [ ] Sort by stock
  - [ ] Sort by date added
  - [ ] Ascending/descending toggle

- [ ] **Pagination**
  - [ ] Shows 15-20 products per page
  - [ ] Page numbers visible
  - [ ] Previous/Next buttons
  - [ ] Can jump to specific page

#### Product Actions
- [ ] **Add New Product**
  - [ ] "Add New Product" button
  - [ ] Opens product form sheet/modal
  - [ ] Form fields:
    - [ ] Name (required)
    - [ ] Slug (auto-generated, editable)
    - [ ] SKU (required)
    - [ ] Price (required)
    - [ ] Compare Price (optional)
    - [ ] Cost Price (optional)
    - [ ] Quantity (required)
    - [ ] Category (dropdown, required)
    - [ ] Status (dropdown: Active, Draft, Archived)
    - [ ] Short Description (required)
    - [ ] Full Description (rich text editor)
    - [ ] Is Featured (checkbox)
    - [ ] SEO Title (optional)
    - [ ] SEO Description (optional)
    - [ ] Images (upload, multiple)
  - [ ] Validation on all required fields
  - [ ] "Save" button
  - [ ] "Cancel" button

- [ ] **Edit Product**
  - [ ] Edit icon/button per product
  - [ ] Opens form pre-filled with product data
  - [ ] Can modify all fields
  - [ ] "Update" button
  - [ ] Changes saved to database
  - [ ] Success toast

- [ ] **Delete Product**
  - [ ] Delete icon/button per product
  - [ ] Confirmation modal
  - [ ] "Are you sure?" message
  - [ ] Delete on confirm
  - [ ] Product removed from list
  - [ ] Success toast

- [ ] **Duplicate Product**
  - [ ] Duplicate button per product
  - [ ] Creates copy with " (Copy)" appended to name
  - [ ] New SKU generated
  - [ ] Opens edit form for new product

- [ ] **Bulk Actions**
  - [ ] Checkboxes to select multiple products
  - [ ] "Select All" checkbox
  - [ ] Bulk actions dropdown: Delete, Change Status, Export
  - [ ] Actions apply to selected products
  - [ ] Confirmation for bulk delete

#### Product Details View
- [ ] **View Product**
  - [ ] Eye icon to view product
  - [ ] Opens detailed view sheet/modal
  - [ ] Shows all product information
  - [ ] Shows product images
  - [ ] Shows stock history
  - [ ] Shows sales analytics
  - [ ] "Edit" button in view
  - [ ] "Close" button

#### Image Upload
- [ ] **Upload Product Images**
  - [ ] Upload button/dropzone
  - [ ] Accepts jpg, png, webp
  - [ ] Max file size: 5MB per image
  - [ ] Multiple images upload
  - [ ] Image preview before save
  - [ ] Upload progress indicator
  - [ ] Success/error messages
  - [ ] Can reorder images (drag & drop)
  - [ ] Can set primary image
  - [ ] Can delete images

#### Inventory Management
- [ ] **Stock Alerts**
  - [ ] Low stock badge (< 10 items)
  - [ ] Out of stock badge (0 items)
  - [ ] Can set custom low stock threshold per product

- [ ] **Update Stock**
  - [ ] Quick stock update field per product
  - [ ] Enter new quantity
  - [ ] Save updates stock
  - [ ] Stock history logged

---

### 3. CATEGORIES MANAGEMENT (`/admin/categories`)

#### Categories List
- [ ] **Display**
  - [ ] All categories listed
  - [ ] Shows: Name, Slug, Parent Category, Products Count, Status
  - [ ] Hierarchical tree view (parent > child)
  - [ ] Responsive

- [ ] **Search**
  - [ ] Search by category name
  - [ ] Results filter live

- [ ] **Statistics**
  - [ ] Total categories count
  - [ ] Active categories count
  - [ ] Parent categories count
  - [ ] Subcategories count

#### Category Actions
- [ ] **Add New Category**
  - [ ] "Add New Category" button
  - [ ] Opens category form
  - [ ] Fields:
    - [ ] Name (required)
    - [ ] Slug (auto-generated, editable)
    - [ ] Parent Category (dropdown, optional)
    - [ ] Description (textarea)
    - [ ] Image (upload, optional)
    - [ ] Status (Active, Draft, Archived)
    - [ ] Sort Order (number)
    - [ ] SEO Title
    - [ ] SEO Description
  - [ ] Validation
  - [ ] "Save" button

- [ ] **Edit Category**
  - [ ] Edit button per category
  - [ ] Form pre-filled
  - [ ] Can modify all fields
  - [ ] "Update" button
  - [ ] Success toast

- [ ] **Delete Category**
  - [ ] Delete button per category
  - [ ] Cannot delete if has products (show warning)
  - [ ] Confirmation modal
  - [ ] Delete on confirm
  - [ ] Success toast

- [ ] **View Category**
  - [ ] Eye icon per category
  - [ ] Shows category details
  - [ ] Lists all products in category
  - [ ] "Edit" button in view

#### Category Tree/Hierarchy
- [ ] **Parent-Child Relationships**
  - [ ] Parent categories collapsible
  - [ ] Subcategories indented/nested
  - [ ] Expand/collapse controls
  - [ ] Drag & drop to reorder
  - [ ] Drag & drop to change parent

---

### 4. ORDERS MANAGEMENT (`/admin/orders`)

#### Orders List
- [ ] **Display**
  - [ ] All orders listed
  - [ ] Shows: Order #, Customer, Items, Total, Order Status, Payment Status, Date
  - [ ] Newest orders first
  - [ ] Responsive table

- [ ] **Statistics Cards**
  - [ ] Total Orders
  - [ ] Pending Orders
  - [ ] Total Revenue
  - [ ] Shipped Orders

- [ ] **Search**
  - [ ] Search by order number
  - [ ] Search by customer name
  - [ ] Search by customer email
  - [ ] Results update live

- [ ] **Filters**
  - [ ] Filter by order status (All, Pending, Processing, Shipped, Delivered, Cancelled)
  - [ ] Filter by payment status (All, Pending, Paid, Failed, Refunded)
  - [ ] Filter by date range
  - [ ] Filters apply immediately
  - [ ] Clear filters button

- [ ] **Sorting**
  - [ ] Sort by date
  - [ ] Sort by total amount
  - [ ] Sort by customer name
  - [ ] Ascending/descending

- [ ] **Pagination**
  - [ ] Shows 15-20 orders per page
  - [ ] Pagination controls

#### Order Actions
- [ ] **View Order**
  - [ ] Eye icon per order
  - [ ] Opens order details sheet/modal
  - [ ] Shows:
    - [ ] Order number
    - [ ] Customer info
    - [ ] Shipping address
    - [ ] Billing address
    - [ ] All order items (image, name, qty, price)
    - [ ] Subtotal, shipping, tax, discount, total
    - [ ] Payment method
    - [ ] Order status timeline
    - [ ] Tracking number (if shipped)
  - [ ] "Edit" button in view
  - [ ] "Print Invoice" button
  - [ ] "Send Email" button

- [ ] **Edit Order**
  - [ ] Edit button per order
  - [ ] Can update order status
  - [ ] Can update payment status
  - [ ] Can add tracking number
  - [ ] Can add internal notes
  - [ ] Cannot edit items (show warning)
  - [ ] "Save Changes" button
  - [ ] Customer notified of status change (email)

- [ ] **Update Order Status**
  - [ ] Status dropdown per order
  - [ ] Options: Pending, Processing, Shipped, Delivered, Cancelled, Returned
  - [ ] Change updates status immediately
  - [ ] Confirmation for Cancelled/Returned
  - [ ] Customer notified

- [ ] **Add Tracking Number**
  - [ ] Input field in order details
  - [ ] Enter tracking number
  - [ ] Select carrier
  - [ ] Save updates order
  - [ ] Customer notified with tracking link

- [ ] **Bulk Actions**
  - [ ] Select multiple orders
  - [ ] Bulk actions: Update Status, Export, Delete
  - [ ] Confirmation modals

#### Order Details/Invoice
- [ ] **Print Invoice**
  - [ ] "Print Invoice" button
  - [ ] Opens print dialog
  - [ ] Invoice formatted correctly
  - [ ] Includes: Company info, customer info, items, totals
  - [ ] Prints cleanly

- [ ] **Export Order**
  - [ ] Export button per order
  - [ ] Options: PDF, CSV
  - [ ] File downloads

---

### 5. CUSTOMERS MANAGEMENT (`/admin/customers`)

#### Customers List
- [ ] **Display**
  - [ ] All customers listed
  - [ ] Shows: Photo, Name, Email, Phone, Location, Orders, Total Spent, Loyalty Points, Status, Last Order
  - [ ] Responsive table

- [ ] **Statistics Cards**
  - [ ] Total Customers
  - [ ] Active Customers
  - [ ] Total Revenue from customers
  - [ ] Average Order Value

- [ ] **Search**
  - [ ] Search by name
  - [ ] Search by email
  - [ ] Search by phone
  - [ ] Results update live

- [ ] **Filters**
  - [ ] Filter by status (All, Active, Inactive, Suspended, Pending Verification)
  - [ ] Filter by loyalty tier (Bronze, Silver, Gold)
  - [ ] Filter by registration date
  - [ ] Filters apply immediately

- [ ] **Sorting**
  - [ ] Sort by name
  - [ ] Sort by total spent
  - [ ] Sort by orders count
  - [ ] Sort by registration date

#### Customer Actions
- [ ] **View Customer**
  - [ ] Eye icon per customer
  - [ ] Opens customer details sheet/modal
  - [ ] Shows:
    - [ ] Profile info
    - [ ] Contact info
    - [ ] All saved addresses
    - [ ] Order history
    - [ ] Total spent
    - [ ] Loyalty points
    - [ ] Account status
    - [ ] Registration date
    - [ ] Last login date
  - [ ] "Edit" button in view

- [ ] **Edit Customer**
  - [ ] Edit button per customer
  - [ ] Can update: First Name, Last Name, Phone, Status
  - [ ] Cannot edit email (security)
  - [ ] Can manually adjust loyalty points
  - [ ] "Save Changes" button
  - [ ] Success toast

- [ ] **Contact Customer**
  - [ ] Email icon per customer
  - [ ] Opens email client with customer email pre-filled
  - [ ] Or internal messaging system

- [ ] **Suspend/Activate Customer**
  - [ ] Status toggle per customer
  - [ ] Confirmation modal
  - [ ] Updates status
  - [ ] Customer notified

- [ ] **Delete Customer**
  - [ ] Delete button (use with caution)
  - [ ] Confirmation modal with warning
  - [ ] Option to keep order history
  - [ ] Delete removes account

#### Customer Insights
- [ ] **Top Customers by Spending**
  - [ ] Widget showing top 5-10 customers
  - [ ] Name, photo, total spent
  - [ ] Click to view customer

- [ ] **Customer Distribution by Location**
  - [ ] Chart/list showing customers per state
  - [ ] Count per location

---

### 6. PROMOTIONS MANAGEMENT (`/admin/promotions`)

#### Promotions List
- [ ] **Display**
  - [ ] All promotions listed
  - [ ] Shows: Name, Code, Discount, Usage, Duration, Status, Target
  - [ ] Responsive table

- [ ] **Statistics Cards**
  - [ ] Active Promotions
  - [ ] Total Usage
  - [ ] Scheduled Promotions
  - [ ] Expired Promotions

- [ ] **Search**
  - [ ] Search by promotion name
  - [ ] Search by promo code
  - [ ] Results update live

- [ ] **Filters**
  - [ ] Filter by status (All, Active, Inactive, Expired, Scheduled)
  - [ ] Filter by type (All, Percentage, Fixed Amount, Free Shipping, Buy X Get Y)
  - [ ] Filters apply immediately

#### Promotion Actions
- [ ] **Create Promotion**
  - [ ] "Create Promotion" button
  - [ ] Opens promotion form
  - [ ] Fields:
    - [ ] Name (required)
    - [ ] Code (required, unique)
    - [ ] Type (dropdown: Percentage, Fixed Amount, Free Shipping, Buy X Get Y)
    - [ ] Value (required, based on type)
    - [ ] Min Order Value (optional)
    - [ ] Usage Limit (optional, 0 = unlimited)
    - [ ] User Usage Limit (how many times one user can use)
    - [ ] Start Date (required)
    - [ ] End Date (required)
    - [ ] Target Customers (All, New Customers, VIP, Specific Tier)
    - [ ] Applicable Products (All, Specific Categories, Specific Products)
    - [ ] Status (Active, Inactive, Scheduled)
  - [ ] Validation
  - [ ] "Create" button

- [ ] **Edit Promotion**
  - [ ] Edit button per promotion
  - [ ] Form pre-filled
  - [ ] Can modify all fields
  - [ ] Cannot edit code if already used
  - [ ] "Update" button

- [ ] **View Promotion**
  - [ ] Eye icon per promotion
  - [ ] Shows all promotion details
  - [ ] Shows usage statistics
  - [ ] Shows list of orders that used this promo
  - [ ] "Edit" button in view

- [ ] **Copy Promo Code**
  - [ ] Copy icon per promotion
  - [ ] Copies code to clipboard
  - [ ] Toast confirmation

- [ ] **Toggle Status**
  - [ ] Activate/Deactivate toggle per promotion
  - [ ] Updates status immediately
  - [ ] Confirmation for deactivation

- [ ] **Delete Promotion**
  - [ ] Delete button per promotion
  - [ ] Cannot delete if used (show warning)
  - [ ] Confirmation modal
  - [ ] Delete removes promotion

#### Quick Campaign Templates
- [ ] **Pre-built Templates**
  - [ ] New Customer Welcome (20% off)
  - [ ] Free Shipping (above threshold)
  - [ ] VIP Exclusive
  - [ ] Flash Sale
  - [ ] Student Discount
  - [ ] Birthday Special
  - [ ] Click template auto-fills form

---

### 7. PERMISSIONS & USERS MANAGEMENT (`/admin/permissions`)

#### Users List
- [ ] **Display**
  - [ ] All users (Admin, Staff) listed
  - [ ] Shows: Photo, Name, Email, Role, Status, Last Login
  - [ ] Responsive table

- [ ] **Roles Overview**
  - [ ] Role cards: Admin, Staff, Customer
  - [ ] Shows number of users per role
  - [ ] Shows role description
  - [ ] Shows permissions summary

#### User Actions
- [ ] **Add New User**
  - [ ] "Add New User" button
  - [ ] Form fields: First Name, Last Name, Email, Password, Role
  - [ ] Role dropdown: Admin, Staff, Customer
  - [ ] Assign permissions
  - [ ] "Create User" button

- [ ] **Edit User**
  - [ ] Edit button per user
  - [ ] Can update name, email, role, status
  - [ ] Can change password
  - [ ] Can assign/revoke permissions
  - [ ] "Save Changes" button

- [ ] **View User**
  - [ ] Eye icon per user
  - [ ] Shows user details
  - [ ] Shows permissions list
  - [ ] Shows activity log
  - [ ] "Edit" button in view

- [ ] **Delete User**
  - [ ] Delete button per user
  - [ ] Cannot delete self
  - [ ] Confirmation modal
  - [ ] Delete removes user

#### Permissions Management
- [ ] **Permission Modules**
  - [ ] Users: Create, Read, Update, Delete
  - [ ] Products: Create, Read, Update, Delete
  - [ ] Orders: Create, Read, Update, Delete
  - [ ] Promotions: Create, Read, Update, Delete
  - [ ] System: Admin access

- [ ] **Assign Permissions**
  - [ ] Checkboxes for each permission
  - [ ] Can select multiple
  - [ ] Save updates permissions
  - [ ] Permissions take effect immediately

- [ ] **Role-Based Permissions**
  - [ ] Admin: All permissions
  - [ ] Staff: Read/Update products, orders, customers
  - [ ] Customer: Read own data only

---

### 8. ADMIN PROFILE (`/admin/profile`)

#### Profile Information
- [ ] **Personal Details**
  - [ ] First Name
  - [ ] Last Name
  - [ ] Email
  - [ ] Phone
  - [ ] Profile Picture
  - [ ] Role badge (Admin/Staff)

- [ ] **Edit Profile**
  - [ ] Edit button
  - [ ] Can update all fields except role
  - [ ] Can upload new profile picture
  - [ ] Save changes

- [ ] **Change Password**
  - [ ] Separate section for password
  - [ ] Current password required
  - [ ] New password fields
  - [ ] Validation
  - [ ] Save changes password

#### Activity Log
- [ ] **Recent Activity**
  - [ ] List of recent actions
  - [ ] Timestamp for each action
  - [ ] Action type (Created Product, Updated Order, etc.)
  - [ ] Details of action

- [ ] **Login History**
  - [ ] List of recent logins
  - [ ] Date & time
  - [ ] IP address
  - [ ] Device/Browser info

---

## 🧪 MANUAL TESTING PROCEDURES

### Test Case Template

```markdown
**Test Case ID**: TC-XXX
**Module**: [Module Name]
**Test Title**: [Short description]
**Priority**: High/Medium/Low
**Preconditions**: [Required state before test]

**Steps**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Status**: Pass/Fail
**Notes**: [Any observations]
```

### Critical User Flows to Test

#### Flow 1: Guest User Complete Purchase
1. Open homepage
2. Browse products
3. Add 3 products to cart
4. View cart
5. Update quantities
6. Apply promo code
7. Proceed to checkout (redirects to sign-in)
8. Create new account
9. Complete shipping info
10. Select shipping method
11. Enter payment details
12. Place order
13. Verify order confirmation
14. Check confirmation email
15. Track order

**Expected**: Complete flow without errors, order created, email sent

#### Flow 2: Authenticated User Reorder
1. Sign in to existing account
2. Go to order history
3. Click on previous order
4. Click "Buy Again"
5. Items added to cart
6. Proceed to checkout
7. Use saved address
8. Select express shipping
9. Use saved payment method
10. Place order
11. Verify order confirmation

**Expected**: Seamless reorder, saved data used, order successful

#### Flow 3: Admin Product Management
1. Sign in as admin
2. Go to Products page
3. Click "Add New Product"
4. Fill all required fields
5. Upload 3 product images
6. Set as Featured
7. Save product
8. Verify product appears in list
9. Edit product (change price)
10. Save changes
11. Verify changes saved
12. View product on frontend
13. Add product to cart from frontend
14. Verify purchase flow works

**Expected**: Product created, edited, visible, purchasable

#### Flow 4: Admin Order Fulfillment
1. Sign in as admin
2. Go to Orders page
3. Filter pending orders
4. Click on first pending order
5. View order details
6. Update status to "Processing"
7. Verify customer receives email
8. Update status to "Shipped"
9. Add tracking number
10. Verify customer receives tracking email
11. Customer checks tracking page
12. Verify tracking info displays correctly

**Expected**: Status updates work, emails sent, tracking visible

### Browser Testing Matrix

| Feature | Chrome | Firefox | Safari | Edge | Mobile Chrome | Mobile Safari |
|---------|--------|---------|--------|------|---------------|---------------|
| Homepage | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Products Grid | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Product Details | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Add to Cart | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Checkout | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Payment | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Admin Dashboard | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### Device Testing Matrix

| Feature | Desktop (1920x1080) | Laptop (1366x768) | Tablet (768x1024) | Mobile (375x667) | Mobile (414x896) |
|---------|---------------------|-------------------|-------------------|------------------|------------------|
| Navigation | [ ] | [ ] | [ ] | [ ] | [ ] |
| Product Grid | [ ] | [ ] | [ ] | [ ] | [ ] |
| Forms | [ ] | [ ] | [ ] | [ ] | [ ] |
| Modals | [ ] | [ ] | [ ] | [ ] | [ ] |
| Tables | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## 🤖 AUTOMATED TESTING

### Unit Tests (Jest + React Testing Library)

#### Example Test: Product Card Component

```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/product/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 15000,
    images: [{ url: '/test.jpg' }],
    slug: 'test-product',
    // ... other fields
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₦15,000')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', () => {
    const handleAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />);
    
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);
    
    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct, 1);
  });

  it('shows out of stock badge when quantity is 0', () => {
    const outOfStockProduct = { ...mockProduct, quantity: 0 };
    render(<ProductCard product={outOfStockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });
});
```

#### Tests to Write

- [ ] **Components**
  - [ ] ProductCard component
  - [ ] CartItem component
  - [ ] OrderSummary component
  - [ ] AddressForm component
  - [ ] ProductFilter component
  - [ ] Header component
  - [ ] Footer component

- [ ] **Utilities**
  - [ ] Price formatting functions
  - [ ] Date formatting functions
  - [ ] Cart calculations
  - [ ] Validation functions

- [ ] **Hooks**
  - [ ] useAuth hook
  - [ ] useCart hook
  - [ ] useWishlist hook

### Integration Tests (Playwright)

#### Test Files to Create

```bash
e2e/
├── customer/
│   ├── homepage.spec.ts
│   ├── product-browsing.spec.ts
│   ├── product-details.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   ├── order-tracking.spec.ts
│   ├── wishlist.spec.ts
│   ├── profile.spec.ts
│   └── consultation.spec.ts
├── admin/
│   ├── dashboard.spec.ts
│   ├── products.spec.ts
│   ├── orders.spec.ts
│   ├── customers.spec.ts
│   ├── categories.spec.ts
│   └── promotions.spec.ts
└── auth/
    ├── signup.spec.ts
    ├── signin.spec.ts
    └── password-reset.spec.ts
```

#### Example E2E Test: Complete Checkout Flow

```typescript
// e2e/customer/complete-checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Checkout Flow', () => {
  test('Guest user can complete purchase', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');
    
    // 2. Add product to cart
    await page.click('[data-testid="product-card"]');
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('text=Added to cart')).toBeVisible();
    
    // 3. View cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL(/.*cart/);
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    
    // 4. Proceed to checkout (redirects to sign-in)
    await page.click('text=Proceed to Checkout');
    await expect(page).toHaveURL(/.*signin/);
    
    // 5. Sign up
    await page.click('text=Sign Up');
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'TestPass123');
    await page.fill('[name="confirmPassword"]', 'TestPass123');
    await page.click('button[type="submit"]');
    
    // Should redirect to checkout
    await expect(page).toHaveURL(/.*checkout/);
    
    // 6. Fill shipping info
    await page.fill('[name="phone"]', '+2348012345678');
    await page.fill('[name="address_1"]', '123 Test Street');
    await page.fill('[name="city"]', 'Lagos');
    await page.selectOption('[name="state"]', 'Lagos');
    await page.fill('[name="postal_code"]', '100001');
    
    // 7. Select shipping method
    await page.click('input[value="standard"]');
    
    // 8. Continue to payment
    await page.click('text=Continue to Payment');
    
    // 9. Verify payment modal
    await expect(page.locator('[data-testid="payment-modal"]')).toBeVisible();
    
    // Note: In test, payment would be mocked
    // For real test, use test card: 5061020000000000094
  });
});
```

### API Tests (Supertest + Jest)

#### Example API Test: Products Endpoint

```typescript
// __tests__/api/products.test.ts
import { createMocks } from 'node-mocks-http';
import productsHandler from '@/app/api/products/route';

describe('/api/products', () => {
  it('returns list of products', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '10' },
    });

    await productsHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBe(true);
    expect(data).toHaveProperty('pagination');
  });

  it('filters products by category', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { category: 'serums' },
    });

    await productsHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    data.products.forEach(product => {
      expect(product.category.slug).toBe('serums');
    });
  });

  it('returns 400 for invalid query params', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { page: 'invalid' },
    });

    await productsHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 70% coverage
- **Integration Tests**: Critical user flows (10-15 flows)
- **E2E Tests**: Complete user journeys (5-8 journeys)
- **API Tests**: All endpoints

### Running Tests

```bash
# Unit tests
pnpm test

# Unit tests with coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# E2E tests with UI
pnpm test:e2e:ui

# E2E tests in specific browser
pnpm test:e2e --project=chromium

# All tests
pnpm test:all
```

---

## ⚡ PERFORMANCE TESTING

### Metrics to Measure

- [ ] **Page Load Times**
  - [ ] Homepage: < 2s
  - [ ] Products page: < 2.5s
  - [ ] Product details: < 2s
  - [ ] Cart page: < 1.5s
  - [ ] Checkout page: < 2s
  - [ ] Admin dashboard: < 3s

- [ ] **Lighthouse Scores**
  - [ ] Performance: > 90
  - [ ] Accessibility: > 95
  - [ ] Best Practices: > 90
  - [ ] SEO: > 90

- [ ] **Core Web Vitals**
  - [ ] Largest Contentful Paint (LCP): < 2.5s
  - [ ] First Input Delay (FID): < 100ms
  - [ ] Cumulative Layout Shift (CLS): < 0.1

### Performance Tests

- [ ] **Image Optimization**
  - [ ] All images use Next.js Image component
  - [ ] Images lazy load
  - [ ] Correct image sizes served
  - [ ] WebP format used when supported

- [ ] **Bundle Size**
  - [ ] Analyze bundle with `next build`
  - [ ] Check for large dependencies
  - [ ] Code splitting implemented
  - [ ] Tree shaking working

- [ ] **Database Queries**
  - [ ] No N+1 queries
  - [ ] Indexes on commonly queried fields
  - [ ] Pagination on large datasets
  - [ ] Query response times < 100ms

- [ ] **API Response Times**
  - [ ] All API routes respond < 500ms
  - [ ] Caching implemented where appropriate
  - [ ] Database connection pooling

- [ ] **Load Testing**
  - [ ] Test with 100 concurrent users
  - [ ] Test checkout under load
  - [ ] Test admin actions under load
  - [ ] Monitor server resources

### Performance Testing Tools

```bash
# Lighthouse
npx lighthouse https://your-site.com --view

# Bundle analyzer
pnpm build
pnpm analyze

# Load testing with Artillery
npm install -g artillery
artillery quick --count 100 --num 10 https://your-site.com
```

---

## 🔒 SECURITY TESTING

### Authentication & Authorization

- [ ] **Password Security**
  - [ ] Passwords hashed (bcrypt)
  - [ ] Min 8 characters enforced
  - [ ] Complexity requirements
  - [ ] Password reset tokens expire
  - [ ] Old password required for change

- [ ] **Session Management**
  - [ ] Sessions expire after inactivity
  - [ ] Secure session cookies (httpOnly, secure)
  - [ ] CSRF protection enabled
  - [ ] Logout clears session

- [ ] **Role-Based Access**
  - [ ] Admin routes protected
  - [ ] Staff has limited permissions
  - [ ] Customers can only access own data
  - [ ] API endpoints check permissions

### Input Validation

- [ ] **Form Validation**
  - [ ] Client-side validation
  - [ ] Server-side validation
  - [ ] SQL injection prevention (use Prisma)
  - [ ] XSS prevention (sanitize inputs)
  - [ ] File upload validation (type, size)

- [ ] **API Validation**
  - [ ] All inputs validated with Zod
  - [ ] Type checking enforced
  - [ ] Rate limiting on sensitive endpoints
  - [ ] Request size limits

### Data Protection

- [ ] **Sensitive Data**
  - [ ] Credit card data not stored
  - [ ] PII encrypted at rest
  - [ ] HTTPS enforced
  - [ ] Environment variables secured

- [ ] **Database Security**
  - [ ] Database credentials in .env
  - [ ] Connection string not exposed
  - [ ] Prepared statements used
  - [ ] Least privilege database user

### Security Headers

```typescript
// Check these headers are set
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': "default-src 'self'"
}
```

### Penetration Testing Checklist

- [ ] **OWASP Top 10**
  - [ ] Injection
  - [ ] Broken Authentication
  - [ ] Sensitive Data Exposure
  - [ ] XML External Entities (XXE)
  - [ ] Broken Access Control
  - [ ] Security Misconfiguration
  - [ ] Cross-Site Scripting (XSS)
  - [ ] Insecure Deserialization
  - [ ] Using Components with Known Vulnerabilities
  - [ ] Insufficient Logging & Monitoring

- [ ] **Payment Security**
  - [ ] PCI DSS compliance (Monnify handles this)
  - [ ] No card data stored
  - [ ] Payment gateway SSL verified
  - [ ] Payment webhooks authenticated

---

## ✅ PRE-DELIVERY CHECKLIST

### Code Quality

- [ ] **Linting & Formatting**
  - [ ] Run `pnpm lint` - no errors
  - [ ] Run `pnpm format` - all files formatted
  - [ ] No console.logs in production code
  - [ ] No commented-out code blocks
  - [ ] All TypeScript errors resolved

- [ ] **Code Review**
  - [ ] All features peer-reviewed
  - [ ] No hardcoded credentials
  - [ ] No TODO comments remaining
  - [ ] Functions properly documented

### Database

- [ ] **Migrations**
  - [ ] All migrations run successfully
  - [ ] Seed data created
  - [ ] Indexes optimized
  - [ ] Backup strategy in place

- [ ] **Data Integrity**
  - [ ] Foreign keys set correctly
  - [ ] Cascading deletes configured
  - [ ] No orphaned records
  - [ ] Data validation at DB level

### Environment Setup

- [ ] **Environment Variables**
  - [ ] .env.example up to date
  - [ ] All required vars documented
  - [ ] Production vars set in hosting platform
  - [ ] No secrets in code

- [ ] **Configuration**
  - [ ] Database URL correct
  - [ ] Cloudinary credentials set
  - [ ] Monnify keys (prod mode)
  - [ ] Email service configured
  - [ ] WhatsApp number set

### Deployment

- [ ] **Build & Deploy**
  - [ ] `pnpm build` succeeds
  - [ ] No build warnings
  - [ ] Static pages generated correctly
  - [ ] API routes deployed
  - [ ] Database migrations run on prod

- [ ] **Domain & SSL**
  - [ ] Custom domain configured
  - [ ] SSL certificate installed
  - [ ] HTTPS redirects working
  - [ ] WWW redirect configured

### Monitoring & Analytics

- [ ] **Error Tracking**
  - [ ] Sentry (or similar) configured
  - [ ] Error boundaries in place
  - [ ] Logging for critical errors

- [ ] **Analytics**
  - [ ] Google Analytics installed
  - [ ] Conversion tracking set up
  - [ ] Ecommerce tracking enabled
  - [ ] Custom events configured

- [ ] **Performance Monitoring**
  - [ ] Uptime monitoring (UptimeRobot)
  - [ ] Performance monitoring (Vercel Analytics)
  - [ ] Database query monitoring

### Testing Final Checks

- [ ] **Functionality**
  - [ ] All critical flows tested in production
  - [ ] Guest checkout works
  - [ ] Authenticated checkout works
  - [ ] Payment processing works
  - [ ] Email notifications sent
  - [ ] Order tracking works
  - [ ] Admin panel fully functional

- [ ] **Cross-Browser**
  - [ ] Tested in Chrome
  - [ ] Tested in Firefox
  - [ ] Tested in Safari
  - [ ] Tested in Edge
  - [ ] Tested on iOS Safari
  - [ ] Tested on Android Chrome

- [ ] **Responsive Design**
  - [ ] Works on 375px (iPhone SE)
  - [ ] Works on 414px (iPhone Pro)
  - [ ] Works on 768px (iPad)
  - [ ] Works on 1024px (iPad Pro)
  - [ ] Works on 1440px (Laptop)
  - [ ] Works on 1920px (Desktop)

### Documentation

- [ ] **User Documentation**
  - [ ] User guide created
  - [ ] FAQ section complete
  - [ ] Contact/support info visible

- [ ] **Admin Documentation**
  - [ ] Admin manual created
  - [ ] How to add products
  - [ ] How to manage orders
  - [ ] How to create promotions
  - [ ] How to manage customers

- [ ] **Technical Documentation**
  - [ ] README.md complete
  - [ ] API documentation
  - [ ] Database schema documented
  - [ ] Environment setup guide
  - [ ] Deployment guide

### Legal & Compliance

- [ ] **Policies**
  - [ ] Privacy Policy page
  - [ ] Terms & Conditions page
  - [ ] Refund Policy page
  - [ ] Shipping Policy page
  - [ ] Cookie Policy

- [ ] **GDPR/Data Protection**
  - [ ] Cookie consent banner
  - [ ] Data deletion process
  - [ ] Data export process
  - [ ] User consent logged

### Client Handover

- [ ] **Access & Credentials**
  - [ ] Admin account created for client
  - [ ] Hosting account access transferred
  - [ ] Domain registrar access shared
  - [ ] Database backup access shared
  - [ ] Email service access shared
  - [ ] Payment gateway access confirmed

- [ ] **Training**
  - [ ] Admin panel training session
  - [ ] How to add/edit products
  - [ ] How to process orders
  - [ ] How to create promotions
  - [ ] How to respond to consultations

- [ ] **Support Plan**
  - [ ] Support period defined
  - [ ] Response time agreed
  - [ ] Bug fix process established
  - [ ] Feature request process established

---

## 🐛 BUG TRACKING TEMPLATE

### Bug Report Format

```markdown
**Bug ID**: BUG-XXX
**Reported By**: [Name]
**Date**: [DD-MM-YYYY]
**Priority**: Critical/High/Medium/Low
**Status**: Open/In Progress/Resolved/Closed

**Module**: [Module Name]
**Page/Component**: [Specific page or component]

**Environment**:
- Browser: [Chrome 120, Firefox 115, etc.]
- Device: [Desktop, iPhone 13, iPad, etc.]
- OS: [Windows 11, macOS, iOS 16, etc.]
- Screen Size: [1920x1080, 375x667, etc.]

**Description**:
[Clear description of the bug]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots/Videos**:
[Attach visuals if available]

**Console Errors**:
```
[Paste any console errors]
```

**Additional Notes**:
[Any other relevant information]

**Fix**:
[Description of the fix applied]

**Tested By**: [Name]
**Test Date**: [DD-MM-YYYY]
**Resolution Date**: [DD-MM-YYYY]
```

### Bug Priority Levels

- **Critical**: Prevents core functionality, blocks checkout, data loss
- **High**: Major feature broken, significant UX issue, affects many users
- **Medium**: Feature partially broken, workaround exists, affects some users
- **Low**: Minor UI issue, rare edge case, cosmetic

### Bug Tracking Spreadsheet

| Bug ID | Module | Page | Priority | Status | Reported | Assigned To | Resolved | Notes |
|--------|--------|------|----------|--------|----------|-------------|----------|-------|
| BUG-001 | Checkout | Payment | Critical | Closed | 01-01-2024 | John | 02-01-2024 | Payment modal crash |
| BUG-002 | Products | Filter | Medium | Open | 05-01-2024 | Jane | - | Price filter off by 1 |

---

## 📊 TESTING PROGRESS TRACKER

### Overall Progress

```
Total Features: 150
Tested: 0
Passed: 0
Failed: 0
Completion: 0%
```

### Module-wise Progress

| Module | Total Tests | Completed | Passed | Failed | % Complete |
|--------|-------------|-----------|--------|--------|------------|
| Homepage | 20 | 0 | 0 | 0 | 0% |
| Products | 35 | 0 | 0 | 0 | 0% |
| Cart | 15 | 0 | 0 | 0 | 0% |
| Checkout | 30 | 0 | 0 | 0 | 0% |
| Orders | 20 | 0 | 0 | 0 | 0% |
| Admin Products | 25 | 0 | 0 | 0 | 0% |
| Admin Orders | 20 | 0 | 0 | 0 | 0% |
| Admin Customers | 15 | 0 | 0 | 0 | 0% |
| Admin Promotions | 20 | 0 | 0 | 0 | 0% |
| Authentication | 15 | 0 | 0 | 0 | 0% |

---

## 🎯 SUCCESS CRITERIA

### Functional Criteria
✅ All customer flows work without errors
✅ All admin functions work correctly
✅ Payment processing successful
✅ Email notifications sent
✅ Data saved correctly to database
✅ All forms validate properly
✅ Responsive on all device sizes
✅ Cross-browser compatible

### Performance Criteria
✅ Page load times < 3s
✅ Lighthouse score > 90
✅ No console errors
✅ Smooth animations
✅ Fast image loading

### Security Criteria
✅ No security vulnerabilities
✅ Passwords hashed
✅ HTTPS enforced
✅ Input validation everywhere
✅ Admin routes protected

### User Experience Criteria
✅ Intuitive navigation
✅ Clear error messages
✅ Helpful success messages
✅ Consistent design
✅ Accessible to all users

---

## 📅 TESTING TIMELINE

### Week 1: Customer Features
- Days 1-2: Homepage, Products, Product Details
- Days 3-4: Cart, Wishlist, Compare
- Days 5-6: Checkout, Payment, Order Confirmation
- Day 7: Order Tracking, Order History, Profile

### Week 2: Admin Features & Authentication
- Days 1-2: Admin Dashboard, Products Management
- Days 3-4: Orders Management, Customers Management
- Day 5: Categories, Promotions Management
- Day 6: Permissions, Admin Profile
- Day 7: Authentication (Sign Up, Sign In, Password Reset)

### Week 3: Integration, Performance & Security
- Days 1-2: End-to-end user flows
- Days 3-4: Performance testing, optimization
- Day 5: Security testing, penetration testing
- Day 6: Cross-browser, cross-device testing
- Day 7: Bug fixes, final checks

### Week 4: Deployment & Handover
- Days 1-2: Production deployment, monitoring setup
- Day 3: Final production testing
- Day 4: Documentation completion
- Day 5: Client training
- Days 6-7: Buffer for any issues, final handover

---

## 📞 SUPPORT & ESCALATION

### Issue Reporting
- Email: support@trichomes.com
- Response Time: Within 24 hours
- Critical Issues: Immediate escalation

### Bug Severity Response Time
- Critical: 1-2 hours
- High: 4-8 hours
- Medium: 1-2 days
- Low: 1 week

---

**Document Version**: 1.0
**Last Updated**: [Date]
**Prepared By**: AI Testing Assistant
**Reviewed By**: [Client Name]

---

*This is a living document and will be updated as testing progresses.*

