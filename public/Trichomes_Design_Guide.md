# 🌿 Trichomes Design Guide

*A lifestyle-first eCommerce identity system for modern skincare,
haircare, and fragrance.*

------------------------------------------------------------------------

## 🎨 Color Palette & Theme Colors

Trichomes' color story blends **earthy botanicals** with **modern
elegance**, evoking calm, purity, and nature-science balance.

  -------------------------------------------------------------------------
  Purpose                  Color             Hex          Usage Examples
  ------------------------ ----------------- ------------ -----------------
  **Primary Green**        🟩                `#3A643B`    CTAs, links, accent
                                                          lines, hover states,
                                                          active elements.
                                                          Represents growth,
                                                          freshness, natural
                                                          ingredients.

  **Primary Green Hover**  🟩                `#528C35`    Darker shade for
                                                          interactive hover
                                                          states on buttons
                                                          and links.

  **Sage Background**      🟫                `#E6E4C6`    Section backgrounds,
                                                          soft overlays, subtle
                                                          separation. Muted
                                                          botanical base for
                                                          calm luxury.

  **Warm Beige/Taupe**     🟧                `#E1D1C1`    Mobile gradient
                                                          overlays, warm
                                                          backgrounds, soft
                                                          transitions. Adds
                                                          organic warmth.

  **Warm Sand**            🟧                `#E9DDAA`    Lifestyle sections,
                                                          promotional areas,
                                                          "Back in Stock"
                                                          banners. Contrasts
                                                          cool greens.

  **Soft White**           ⚪                `#FAFAF7`    Page backgrounds,
                                                          input fields, card
                                                          backgrounds. Clean,
                                                          minimal balance.

  **Cream Overlay**        🟨                `#F6F1EC`    Image overlays for
                                                          text readability (85%
                                                          opacity), warm
                                                          background tones.

  **Deep Forest**          🟩                `#1E3024`    Headings, primary
                                                          text, footer
                                                          backgrounds,
                                                          borders at low
                                                          opacity. Grounding
                                                          dark tone.

  **Gold Accent**          🟨                `#E0B44C`    Luxury highlights,
                                                          special promotions
                                                          (used sparingly).
                                                          Preserves premium
                                                          tone.

  -------------------------------------------------------------------------

### **Color Usage Patterns**

**Primary Actions (CTAs):**
- Background: Primary Green (`#407029` / `#3A643B`)
- Hover: Darker Green (`#528C35`)
- Text: White
- Use on: "Shop Now", "Book my session", main action buttons

**Accent Elements:**
- Color: Primary Green (`#3A643B`)
- Use for: Underline accents, decorative lines, section dividers
- Width: `16px` mobile, `20px` desktop (for header accent lines)
- Height: `1px` (thin, elegant)
- Style: `rounded-full` for pill shape

**Text Hierarchy:**
- Headings: Deep Forest (`#1E3024`) at 100% opacity
- Body text: Deep Forest at 70% opacity (`#1E3024/70`)
- Secondary/muted text: Deep Forest at 60-80% opacity
- Text over images: White (with dark gradient overlay for contrast)

**Background Layers:**
- Primary sections: White (`bg-white`)
- Soft sections: Warm beige with transparency (`#E1D1C14D/30`)
- Image overlays: Cream at 85% opacity (`#F6F1EC` at 85%)
- Dark overlays: Black gradient (`from-black via-black/60 to-transparent`)

**Borders & Dividers:**
- Border color: Deep Forest at 10% opacity (`border-trichomes-forest/10`)
- Border width: `1px` (subtle definition)
- Divider lines: Full width, `1px` height, Deep Forest at 10% opacity

------------------------------------------------------------------------

## ✨ Visual Aesthetic: Edges, Shadows & Feel

### **Edge Styling (Border Radius)**

Trichomes uses **refined rounded corners** to create a modern, approachable aesthetic while maintaining sophistication. Corners are never sharp (90-degree angles), but also never overly rounded.

