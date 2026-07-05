---
name: Academic Excellence Design System
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#0061a5'
  on-secondary: '#ffffff'
  secondary-container: '#66affe'
  on-secondary-container: '#004172'
  tertiary: '#172328'
  on-tertiary: '#ffffff'
  tertiary-container: '#2c383d'
  on-tertiary-container: '#94a1a8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d2e4ff'
  secondary-fixed-dim: '#9fcaff'
  on-secondary-fixed: '#001d37'
  on-secondary-fixed-variant: '#00497e'
  tertiary-fixed: '#d8e4eb'
  tertiary-fixed-dim: '#bcc8cf'
  on-tertiary-fixed: '#111d22'
  on-tertiary-fixed-variant: '#3c494e'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  code-sm:
    fontFamily: Courier Prime
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for the academic environment of a Thai university, specifically tailored for the "Course Syllabus" (มคอ. 3) management. The brand personality is **sophisticated, authoritative, and structured**, yet modern enough to feel accessible to both faculty and administration.

The style leverages **Modern Minimalism** with a focus on information density and clarity. It prioritizes a logical flow of information, utilizing generous white space to reduce the cognitive load inherent in complex academic documentation. High-quality typography and a restrained color palette ensure that the "Course Syllabus" is the hero of the interface, reflecting the university's commitment to educational excellence and digital transformation.

## Colors
This design system utilizes a palette rooted in **Deep Blue** to convey trust and institutional authority. 

- **Primary (#1a365d):** Used for global navigation, headers, and primary actions. It represents the "anchor" of the institution.
- **Secondary Accent (#3182ce):** A more vibrant blue used for interactive elements, focus states, and highlighting current progress within the syllabus workflow.
- **Neutral Background (#f7fafc):** A cool, soft gray applied to large surface areas to provide a clean canvas that minimizes eye strain during long-form data entry.
- **Surface White (#ffffff):** Used for cards and input containers to create a distinct "paper-like" feel for the syllabus sections.

## Typography
The system uses **Be Vietnam Pro** across all levels. It was selected for its exceptional legibility and modern, clean glyphs that complement Thai script characteristics. 

The hierarchy is strictly enforced to guide users through the complex sections of a syllabus (e.g., Course Description, Learning Outcomes, Lesson Plans). Use `headline-lg` for section titles and `label-md` for metadata and form descriptors. For the มคอ. 3 data tables, `body-sm` is preferred to maintain a high information density without sacrificing readability.

## Layout & Spacing
The layout employs a **12-column fluid grid** system centered within a maximum container width of 1280px. 

- **Desktop:** 32px side margins with 24px gutters.
- **Tablet:** 24px side margins with 16px gutters.
- **Mobile:** 16px side margins with 12px gutters.

The spacing rhythm is based on a **4px scale**. Components should predominantly use `md` (16px) for internal padding and `lg` (24px) for vertical rhythm between form groups. This ensures the application feels structured and "academic" rather than cramped.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and **Tonal Layering**. 

1.  **Base Layer:** The `neutral-color` background serves as the foundation.
2.  **Content Layer:** White surfaces (Cards) use a very soft, diffused shadow (`0 4px 12px rgba(26, 54, 93, 0.05)`) to lift the syllabus content from the background.
3.  **Interactive Layer:** Buttons and active form fields use a slightly more pronounced shadow upon hover to indicate interactability.
4.  **Overlay Layer:** Modals and dropdowns use a high-elevation shadow (`0 12px 24px rgba(26, 54, 93, 0.1)`) to ensure focus.

Avoid heavy borders; instead, use 1px subtle outlines in a slightly darker gray than the background to define boundaries where shadows are not appropriate.

## Shapes
Following the requirement for a modern feel, the design system utilizes **Rounded** shapes. 

- **Standard Elements:** 0.5rem (8px) for buttons, input fields, and small cards.
- **Large Containers:** 1rem (16px) for main syllabus content sections or dashboard widgets.
- **Interactive Indicators:** Pills are used for status tags (e.g., "Draft", "Approved") to distinguish them from actionable buttons.

## Components

### Buttons
Primary buttons use the `primary_color` (Deep Blue) with white text. Secondary buttons use a `secondary_color` outline with a transparent background. All buttons feature a 0.5rem radius and a slight transition effect on hover.

### Input Fields
Inputs are critical for syllabus entry. They feature a white background, 1px border (#e2e8f0), and 8px rounded corners. On focus, the border transitions to `secondary_color` (Accent Blue) with a soft outer glow. Labels are always positioned above the field using `label-md` for maximum clarity.

### Data Tables (Lesson Plans)
Tables must support complex data. Use a "Zebra" striping pattern (white and `neutral_color`). Headers are sticky, utilizing a `primary_color` background with white text to maintain context during long scrolls.

### Syllabus Progress Stepper
A custom component at the top of the interface that tracks the completion of the 7 sections of the มคอ. 3. Completed steps are marked in `secondary_color` with a check icon.

### Cards
Cards are the primary container for syllabus sections. Each card should have a clear `headline-sm` title and a subtle footer for section-specific actions (e.g., "Save Draft", "Clear Section").