---
name: Technical Streetwear & Utilitarian Apparel
colors:
  surface: "#fbf9f4"
  surface-dim: "#dcdad5"
  surface-bright: "#fbf9f4"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f6f3ee"
  surface-container: "#f0eee9"
  surface-container-high: "#eae8e3"
  surface-container-highest: "#e4e2dd"
  on-surface: "#1b1c19"
  on-surface-variant: "#444748"
  inverse-surface: "#30312d"
  inverse-on-surface: "#f3f0eb"
  outline: "#747878"
  outline-variant: "#c4c7c7"
  surface-tint: "#5f5e5e"
  primary: "#000000"
  on-primary: "#ffffff"
  primary-container: "#1c1b1b"
  on-primary-container: "#858383"
  inverse-primary: "#c8c6c5"
  secondary: "#536600"
  on-secondary: "#ffffff"
  secondary-container: "#c7ef00"
  on-secondary-container: "#576a00"
  tertiary: "#000000"
  on-tertiary: "#ffffff"
  tertiary-container: "#1b1c18"
  on-tertiary-container: "#84847f"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#e5e2e1"
  primary-fixed-dim: "#c8c6c5"
  on-primary-fixed: "#1c1b1b"
  on-primary-fixed-variant: "#474646"
  secondary-fixed: "#caf300"
  secondary-fixed-dim: "#b0d500"
  on-secondary-fixed: "#171e00"
  on-secondary-fixed-variant: "#3e4c00"
  tertiary-fixed: "#e4e2dc"
  tertiary-fixed-dim: "#c8c7c1"
  on-tertiary-fixed: "#1b1c18"
  on-tertiary-fixed-variant: "#474743"
  background: "#fbf9f4"
  on-background: "#1b1c19"
  surface-variant: "#e4e2dd"
typography:
  headline-xl:
    fontFamily: Anton
    fontSize: 56px
    fontWeight: "400"
    lineHeight: 56px
    letterSpacing: 0.04em
  headline-xl-mobile:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: "400"
    lineHeight: 42px
    letterSpacing: 0.03em
  headline-lg:
    fontFamily: Anton
    fontSize: 36px
    fontWeight: "400"
    lineHeight: 38px
    letterSpacing: 0.04em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 28px
    fontWeight: "400"
    lineHeight: 30px
    letterSpacing: 0.03em
  headline-md:
    fontFamily: Anton
    fontSize: 22px
    fontWeight: "400"
    lineHeight: 26px
    letterSpacing: 0.04em
  body-lg:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Space Mono
    fontSize: 13px
    fontWeight: "700"
    lineHeight: 16px
    letterSpacing: 0.06em
  label-md:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: "700"
    lineHeight: 14px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Space Mono
    fontSize: 9px
    fontWeight: "700"
    lineHeight: 12px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
---

## Brand & Style

This design system expresses a technical utilitarian aesthetic calibrated specifically for progressive streetwear, high-performance apparel, and modular gear e-commerce. It merges industrial product spec sheets with contemporary luxury minimalism: precision-engineered, uncompromising, and functional.

The emotional tone balances tactical rigor with refined restraint. The interface deliberately avoids decorative fluff, allowing tactical product photography and high-contrast typographic hierarchy to drive user focus. Key visual characteristics include:

- Industrial spec-sheet information architecture with monospace coordinates, SKUs, and inventory telemetry.
- Ultra-condensed display headlines paired with monospaced data grids and structural hairline rules.
- Grounded concrete/sand tone backgrounds punctuated by matte obsidian blocks and high-visibility chartreuse/volt action highlights.
- Rounded utilitarian containers with crisp 1px mechanical outlines simulating milled components and weather-sealed modular pockets.

## Colors

The palette operates under a high-tactility, low-chroma philosophy accented by a high-voltage functional signal.

- **Neutral / Canvas (`#EAE8E3`):** Concrete technical sand, serving as the foundational surface layer across all views. Softens harsh digital white, providing an architectural, organic tactile warmth.
- **Surface Variant / Cards (`#E2E0DA`):** Slightly recessed or elevated module containers, secondary selectors, and active state fills.
- **Hairline Border (`#D1CFC9`):** 1px structural framing for cards, tabs, chips, and accordions.
- **Primary / Structural Obsidian (`#111111`):** Deep matte black for primary display typography, key active selector chips, solid black buttons, icons, and structural anchors.
- **Secondary / Volt Chartreuse (`#D4FF00`):** Pure electric lime used strictly for high-conversion primary triggers (e.g., Add to Cart), active pagination pips, and low-stock telemetry signals.
- **Tertiary / Technical Spec Grey (`#767671`):** Subdued functional tone for product codes, field labels, disabled size chips, and secondary metadata.
- **Alert / Destructive (`#E53935`):** Reserved for system warnings and out-of-stock states, kept austere and un-embellished.

## Typography

The typography architecture uses a stark dual-engine system:

1. **Condensed Display (`Anton`):** Used exclusively in uppercase format for product naming, section titles, and marketing banners. It provides bold, condensed visual punch reminiscent of industrial equipment labeling and technical apparel manifests.
2. **Monospaced Technical Body & Metadata (`Space Mono`):** Used for all specifications, descriptions, prices, chip labels, button copy, and status indicators.

