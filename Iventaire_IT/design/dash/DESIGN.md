---
name: DST Management System
colors:
  surface: '#f8faf7'
  surface-dim: '#d8dbd8'
  surface-bright: '#f8faf7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f1'
  surface-container: '#eceeec'
  surface-container-high: '#e7e9e6'
  surface-container-highest: '#e1e3e0'
  on-surface: '#191c1b'
  on-surface-variant: '#3f4945'
  inverse-surface: '#2e3130'
  inverse-on-surface: '#eff1ef'
  outline: '#707975'
  outline-variant: '#bfc9c4'
  surface-tint: '#29695b'
  primary: '#00342b'
  on-primary: '#ffffff'
  primary-container: '#004d40'
  on-primary-container: '#7ebdac'
  inverse-primary: '#94d3c1'
  secondary: '#b6171e'
  on-secondary: '#ffffff'
  secondary-container: '#da3433'
  on-secondary-container: '#fffbff'
  tertiary: '#4e2013'
  on-tertiary: '#ffffff'
  tertiary-container: '#693527'
  on-tertiary-container: '#e89f8c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#afefdd'
  primary-fixed-dim: '#94d3c1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#065043'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb3ac'
  on-secondary-fixed: '#410003'
  on-secondary-fixed-variant: '#930010'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a1'
  on-tertiary-fixed: '#370e04'
  on-tertiary-fixed-variant: '#6d382a'
  background: '#f8faf7'
  on-background: '#191c1b'
  surface-variant: '#e1e3e0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  container-padding: 32px
  gutter: 24px
  card-gap: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system for the Direction des Services Topographiques (DST) embodies precision, authority, and administrative efficiency. It is tailored for high-stakes governmental management, where clarity of data and institutional trust are paramount.

The visual style is **Corporate / Modern** with a strong emphasis on **Minimalism**. It utilizes a card-based architecture to organize complex topographic and administrative data into digestible modules. The interface balances the weight of a deep forest-green identity with the breathable, functional clarity of pure white workspace areas, ensuring focus during extended professional use.

## Colors
The palette is rooted in the institutional identity of the DST.

*   **Primary (Emerald/Forest Green):** Used for the sidebar, primary actions, and branding elements. It signifies growth and the land-based nature of topographic services.
*   **Accent (Crimson Red):** Reserved for critical alerts, error states, and high-priority indicators to ensure immediate visual detection.
*   **Neutral (Pure White & Slate):** The main content area uses a white background with subtle slate-gray borders to create a high-contrast environment that aids readability.
*   **Sidebar Interactivity:** The sidebar utilizes a high-contrast inversion logic. The default state is deep green; upon hover or selection, the item transitions to white background with primary green text/icons.

## Typography
This design system utilizes **Inter** for its exceptional legibility and neutral, professional tone. 

The typographic hierarchy is strictly structured to handle data-dense tables and complex forms. Display and Title styles use tighter letter spacing for a modern, "compact" feel, while body text maintains standard spacing to ensure readability in long-form administrative reports. Labels are occasionally transformed to uppercase with increased tracking to differentiate metadata from primary data.

## Layout & Spacing
The layout follows a **Fixed Sidebar + Fluid Content** model. 

*   **Grid:** A 12-column grid is used for the main content area, allowing cards to span 3, 4, 6, or 12 columns depending on the data complexity.
*   **Rhythm:** An 8px linear scale governs all spacing.
*   **Breakpoints:**
    *   **Desktop (1440px+):** Full sidebar (260px) and wide margins.
    *   **Tablet (768px - 1024px):** Sidebar collapses to icons-only (80px), margins reduce to 16px.
    *   **Mobile (<768px):** Sidebar becomes a hidden drawer; cards stack vertically with 100% width.

## Elevation & Depth
To maintain a minimalist profile, the design system avoids heavy shadows. 

*   **Surface-Level:** The main background is white.
*   **Card-Level:** Cards use a 1px solid border (`#E5E7EB`) with an extremely soft, neutral shadow (4px blur, 2% opacity) to provide just enough lift to separate them from the background.
*   **Interactive-Level:** Hovered cards or buttons may increase shadow depth (8px blur, 6% opacity) and transition border color to the primary emerald green.
*   **Sidebar:** The sidebar is treated as the lowest level (Base), providing a "frame" for the content cards that sit on top.

## Shapes
The shape language is professional and approachable. 

The system uses a **Rounded** (0.5rem) baseline for most UI components. This softens the rigid nature of administrative software without appearing overly casual. 
*   **Small Components (Buttons, Inputs):** 0.5rem (8px).
*   **Large Components (Cards, Modals):** 1rem (16px).
*   **Status Tags/Chips:** Full pill-shaped (100px) to distinguish them from interactive buttons.

## Components
Consistent implementation of components ensures a unified user experience.

*   **Sidebar Navigation:** Items must have a transition duration of 200ms. On hover/active, the background slides in as white with 8px border-radius, while the icon (Flaticon-style line icon) and text change to Primary Green.
*   **Buttons:** 
    *   *Primary:* Solid Emerald Green with white text.
    *   *Secondary:* White background with Primary Green border and text.
    *   *Accent:* Solid Crimson for destructive actions (e.g., Delete, Reject).
*   **Cards:** Pure white background, 1px light-gray border, 16px internal padding. Card headers should include a bottom border and a relevant line icon.
*   **Input Fields:** Ghost-style borders that turn Primary Green on focus. Labels sit above the field in `label-md` style.
*   **Status Chips:** Low-saturation backgrounds with high-saturation text (e.g., Pending = Soft Yellow/Gold, Completed = Soft Green/Dark Green).
*   **Iconography:** Use consistent line weights (1.5px or 2px) for all icons. Avoid filled icons unless indicating an "active" navigation state.