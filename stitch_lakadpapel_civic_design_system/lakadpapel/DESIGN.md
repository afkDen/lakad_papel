---
name: LakadPapel
colors:
  surface: '#fff8f5'
  surface-dim: '#e2d8d2'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2eb'
  surface-container: '#f6ece6'
  surface-container-high: '#f0e6e0'
  surface-container-highest: '#eae1da'
  on-surface: '#1f1b17'
  on-surface-variant: '#554336'
  inverse-surface: '#342f2b'
  inverse-on-surface: '#f9efe8'
  outline: '#887364'
  outline-variant: '#dbc2b0'
  surface-tint: '#904d00'
  primary: '#8d4b00'
  on-primary: '#ffffff'
  primary-container: '#b15f00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb77d'
  secondary: '#006780'
  on-secondary: '#ffffff'
  secondary-container: '#76dcff'
  on-secondary-container: '#006077'
  tertiary: '#006b2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#00873a'
  on-tertiary-container: '#f7fff2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#b7eaff'
  secondary-fixed-dim: '#6cd3f7'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e61'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#fff8f5'
  on-background: '#1f1b17'
  surface-variant: '#eae1da'
  background-paper: '#F7F4EF'
  surface-card: '#FFFFFF'
  border-subtle: '#E8E0D5'
  state-locked: '#CBD5E1'
  warning-bg: '#FEF3C7'
typography:
  page-title:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  card-title:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-main:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  metadata:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 8px
  margin-horizontal: 20px
  card-padding: 16px
  stack-gap: 12px
  section-gap: 24px
---

## Brand & Style

The design system embodies a **structured, navigational, and empowering** civic-tech aesthetic. It is designed to demystify high-friction government bureaucracy, transforming complex algorithmic paths into a clear, approachable roadmap for the Filipino citizen. 

The visual style is **Modern Corporate with Tactile Warmth**, balancing the precision of a technical guide with the approachability of a community service. It utilizes a "warm paper" base to evoke a sense of physical documentation and reliability, while employing modern structural grids to maintain professional order.

### Design Principles
- **Clarity over Decoration:** Every element serves a functional purpose in the user's journey.
- **Supportive Presence:** Use warm tones and soft shadows to reduce the "bureaucratic anxiety" typically associated with government processes.
- **Information Hierarchy:** High-density utility for power users, paired with clear, large touch targets for general accessibility.
- **Banned Elements:** Absolutely no dark backgrounds (except for specific status states if required), glassmorphism, gradients, or emojis. Text must remain literal; no placeholder content is permitted.

## Colors

The palette is rooted in a warm, "paper-like" neutral base that provides a comfortable reading environment for dense information.

- **Primary (Amber):** Used for brand indicators, primary actions, and active navigation states.
- **Action (Teal):** Reserved for secondary functional actions and high-visibility links.
- **Success (Green):** Indicates completed milestones, "possessed" document status, and positive verification.
- **Locked (Slate):** Desaturates and recedes steps or documents that are currently unavailable.
- **Warning:** A specific combination of a light amber background with a primary amber border, used exclusively for agency alerts (e.g., missing physical branches).

All icons default to the neutral slate-gray (`#78716C`) and transition to Primary Amber when active or highlighted.

## Typography

This design system uses **Inter** exclusively to maintain a systematic, utilitarian, and highly legible interface across all device types. 

The hierarchy is strictly enforced to ensure complex data (like fees and processing times) remains readable. Headers use bold weights for immediate orientation, while metadata utilizes a smaller, regular weight. Labels are always presented in uppercase with increased letter spacing to differentiate them from interactive body text.

## Layout & Spacing

The layout follows a **fixed-margin fluid grid** model, optimized for mobile-first civic navigation. 

### Spacing Logic
- **8px Base Grid:** All internal component spacing and external margins are multiples of 8.
- **Horizontal Safey:** A consistent 20px margin on the left and right of the screen ensures content doesn't hit the bezel.
- **Card Internals:** All cards utilize a 16px (2x base) internal padding for consistent content breathing room.
- **Vertical Rhythm:** Cards in a list are separated by a 12px gap, while major semantic sections are separated by 24px.

The layout adapts from a single-column linear checklist on mobile to a multi-pane view on tablet, where the document list and the map/branch details can sit side-by-side.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Subtle Ambient Shadows** rather than aggressive elevation.

- **Background:** The base layer is the warm paper color (`#F7F4EF`).
- **Surface:** Functional cards sit on the background with a pure white surface (`#FFFFFF`).
- **Outlines:** Cards use a `#E8E0D5` border to define their boundaries against the warm background.
- **Shadows:** A very soft, low-opacity shadow is applied to cards in Light Mode to provide a tactile "stacked paper" feel. Shadows should be diffused with a large blur radius and zero spread, tinted slightly with the neutral slate color to avoid a "dirty" look.
- **Interaction:** Upon being pressed, cards should slightly scale down (spring physics) and the shadow depth should decrease to simulate a physical press.

## Shapes

The shape language is **Softly Structured**. Rounded corners are used to make the UI feel approachable and modern, but they are not so extreme as to appear "playful" or "childish."

- **Cards & Modals:** Use the standard `rounded-lg` (1rem / 16px) to match the internal padding.
- **Buttons & Input Fields:** Use the standard `rounded` (0.5rem / 8px).
- **Status Pills & Chips:** Use the `rounded-xl` (1.5rem / 24px) for a distinct, pill-shaped appearance that separates them from structural cards.

## Components

### Buttons
- **Primary:** Solid Primary Amber background with White text. Bold weight.
- **Secondary:** Outlined Teal border with Teal text. Used for "Get Directions" or "View Map."
- **Ghost:** No background or border; uses Teal or Neutral text for low-priority actions like "Cancel."

### Cards (`DocumentCard` & `StepCard`)
- **Structure:** White background, subtle border, and soft shadow.
- **Locked State:** When a step is locked, the card opacity drops to 0.6 and the border color changes to Slate (`#CBD5E1`).
- **Interactive Checkbox:** Uses a custom circular toggle. When "possessed," it fills with Success Green and displays a checkmark.

### Inputs & Fields
- **Input Fields:** Soft beige-tinted background with a subtle border. Label sits above in the `label-caps` style.
- **Selection Chips:** Used for "Simple" vs "Advanced" mode toggles. Active state uses Primary Amber with a light amber tint background.

### Iconography
- **Style:** Ionicons, **outlined variant only**.
- **Sizing:** Standardized at 20px.
- **Color:** Neutral slate-gray by default; Primary Amber for active navigation items.

### Alerts & Callouts
- **Agency Warnings:** Light amber background, primary amber border, and left-aligned warning icon. Used specifically when an agency (like a School or Barangay) lacks a specific GPS branch location.