Rules:

- Headlines must always be set in uppercase with a slight positive tracking (`0.03em` to `0.05em`) to balance condensed vertical heights.
- Numbers, pricing (`$420.00 USD`), SKUs (`SKU: NMU-JK-2401`), and inventory counters (`• ONLY 3 LEFT`) must consistently use monospace tabular spacing for instant scanning.
- Micro labels and meta copy render in uppercase `label-md` or `label-sm` with widened character spacing (`0.08em`–`0.1em`).

## Layout & Spacing

The layout is constructed on a disciplined, modular rhythm driven by utilitarian density:

- **Base Grid:** Strict 4px/8px modular spacing scale. Spacing within spec blocks (e.g., between color chips and size grids) sits at compact values (`0.5rem` to `0.75rem`), grouping related technical controls.
- **Mobile First Framework:**
  - Mobile screens leverage full-bleed imagery with a standard 16px lateral margin (`margin-mobile`).
  - Spec sheets, selectors, and interactive controls dock into rounded containers or bottom sticky sheets.
- **Reflow & Breakpoints:**
  - **Mobile (< 768px):** Single-column layout. Media stack with horizontal swipe pagination (utilizing the pill-shaped dot indicators). Product metadata, sizing chips, and action buttons stack sequentially below. Sticky bottom bar contains the primary Volt CTA and price indicator.
  - **Desktop (≥ 1024px):** Asymmetric split-view. A 60/40 structural division where media assets occupy multi-frame gallery tiles (main visual left, detail macro crops right) while specs and purchase controls are contained in an isolated, sticky 1px bordered modular panel.

## Elevation & Depth

This design system rejects conventional dropped shadows and blur gradients in favor of **structural physical surface containment**:

- **Zero-Shadow Philosophy:** No diffused drop shadows (`box-shadow: none`) across standard surfaces, modal cards, or buttons. Visual hierarchy is achieved exclusively through tonal surface steps (`#EAE8E3` canvas over `#E2E0DA` inner containers) and crisp hairline borders.
- **Hairline Isolation:** Interactive components, cards, and floating zoom controls use a 1px solid border (`#D1CFC9` on canvas, `#111111` when active or inverted) creating machined, blueprint-like delineation.
- **Overlaid Tactical Controls:** Image overlay buttons (e.g., gallery counter `01 / 03`, expand icon, slider arrow buttons) utilize matte `#111111` obsidian pills with semi-transparency or pure opacity, creating functional contrast against product photography.

## Shapes

The design system pairs high-radius containers with precision micro-radii to balance industrial utility with modern street appeal:

- **Structural Containers & Spec Cards:** Rounded 16px (`rounded-2xl` / `1rem`), providing a contained, soft-armored device chassis silhouette.
- **Interactive Control Elements (Chips, Steppers, Inputs):** 8px corner radius (`rounded-lg` / `0.5rem`) for size buttons, quantity selectors, and metadata tags.
- **Action Buttons & Floating Overlays:** 8px to 10px rounded rect for full-width action buttons; pure circular or pill-shape (`rounded-full`) for media counters, pagination bullets, and floating icon buttons.

## Components

### Buttons

- **Primary Action (Add to Cart):** Background `#D4FF00` (Volt), text `#111111` bold uppercase `Space Mono`. Border: none. Radius: `8px`. Height: `52px` (mobile touch target standard). Pressed state: `#BCE300`.
- **Secondary Action (Wishlist / Inquire):** Background transparent, text `#111111`, border: 1px solid `#111111`. Radius: `8px`. Height: `48px`. Icon and label aligned centrally in uppercase monospace.
- **Navigation Controls (Slider Arrows):** 40x40px matte `#111111` squares or rounded pills, white minimal iconography, tactile instant active press state (`scale(0.96)`).

### Size & Option Chips

- **Default State:** Off-white container (`#EAE8E3` or `#E2E0DA`), 1px border `#D1CFC9`, text `#111111` uppercase `label-md`. Minimum dimension 44x44px.
- **Selected State:** Solid `#111111` fill, crisp `#FFFFFF` text, with a `#D4FF00` volt indicator dot preceding the value (e.g., `• M`).
- **Disabled / Out of Stock State:** Light opacity (`0.35`), neutral grey background, with a clean diagonal hairline strike-through line across the chip bounding box.

### Quantity Stepper

- Integrated pill or rounded rectangle containing decrement (`−`), value (tabular monospace `12px`), and increment (`+`). Border: 1px solid `#D1CFC9`. Background `#E2E0DA`.

### Data Grids & Spec Sheets

- Key-value rows segmented by hairline divider rules (`1px solid #D1CFC9`). Keys in tertiary `#767671` uppercase `label-sm`; values in `#111111` uppercase `label-md`.

### Expandable Accordions (Description / Product Details)

- Full-width modular rows bounded by top and bottom 1px borders. Uppercase monospace title with minimal `+` / `−` glyphs right-aligned. Fluid height transition revealing monospace fabric specifications, wash care, and fit metrics.

### Status Indicators & Inventory Telemetry

- Stock urgency flags feature a pulsating volt dot (`#D4FF00`) followed by bold tracking metadata: `• ONLY 3 LEFT` in `Space Mono` 11px uppercase.