**Edge Radius Patterns:**

| Element Type | Border Radius | Usage | Examples |
|-------------|---------------|-------|----------|
| **Small Elements** | `rounded-md` (6px) | Buttons, small cards | "Book my session" CTA |
| **Standard Cards** | `rounded-lg` (8px) | Collection cards, standard cards | Category collection cards |
| **Large Cards** | `rounded-xl` (12px) | Product cards, large containers | Product card skeletons |
| **Banner Cards** | `rounded-2xl` (16px) | Lifestyle banners, hero elements | Promotion banners |
| **Decorative Elements** | `rounded-full` | Accent lines, pills, icons | Section accent lines under headers |
| **Custom Radius** | `rounded-[32px]` | Special decorative elements | Store windows in "Why Choose" section |

**Guidelines:**
- ✅ **Do use** rounded corners for cards, buttons, and interactive elements
- ✅ **Do use** `rounded-full` for accent lines and decorative pills
- ✅ **Do use** larger radii (`rounded-2xl`) for lifestyle/promotional sections
- ❌ **Don't use** sharp 90-degree corners (unless intentionally architectural)
- ❌ **Don't use** excessive rounding that feels playful or casual

### **Shadow System**

Shadows create depth and hierarchy without feeling heavy or aggressive.

**Shadow Levels:**

| Level | Class | Use Case | Effect |
|-------|-------|----------|--------|
| **Subtle** | `shadow-sm` | Loading states, skeleton cards | Minimal depth, barely visible |
| **Standard** | `shadow-md` | Banner cards, image containers | Moderate depth, clear separation |
| **Elevated** | `shadow-lg` | Collection cards, featured elements | Noticeable lift, draws attention |
| **Prominent** | `shadow-xl` | Store windows, decorative overlays | Strong depth, architectural feel |
| **Hover Lift** | `hover:shadow-xl` | Interactive cards on hover | Dynamic elevation feedback |

**Shadow Behavior:**
- Collection cards: `shadow-lg` → `hover:shadow-xl` transition
- Banner cards: Static `shadow-md` for consistency
- Store windows: `shadow-xl` for strong visual separation
- All shadow transitions: `200ms duration` for smooth elevation

**Shadow Philosophy:**
- Shadows should feel **natural** and **soft** — never harsh or dark
- Use shadows to create **layers** and **hierarchy**, not drama
- Hover states lift shadows to indicate interactivity

### **Border System**

Borders are used sparingly and subtly for definition.

**Border Patterns:**
- **Collection Cards**: `border border-trichomes-forest/10` — 1px, Deep Forest at 10% opacity
- **Product Cards**: `border border-[#1E3024]/10` — same subtle pattern
- **Dividers**: Full-width `1px` lines with Deep Forest at 10% opacity
- **Input Fields**: Deep Forest at 15% opacity (`border-[#1E3024]/15`)

**Border Philosophy:**
- Borders are **subtle hints** of structure, not bold outlines
- Use low opacity (10-15%) to maintain clean aesthetic
- Border color always Deep Forest (`#1E3024`) at varying opacities

### **Overall Visual Feel**

**Design Philosophy:**
Trichomes feels **refined**, **calm**, and **nurturing** — like entering a serene, modern spa or boutique. Every visual choice reinforces the brand essence: *"Where science meets nature — luxury simplified."*

**Key Characteristics:**

1. **Breathing Room**
   - Generous whitespace throughout
   - Sections have ample padding (`py-8` to `py-20`)
   - Cards have comfortable internal spacing

2. **Soft Sophistication**
   - Rounded corners create approachability
   - Soft shadows add depth without aggression
   - Muted colors (70-80% opacity) for secondary text

3. **Natural Harmony**
   - Earthy color palette (greens, beiges, creams)
   - Botanical references without being literal
   - Warm undertones balance cool greens

4. **Refined Minimalism**
   - Clean layouts without clutter
   - Essential information only
   - Thoughtful use of space

