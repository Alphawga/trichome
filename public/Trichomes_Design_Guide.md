# 🌿 Trichomes Design Guide

*A lifestyle-first eCommerce identity system for modern skincare,
haircare, and fragrance.*

------------------------------------------------------------------------

## 🎨 Color Palette

Trichomes' color story blends **earthy botanicals** with **modern
elegance**, evoking calm, purity, and nature-science balance.

  -------------------------------------------------------------------------
  Purpose                  Color             Hex          Notes
  ------------------------ ----------------- ------------ -----------------
  **Primary Green**        🟩                `#3A643B`    Represents
                                                          growth,
                                                          freshness, and
                                                          natural
                                                          ingredients. Used
                                                          for accents,
                                                          CTAs, and links.

  **Sage Background**      🟫                `#E6E4C6`    A muted botanical
                                                          base that conveys
                                                          calm luxury.
                                                          Ideal for
                                                          sections or hero
                                                          backgrounds.

  **Warm Sand**            🟧                `#E9DDAA`    Adds an organic
                                                          warmth to
                                                          contrast cool
                                                          greens. Perfect
                                                          for "Back in
                                                          Stock" or
                                                          lifestyle
                                                          sections.

  **Soft White**           ⚪                `#FAFAF7`    Clean and minimal
                                                          --- balances
                                                          product imagery
                                                          and text. Use for
                                                          page backgrounds.

  **Deep Forest**          🟩                `#1E3024`    Grounding dark
                                                          tone for
                                                          typography,
                                                          headers, and
                                                          footer
                                                          backgrounds.

  **Gold Accent**          🟨                `#E0B44C`    Luxurious detail
                                                          for buttons and
                                                          highlights. Use
                                                          sparingly to
                                                          preserve premium
                                                          tone.
  -------------------------------------------------------------------------

------------------------------------------------------------------------

## 🧭 Brand & Visual Identity

**Essence:**\
\> "Where science meets nature --- luxury simplified."

Trichomes embodies **organic intelligence**: the fusion of botanical
care and modern skincare technology. Every visual choice --- from color
to motion --- should feel *refined, natural, and nurturing*.

**Tone of Voice:**\
- Warm yet confident\
- Clean, minimal, intelligent\
- Guided expertise, never salesy\
- Speaks to self-care as ritual

**Image Style:**\
- Natural lighting with soft shadows\
- Minimal props (woven textures, wooden trays, glass surfaces)\
- Focus on texture and product detail\
- Occasional lifestyle human touch (hands, soft fabrics, plants)

------------------------------------------------------------------------

## 🖋️ Typography

  ------------------------------------------------------------------------
  Use           Font            Weight                  Notes
  ------------- --------------- ----------------------- ------------------
  **Headings    *Playfair       600--700                Elegant serif with
  (H1--H3)**    Display*                                character; used
                                                        for luxury feel.

  **Body Text** *Inter*         400--500                Clean sans-serif
                                                        for legibility and
                                                        modern balance.

  **Buttons &   *Inter*         600                     Medium weight for
  Labels**                                              emphasis and
                                                        readability.
  ------------------------------------------------------------------------

**Typography Hierarchy:**\
- H1: `48–60px`, bold, Playfair Display\
- H2: `32–40px`, Playfair Display\
- Body: `16–18px`, Inter Regular\
- Caption/Label: `14px`, Inter Medium

------------------------------------------------------------------------

## 🧩 UI / UX Patterns

**Navigation:**\
- Floating top bar with subtle shadow.\
- Primary navigation items: *Brand → Skin → Hair → Body → Perfume →
Consultation*.\
- Shopping cart and profile icons right-aligned.\
- Use a max width layout (1200px) for centered readability.

**Cards & Collections:**\
- Product cards use **ample whitespace** and **shadow lift** on hover.\
- **No rounded corners** --- sharp, clean edges for a modern, premium feel.\
- Product details always visible; "Add to Bag" appears on hover for
minimal distraction.

