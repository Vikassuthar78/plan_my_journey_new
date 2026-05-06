---
name: Boutique Voyage
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
  max_width: 1280px
---

## Brand & Style

The brand personality of the design system centers on "Curated Reliability." It aims to bridge the gap between the logistical efficiency of major travel aggregators and the emotional resonance of a boutique travel agency. The target audience is the discerning traveler who values both security and discovery.

The design style is **Corporate Modern with a Minimalist lean**. It prioritizes extreme clarity and whitespace to reduce "booking anxiety," while using high-end photography and subtle depth to evoke a sense of premium service. The UI should feel intentional and airy, moving away from the cluttered density of budget platforms toward a more serene, editorial experience.

## Colors

The palette is anchored by **Deep Slate Blue** (Primary) to establish immediate trust and professional authority. This is contrasted by **Vibrant Teal** (Secondary), used sparingly as an "adventure accent" for primary calls-to-action and discovery-oriented UI elements.

- **Primary:** Deep Navy (#0F172A) for typography, headers, and core navigation.
- **Secondary:** Teal (#0D9488) for buttons, active states, and price highlights.
- **Neutrals:** A range of cool grays (Slate) provides a clean, systematic structure without the harshness of pure black.
- **Backgrounds:** Off-white (#F8FAFC) is used for the main canvas to ensure high-quality photography "pops" against a clean backdrop.

## Typography

This design system utilizes a dual-font strategy. **Plus Jakarta Sans** is used for headings to provide a modern, friendly, and premium feel with its distinctive geometric shapes. **Inter** is used for all body text and UI labels to ensure maximum legibility at smaller sizes and across technical booking details.

- Use tight tracking and lower line-heights for large display headings to maintain a "bold" editorial look.
- Body text should maintain generous line-heights (1.5+) to ensure content remains digestible during long-form destination reading.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid grid**. Content is centered within a maximum width of 1280px for desktop views to maintain readability. The grid is a standard 12-column system, but with increased gutters (24px) to emphasize the boutique, spacious feel.

- **Vertical Rhythm:** Use the 8px baseline (multiples of the "xs" variable) for all component spacing.
- **Sections:** Large-scale sections (e.g., hero to search results) should be separated by "xl" spacing to create a rhythmic, unhurried flow.

## Elevation & Depth

Visual hierarchy is managed through **Ambient Shadows** and **Tonal Layers**. Surfaces should feel like they are floating slightly above the background canvas rather than being heavily layered.

- **Cards & Popovers:** Use very soft, diffused shadows with a slight blue tint (e.g., `rgba(15, 23, 42, 0.08)`) and a large blur radius.
- **Search Bars:** Utilize a white-on-white elevation strategy where the search bar has a higher elevation shadow than the content cards below it to signal priority.
- **Hover States:** Instead of heavy color changes, use a subtle lift (increasing shadow spread) to provide tactile feedback.

## Shapes

The design system uses a **Rounded** shape language (0.5rem base radius). This communicates approachability and comfort, essential for the travel industry.

- **Buttons & Inputs:** Follow the 8px (0.5rem) standard.
- **Feature Cards:** Use `rounded-xl` (1.5rem) to enclose high-quality imagery, creating a soft "window" effect into the destination.
- **Chips:** Should be fully pill-shaped (rounded-full) to distinguish them clearly from interactive buttons.

## Components

- **Buttons:** Primary buttons use the Teal secondary color with white text. High-priority "Book Now" buttons should feature a subtle gradient transition. Secondary buttons use a Slate-Blue outline with no fill.
- **Inputs:** Search inputs should be large with clear icon affordances (e.g., a simple magnifying glass or calendar icon). Focus states are indicated by a 2px Teal border.
- **Cards:** Destination cards should feature full-bleed imagery at the top with a content area below that uses the `headline-md` for pricing and `label-sm` for location.
- **Chips:** Small, low-contrast background (Slate-100) with Slate-700 text for tags like "All-Inclusive" or "Pet Friendly."
- **Imagery:** All photos should have a consistent warm color grade. Avoid stock-looking office environments; prioritize natural lighting and expansive landscapes.
- **Progressive Disclosure:** Use accordions for detailed flight or hotel information to keep the main interface clean.