5. **Organic Flow**
   - Gentle animations (400-600ms)
   - Staggered entrances for visual rhythm
   - Smooth transitions throughout

6. **Luxury Through Restraint**
   - Premium without ostentation
   - Quality over quantity
   - Details matter, but don't overwhelm

**Emotional Tone:**
- **Welcoming** — not intimidating or exclusive
- **Confident** — assured in quality, no need to shout
- **Caring** — suggests genuine interest in customer well-being
- **Modern** — contemporary, not stuck in the past
- **Trustworthy** — professional, reliable, authentic

### **Spacing & Rhythm**

**Vertical Rhythm:**
- Section padding: `py-8` (32px) mobile, `py-12` (48px) tablet, `py-20` (80px) desktop
- Section header spacing: `mb-6` (24px) mobile, `mb-8` (32px) tablet, `mb-12` (48px) desktop
- Card internal padding: `px-4 md:px-8 py-8 md:py-10` for collection cards
- Content spacing: `space-y-8 sm:space-y-10` for value proposition lists

**Horizontal Rhythm:**
- Content padding: `px-4` (16px) mobile, `px-6` (24px) tablet, `px-8` (32px) to `px-12` (48px) desktop
- Grid gaps: `gap-4` (16px) mobile, `gap-6` (24px) desktop
- Max-width containers: `max-w-[2200px]` as standard across entire app
  - Exception: `max-w-[1440px]` for reading-focused content areas (e.g., "Why Choose Trichomes")
  - Always use `mx-auto` to center containers
  - Include responsive padding: `px-4 sm:px-6 lg:px-8`

**Spacing Philosophy:**
- **More is more** when it comes to whitespace
- Consistent spacing creates visual rhythm
- Responsive scaling maintains proportions
- Spacing should feel **generous**, never cramped

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
- **Rounded corners** (`rounded-lg` or `rounded-xl`) create approachable, modern feel.\
- Product details always visible; "Add to Bag" appears on hover for
minimal distraction.

**Hero Section:**\
- Bold headline, 2-line max.\
- Subheading in muted gray-green tone.\
- Button uses Primary Green (`#407029`) with `rounded-lg` for refined edges.\
- Background image optimized with mobile gradient overlay for seamless blending.

**Call to Action (CTA):**\
- Primary: "Book Consultation", "Shop Now"\
- Secondary: "View Collection", "Learn More"\
- CTAs use **consistent color**: Primary Green (`#407029`) with hover state (`#528C35`).\
- **Rounded corners** (`rounded-lg` or `rounded-md`) maintain refined aesthetic.

**Form Elements & Inputs:**\
- **Background**: Soft White (`#FAFAF7`) for all input fields, selects, and search bars.\
- **Borders**: Deep Forest at 15% opacity (`border-[#1E3024]/15`) for subtle definition.\
- **Focus States**: Primary Green border (`#3A643B`) with subtle ring (`ring-1 ring-[#3A643B]/20`).\
- **Border Radius**: Use `rounded-md` or `rounded-lg` for refined edges on inputs and buttons.\
- **Custom Select Styling**: Custom dropdown arrow using SVG, styled to match theme.\
- **Placeholder Text**: Deep Forest at 40% opacity for subtle, readable placeholders.\
- **Search Inputs**: Soft White background with themed border and focus states.\
- **Select Dropdowns**: Custom-styled with themed background and custom arrow icon.

**Footer:**\
- Deep forest background with light text.\
- Minimal links and clean spacing.\
- Newsletter signup uses subtle box shadow and full-width input field.

------------------------------------------------------------------------

## 🏠 Landing Page Structure

The landing page follows a carefully structured narrative that guides visitors through the Trichomes experience. Each section is designed to tell part of the brand story while providing clear pathways to explore products and services.

### **Page Layout & Container System**