**Hero Section:**\
- Bold headline, 2-line max.\
- Subheading in muted gray-green tone.\
- Button uses `#E0B44C` (Gold Accent) with sharp edges (no rounded corners).\
- Background image slightly desaturated for better text contrast.

**Call to Action (CTA):**\
- Primary: "Book Consultation", "Shop Now"\
- Secondary: "View Collection", "Learn More"\
- CTAs must always use **consistent color hierarchy**: gold (primary),
green (secondary).\
- **No rounded corners** --- sharp edges maintain premium aesthetic.

**Form Elements & Inputs:**\
- **Background**: Soft White (`#FAFAF7`) for all input fields, selects, and search bars.\
- **Borders**: Deep Forest at 15% opacity (`border-[#1E3024]/15`) for subtle definition.\
- **Focus States**: Primary Green border (`#3A643B`) with subtle ring (`ring-1 ring-[#3A643B]/20`).\
- **No rounded corners** --- all inputs, selects, and buttons use sharp edges.\
- **Custom Select Styling**: Custom dropdown arrow using SVG, styled to match theme.\
- **Placeholder Text**: Deep Forest at 40% opacity for subtle, readable placeholders.\
- **Search Inputs**: Soft White background with themed border and focus states.\
- **Select Dropdowns**: Custom-styled with themed background and custom arrow icon.

**Footer:**\
- Deep forest background with light text.\
- Minimal links and clean spacing.\
- Newsletter signup uses subtle box shadow and full-width input field.

------------------------------------------------------------------------

## ✨ Motion & Animations

Trichomes' motion language is **graceful, subtle, and organic** ---
inspired by natural flow. All animations are designed to be **appreciable**
and **seamless**, allowing users to love and enjoy each transition.

### Animation Philosophy

Animations should feel **purposeful** and **deliberate**. They are not
decorative but enhance understanding, provide feedback, and create a sense
of quality and care. **Slower animations** (400-500ms) are preferred over
quick transitions to allow users to appreciate the motion.

  -------------------------------------------------------------------------------
  Element           Animation            Duration            Easing
  ----------------- -------------------- ------------------- --------------------
  Button hover      Gentle color shift + 150-200ms           ease-out
                    shadow lift                              

  Hero text         Fade-in from bottom  400ms               cubic-bezier(0.16,
                                                             1, 0.3, 1)

  Product cards     Scale 1.02 on hover  200ms               ease-in-out

  Section entrance  Soft slide-up + fade 600ms               ease-out

  Modal open        Blur background +    300ms               ease-in-out
                    zoom-in                                  

  Search bar        Fade-in with subtle  400-500ms           cubic-bezier(0.16,
                    scale                                      1, 0.3, 1)

  Search input      Border color + scale 400ms               ease-out
                    on focus                                   

  Search icon       Scale + color change 400ms               ease-out
                    on hover/focus                             

  Search submit     Fade-in + scale      400ms               cubic-bezier(0.16,
                    when query entered                         1, 0.3, 1)

  Mobile menu       Slide-in from left   300ms               cubic-bezier(0.16,
                    with overlay fade                           1, 0.3, 1)

  Mobile menu       Slide-out to left +  300ms               ease-out
  close             overlay fade                              

  Submenu expand    Max-height + opacity 400ms               ease-out
                    with chevron rotate                        

  Submenu items     Fade-in up with      300ms               cubic-bezier(0.16,
                    staggered delay                            1, 0.3, 1)
                    (30ms per item)                            

  Route transition  Search state delay   400ms delay         smooth transition
                    before navigation      + route             
  -------------------------------------------------------------------------------

### Search Animations

**Search Bar Appearance:**
- Fade-in with subtle scale animation (500ms)
- Sage background (`#E6E4C6`) at 30-40% opacity for visual separation
- Smooth border-top transition for separation from header

**Search Input Interactions:**
- **Focus State**: Border color transitions from gray to Primary Green (`#3A643B`) over 400ms
- **Hover State**: Border color subtly shifts to Primary Green at 50% opacity
- **Active Search**: Input scales to 101-102% with border color transition (400ms)

**Search Icon:**
- Color transitions from gray to Primary Green on hover/focus (400ms)
- Scales to 110% when search is active
- Smooth position transition

**Search Submit Button:**
- Fades in smoothly when user types (400ms, cubic-bezier curve)
- Scales to 105% on hover and during search
- Color transitions from Primary Green to Deep Forest on hover

**Search State Transitions:**
- **Before Navigation**: 400ms delay with visual feedback (scale, color change)
- **After Navigation**: Search query resets after 500ms for clean slate
- **Seamless Routing**: Search term is properly encoded and passed to products page

### Mobile Menu Animations

**Menu Open:**
- Overlay fades in (300ms, cubic-bezier curve)
- Menu slides in from left (300ms, cubic-bezier curve)
- Body scroll is locked during animation
- Smooth, natural motion that doesn't feel abrupt

**Menu Close:**
- Menu slides out to left (300ms, ease-out)
- Overlay fades out simultaneously
- Body scroll unlocked after animation completes
- Same smooth motion on route changes

**Submenu Expansion:**
- Chevron rotates 90 degrees smoothly (300ms, ease-out)
- Submenu container expands with max-height and opacity transition (400ms)
- Each submenu item fades in with 30ms stagger delay for cascading effect
- Left border accent line appears with color transition

**Submenu Item Hover:**
- Background color transitions (150ms, ease-out)
- Text color shifts to Primary Green
- Subtle translate-x-1 for rightward movement indication

### Animation Timing Guidelines

**Fast Interactions** (150-200ms):
- Button hovers
- Icon color changes
- Border color shifts

**Standard Transitions** (300-400ms):
- Menu animations
- Input focus states
- Color transitions
- Scale transformations

**Purposeful Delays** (400-500ms):
- Search bar appearance
- Route transitions
- Search submission feedback

**Expressive Entrances** (500-600ms):
- Section entrances
- Search bar fade-in
- Hero text animations

### Easing Functions

**cubic-bezier(0.16, 1, 0.3, 1)** - **Preferred for entrances**:
- Natural, organic feel
- Slight anticipation before settling
- Used for hero text, search bar, submenu items

**ease-out** - **Preferred for exits**:
- Smooth deceleration
- Natural stopping motion
- Used for menu close, input transitions

**ease-in-out** - **For bidirectional movements**:
- Smooth acceleration and deceleration
- Balanced motion
- Used for product card hovers

### Best Practices

1. **Never rush animations** - Users should appreciate the motion, not feel rushed
2. **Provide feedback** - Every interaction should have visual/animated feedback
3. **Stagger when appropriate** - Multiple items should animate with slight delays
4. **Use consistent timing** - Similar actions should have similar durations
5. **Test on real devices** - Animations may feel different on slower devices
6. **Respect reduced motion** - Consider `prefers-reduced-motion` for accessibility
7. **Delight, don't distract** - Animations enhance, they should never obstruct

**Guideline:**\
\> Movement should *feel alive* and *appreciable* --- animations are a
luxury detail that reinforces calm sophistication. Users should *love*
each transition, not just notice it.

------------------------------------------------------------------------

## 📱 Responsive Design

**Desktop:**\
- 3--4 column grid for products.\
- Ample white space between collections.\
- Fixed-width hero banner.

**Tablet:**\
- 2-column grid.\
- Reduce padding and font sizes by 10--15%.

**Mobile:**\
- Single column scroll.\
- Prioritize imagery and CTAs.\
- Keep hero copy short (max 2 lines).

------------------------------------------------------------------------

## 🪄 Usage Recommendations

-   Maintain **60/30/10 color balance** (Neutral 60%, Botanical 30%,
    Accent 10%).\