- **Maximum Content Width**: `2200px` (standard for all sections across the app)
  - Use: `max-w-[2200px]` on main content containers
  - Purpose: Prevents content from becoming too wide on ultra-wide screens
  - Application: Applied to hero sections, product grids, category sections, and all main page content
  - Exception: Special content areas like "Why Choose Trichomes" may use `max-w-[1440px]` for tighter reading width
- **Background**: White (`bg-white`) for primary sections, with alternating soft tones for visual interest
- **Section Spacing**: Consistent vertical padding (`py-8 sm:py-12 lg:py-20`)
- **Section Entrance Animation**: `animate-[sectionEntrance_600ms_ease-out]` applied to all main sections

**Container Width Guidelines:**
```html
<!-- Standard page sections -->
<div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px]">
  <!-- Content here -->
</div>

<!-- Tighter content areas (reading-focused) -->
<div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
  <!-- Content here -->
</div>

<!-- Full-width sections with contained content -->
<section className="w-full">
  <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px]">
    <!-- Content here -->
  </div>
</section>
```

### **1. Hero Section**

**Purpose:** First impression and brand statement

**Structure:**
- Full-width section with minimum height `60vh`
- Background image using Next.js Image component (optimized)
- Image positioned: `object-cover object-center` for responsive cropping
- Quality: `100` for maximum sharpness
- Mobile-specific gradient overlay at top (`260px` height) to blend image seamlessly

**Content:**
- **Headline**: "Natural Beauty, Naturally Yours" (2-line max)
  - Font: Playfair Display (font-heading)
  - Size: `48px` mobile, `64px` desktop
  - Color: Deep Forest (`#1E3024`)
  - Animation: `fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)`
  
- **Subheading**: "Where science meets nature — luxury simplified..."
  - Font: Inter (font-body)
  - Size: `14px` mobile, `15px` tablet, `17px` desktop
  - Color: Deep Forest at 70% opacity
  - Animation: Same fade-in with `150ms` delay
  
- **CTA Button**: "Shop Now"
  - Background: Primary Green (`#407029`)
  - Hover: Darker green (`#528C35`)
  - Rounded corners: `rounded-lg`
  - Animation: Fade-in with `300ms` delay

**Responsive Behavior:**
- Text container constrained width: `max-w-md` mobile, `max-w-xl` desktop
- Left-aligned text on all screen sizes
- Centered on desktop with max-width container

### **2. Our Collection Section**

**Purpose:** Showcase top-level product categories visually

**Structure:**
- Background: White
- Grid: 2 columns mobile, 4 columns desktop
- Card dimensions: `280px` height mobile, `650px` height desktop
- Card styling: Rounded corners (`rounded-lg`), subtle border, shadow lift on hover

**Collection Cards:**
- Full-bleed images using Next.js Image with `fill` and `object-cover`
- **Dark gradient overlay**: Bottom half fades from `black` through `black/60` to transparent
  - Purpose: Ensures text readability over any image
  - Position: Absolute bottom, covers lower 50% of card
  
- **Category Label**:
  - Position: Absolute bottom-left
  - Text: White, `text-2xl`, left-aligned
  - Font: Inter (font-body)
  - Line clamp: Single line (`line-clamp-1`)
  
- **Accent Line**:
  - Color: Primary Green (`bg-trichomes-primary`)
  - Width: `40px` mobile, `60px` desktop
  - Height: `4px`
  - Position: Below category label
  - Style: Rounded (`rounded-full`)

**Section Header:**
- Title: "Our Collection"
- Font: Playfair Display, centered
- Size: `24px` mobile, `32px` tablet, `40px` desktop
- Accent line below: Primary Green, `16px` mobile / `20px` desktop width, `4px` height, rounded

**Animations:**
- Staggered fade-in for cards: `500ms` cubic-bezier with `100ms` delay per card
- Skeleton loading state matches card dimensions

### **3. Featured Items Section**

**Purpose:** Highlight curated, featured products

**Structure:**
- Background: White
- Grid: Responsive product grid (2 cols mobile, 3-4 cols desktop)
- Uses shared `ProductGrid` component for consistency