-   Use **consistent lighting** in imagery.\
-   Avoid harsh contrasts --- rely on tone-on-tone layers.\
-   **No rounded corners** --- all UI elements (buttons, inputs, cards, pills) use sharp edges for a modern, premium aesthetic.\
-   When in doubt, **less is luxurious.**\
-   Always test visual consistency with both **light and dark
    backgrounds** (product photography often varies).

------------------------------------------------------------------------

------------------------------------------------------------------------

## 🏗️ Implementation Principles

Trichomes follows **strict development principles** to ensure code
quality, maintainability, and scalability. All components and features
must adhere to these guidelines.

### **DRY (Don't Repeat Yourself)**

**Principle:** Every piece of logic should exist in exactly one place.

**Application:**
- Extract reusable components (OrderSummary, AddressForm, etc.)
- Share validation schemas between frontend and backend using Zod
- Centralize utilities (cart sync, payment handling, email sending)
- Reuse hooks for common logic
- Define types once, use everywhere

**Examples:**
- `OrderSummary` component used in checkout, cart, and order confirmation
- `AddressForm` component used in checkout, profile, and order display
- Shared Zod schemas for address validation across frontend and backend

### **Componentization**

**Principle:** Break down complex UI into smaller, reusable, single-responsibility components.

**Application:**
- Each component should have one clear purpose
- Components should be composable and flexible
- Use props for customization, not hardcoded values
- Create compound components for complex interactions
- Extract form fields into reusable field components

**Component Structure:**
```
src/components/
├── checkout/          # Checkout-specific components
├── orders/            # Order-related components (reusable)
├── forms/             # Reusable form components
├── payments/          # Payment-related components
└── shared/            # Truly shared components
```

### **Type Safety**

**Principle:** Leverage TypeScript's type system to prevent errors and improve developer experience.

**Application:**
- Define types once in shared type files
- Use Zod schemas for runtime validation and type inference
- Avoid `any` types - use proper types or `unknown`
- Export types from components for reuse
- Use type guards for runtime type checking

**Type Organization:**
```
src/types/
├── order.ts           # Order-related types
├── address.ts         # Address types
├── payment.ts         # Payment types
└── cart.ts            # Cart types
```

### **Reusability**

**Principle:** Design components and utilities to be reusable across different contexts.

**Application:**
- Components should accept props for customization
- Use variants for different display modes (e.g., 'checkout' | 'confirmation' | 'history')
- Create hooks for reusable stateful logic
- Design utilities to be context-agnostic
- Support both controlled and uncontrolled component patterns

**Reusability Patterns:**
- **Variants**: `variant="checkout" | "confirmation" | "history"`
- **Modes**: `mode="create" | "edit" | "display"`
- **Optional Features**: `showEmail`, `showAddress2`, `showActions`
- **Ref API**: Expose methods via ref for external control

### **Error Handling**

**Principle:** Handle errors gracefully with clear user feedback and proper logging.

**Application:**
- Use try-catch blocks for async operations
- Display user-friendly error messages
- Log errors for debugging (console.error)
- Provide retry mechanisms where appropriate
- Validate inputs before processing

### **Loading States**

**Principle:** Always provide visual feedback during async operations.

**Application:**
- Show loading spinners during data fetching
- Disable buttons during form submission
- Display skeleton loaders for content
- Use optimistic updates where appropriate
- Provide clear loading messages

### **Validation**

**Principle:** Validate data at both client and server levels.

**Application:**
- Use Zod schemas for validation
- Share validation schemas between frontend and backend
- Validate on blur for real-time feedback
- Show field-level error messages
- Prevent invalid form submission

### **File Organization**

**Principle:** Organize code logically for easy navigation and maintenance.