**Section Header:**
- Title: "Featured Items"
- Same styling as "Our Collection" header
- Centered alignment

**Footer CTA:**
- "View All" link with chevron icon
- Color: Primary Green, transitions to Deep Forest on hover
- Font: Inter semibold, `15px` mobile, `17px` desktop

**Loading State:**
- Skeleton cards match product card layout
- Animated pulse effect

### **4. Top Sellers Section**

**Purpose:** Showcase popular, best-selling products

**Structure:**
- Background: Soft beige with transparency (`#E1D1C14D/30`)
- Same grid and product layout as Featured Items
- Uses same `ProductGrid` component

**Section Header:**
- Title: "Top Sellers"
- Same styling as other section headers

**Visual Distinction:**
- Background color provides subtle separation from other sections
- Maintains visual rhythm while offering variety

### **5. Banner Promotion Section**

**Purpose:** Lifestyle-focused promotional content

**Structure:**
- Two side-by-side banner cards (stacked on mobile, horizontal on desktop)
- Full-width container with max-width `2200px`
- Gap: `16px` mobile, `24px` tablet, `32px` desktop

**Banner Cards:**
- Background images: Cover with `bg-cover bg-center`
- Min height: `250px` mobile, `600px` desktop
- Border radius: `rounded-2xl` for modern, soft aesthetic
- Shadow: Medium depth (`shadow-md`)
- Content positioned: Bottom with padding

**CTA Buttons:**
- Background: Primary Green (`#407029`)
- Hover: Darker green (`#528C35`)
- Text: White, Inter semibold
- Size: Responsive padding (`py-3 px-6` mobile, `py-4 px-10` desktop)
- Border radius: `rounded-lg`
- Hover effects: Shadow lift, scale to `105%`
- Includes chevron icon with translate animation on hover

**Banner Content:**
- "Top Sellers" banner (left)
- "New arrivals" banner (right)
- Both link to relevant product collections

### **6. Book a Session Section (Consultation CTA)**

**Purpose:** Convert visitors to consultation bookings

**Structure:**
- Full-width, full-height section (`h-[800px]`)
- Background image: Full-bleed using Next.js Image
- Image overlay: Warm beige (`#F6F1EC`) at 85% opacity for text readability
- Content: Centered both vertically and horizontally

**Content:**
- **Headline**: "Unlock your best skin, style, and scent. Book a 1 on 1 session."
  - Font: Playfair Display
  - Size: `32px` mobile, `42px` tablet, `56px` desktop
  - Color: Deep Forest
  - Line height: `1.1` for tight, impactful spacing
  - Line break: Hidden on mobile, visible on larger screens
  
- **Body Text**:
  - Font: Inter (font-body)
  - Size: `15px` mobile, `16px` desktop
  - Color: Deep Forest at 80% opacity
  - Max width: `max-w-7xl` for optimal reading width
  - Leading: Relaxed for comfortable reading
  
- **CTA Button**: "Book my session"
  - Background: Primary Green (`#407029`)
  - Hover: Darker green (`#528C35`)
  - Border radius: `rounded-md`
  - Padding: `py-3.5 px-8` mobile, `py-4 px-10` desktop

**Animation:**
- Section content: `fadeInUp_600ms_ease-out` for gentle entrance

### **7. Why Choose Trichomes Section**

**Purpose:** Build trust and communicate value proposition

**Structure:**
- Two-column layout (image left, content right)
- Reverses on mobile (content first, then image)
- Max width: `1440px` for content area

**Left Side - Store Windows Effect:**
- Container: White background with decorative windows
- Height: `500px` mobile, `600px` tablet, `650px` desktop
- **Window Design**:
  - Two rounded windows (`rounded-[32px]`) reveal store interior
  - Left window: `45%` width, positioned top-left (`22%` from top)
  - Right window: `45%` width, positioned top-right (`30%` from top)
  - Both windows: `60%` height
  - Background images positioned to show specific store views
  - Shadow: `shadow-xl` for depth and separation
  - Z-index: `20` to appear above white overlay