**Structure:**
```
src/
├── components/        # React components
│   ├── checkout/      # Feature-specific
│   ├── orders/        # Reusable components
│   ├── forms/         # Form components
│   └── shared/        # Truly shared
├── hooks/             # Custom React hooks
├── lib/               # Utilities and helpers
│   ├── cart/          # Cart utilities
│   ├── email/         # Email utilities
│   ├── payments/      # Payment utilities
│   └── validations/   # Validation schemas
├── server/            # Backend (tRPC)
│   ├── modules/       # Feature modules
│   ├── index.ts       # Router composition
│   ├── trpc.ts        # tRPC setup
│   └── context.ts     # tRPC context
└── types/             # TypeScript types
```

### **tRPC Structure Pattern**

**Principle:** Follow consistent tRPC router structure for type-safe API access.

**Pattern:**
1. **Module Exports**: Each module file (`src/server/modules/*.ts`) exports procedures directly:
   ```typescript
   // src/server/modules/orders.ts
   export const createOrderWithPayment = protectedProcedure...
   export const createGuestOrderWithPayment = publicProcedure...
   export const getOrderByNumber = protectedProcedure...
   ```

2. **Router Composition**: All modules are spread into a single router in `src/server/index.ts`:
   ```typescript
   export const appRouter = router({
     ...ordersModule,
     ...cartModule,
     // etc.
   })
   ```

3. **Client Access**: Procedures are accessed directly (not namespaced):
   ```typescript
   // ✅ CORRECT - Direct access
   trpc.createOrderWithPayment.useMutation()
   trpc.createGuestOrderWithPayment.useMutation()
   trpc.getCart.useQuery()
   
   // ❌ WRONG - Don't namespace
   trpc.orders.createOrderWithPayment.useMutation()
   trpc.cart.getCart.useQuery()
   ```

**Why This Pattern:**
- All procedures are flattened into a single namespace
- Type safety is maintained through TypeScript inference
- Simpler API surface - no nested namespaces
- Consistent with tRPC best practices for small-to-medium apps

**Module Organization:**
- Each module file contains related procedures (orders, cart, products, etc.)
- Procedures are exported as named exports
- Use `protectedProcedure` for authenticated endpoints
- Use `publicProcedure` for public endpoints
- Use `staffProcedure` or `adminProcedure` for role-based access

### **Code Quality Standards**

**Principle:** Maintain high code quality through consistent patterns and practices.

**Standards:**
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused
- Use early returns to reduce nesting
- Extract magic numbers to constants
- Follow consistent naming conventions (camelCase for variables, PascalCase for components)

### **Accessibility**

**Principle:** Ensure all components are accessible to all users.

**Application:**
- Use semantic HTML elements
- Provide ARIA labels where needed
- Ensure keyboard navigation works
- Maintain proper focus management
- Support screen readers
- Respect `prefers-reduced-motion` for animations

### **Performance**

**Principle:** Optimize for performance without sacrificing user experience.

**Application:**
- Use React.memo for expensive components
- Implement code splitting for large components
- Lazy load images and heavy resources
- Optimize re-renders with proper dependency arrays
- Use tRPC's built-in caching and invalidation
- Debounce search inputs and form validations

### **Testing Considerations**

**Principle:** Write testable code that can be easily verified.

**Application:**
- Keep components pure and predictable
- Extract business logic from components
- Use dependency injection for testability
- Create test utilities for common patterns
- Document expected behavior

### **Documentation**

**Principle:** Document complex logic and component APIs.

**Application:**
- Add JSDoc comments to functions and components
- Document component props with TypeScript interfaces
- Include usage examples in component files
- Maintain README files for complex features
- Document API endpoints and their usage

------------------------------------------------------------------------

## 🌸 Summary

Trichomes' design system is about **refined minimalism** --- balancing
**nature, elegance, and trust.**\
It tells a story not just of skincare, but of *rituals that
rejuvenate*.\
Every visual should feel **inviting, timeless, and intelligent.**

**Development Principles:**\
Every feature and component follows **DRY, Componentization, Type Safety,
and Reusability** principles to ensure maintainable, scalable, and
high-quality code that matches the refined aesthetic of the brand.