**Right Side - Content:**
- **Main Headline**: "Why Choose Trichomes?"
  - Font: Playfair Display
  - Size: `32px` mobile, `40px` tablet, `48px` desktop
  - Color: Deep Forest
  - Margin bottom: `32px` mobile, `40px` tablet, `48px` desktop
  
- **Value Points** (3 items):
  - Title: Playfair Display semibold, `20px` mobile, `22px` desktop
  - Divider: Full-width line, Deep Forest at 10% opacity, `1px` height
  - Description: Inter body text, `15px` mobile, `16px` desktop
  - Color: Deep Forest at 70% opacity
  - Spacing: `32px` mobile, `40px` desktop between items
  
- **Animations**:
  - Each value point: `fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)`
  - Staggered delays: `0ms`, `100ms`, `200ms` for cascading effect

**Visual Details:**
- Store windows create engaging, modern presentation of physical space
- White overlay (`z-10`) covers background, windows (`z-20`) reveal through
- Maintains clean aesthetic while adding visual interest

### **Loading States & Error Handling**

**Skeleton Loaders:**
- Collection cards: Match exact card dimensions with animated pulse
- Product cards: Match product card layout with placeholder rectangles
- All skeletons use `animate-pulse` for consistent loading experience

**Error States:**
- Centered message in muted Deep Forest (70% opacity)
- Friendly, helpful language: "Unable to load... Please try again later"
- Empty states: Similar styling with encouraging messaging

### **Responsive Behavior**

**Mobile (< 640px):**
- Hero: Single column, left-aligned text, gradient overlay at top
- Collections: 2-column grid, smaller cards
- Products: 2-column grid
- Banners: Stacked vertically
- Why Choose: Content first, then image
- Reduced padding and font sizes throughout

**Tablet (640px - 1024px):**
- Collections: 2-column grid (may show 4 cards in 2 rows)
- Products: 3-column grid
- Banners: Side-by-side horizontal layout
- Why Choose: Two-column layout activated

**Desktop (> 1024px):**
- Collections: 4-column grid
- Products: 4-column grid
- Full padding and typography scale
- All animations and hover effects active
- Maximum content width constraints applied

### **Section Spacing & Rhythm**

**Vertical Rhythm:**
- Section padding: `py-8 sm:py-12 lg:py-20` (consistent across sections)
- Section gaps: Natural flow with no additional spacing needed
- Internal spacing: `mb-6 sm:mb-8 lg:mb-12` for section headers

**Horizontal Rhythm:**
- Content padding: `px-4` mobile, `px-6` tablet, `px-8` or `px-12` desktop
- Grid gaps: `gap-4` mobile, `gap-6` tablet/desktop
- Max-width containers prevent content from becoming too wide on large screens

### **Color Usage Across Sections**

**Background Colors:**
- White: Hero, Our Collection, Featured Items, Why Choose
- Soft Beige: Top Sellers section
- Full-bleed image: Book a Session section

**Text Colors:**
- Deep Forest: All headings and primary text
- Deep Forest at 70-80% opacity: Secondary text and descriptions
- White: Text over dark gradients or images

**Accent Elements:**
- Primary Green: All accent lines, CTAs, links
- Primary Green hover: Darker shade for interactive elements

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
-   **Use rounded corners appropriately** --- cards use `rounded-lg`, buttons use `rounded-md` or `rounded-lg`, accent lines use `rounded-full`. Maintain refined, modern aesthetic.\
-   When in doubt, **less is luxurious.**\
-   Always test visual consistency with both **light and dark
    backgrounds** (product photography often varies).\
-   Shadows should feel natural and soft — never harsh or aggressive.\
-   Generous whitespace creates breathing room and sophistication.\
-   Use opacity variations (70-85%) for text hierarchy and soft overlays.

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
