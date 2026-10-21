# iOS 26 & iPadOS 26 Design System

A design system for prototyping Apple‑native interfaces in the iOS 26 / iPadOS 26 era — the "Liquid Glass" generation. Source of truth: Apple's official **iOS and iPadOS 26 (Community)** Figma UI Kit, mirrored here as CSS tokens, fonts, copied imagery, and React UI‑kit recreations of the most common surfaces.

This is **not** a generic "phone mockup" kit. It is opinionated and faithful — every spacing, blur, corner radius and color value is lifted from the kit rather than approximated.

---

## What's in scope

iOS 26 reworked Apple's visual language around a translucent **Liquid Glass** material. The kit covers the full surface area of the OS:

- **System surfaces** — Lock screen, Home Screen, Control Center, Widgets, Notifications
- **Bars** — Status bars, Tab bars, Toolbars, Navigation bars (large title, compact, search)
- **Controls** — Buttons (text & symbol, both Liquid Glass and tinted), Toggles, Sliders, Steppers, Segmented controls, Pop‑up buttons, Page controls
- **Inputs** — Text fields, Pickers (compact + wheel), Keyboards (default, numbers & punctuation, emoji, find & replace), Color pickers
- **Containers** — Lists (grouped & plain), Sidebars, Sheets (modal, inspector, stacked), Popovers, Menus, Contextual menus, Alerts, Action sheets, Activity views
- **Feedback** — Progress indicators, Notifications, Empty states, Face ID prompts
- **Icons** — App icons (default / dark / clear‑light), system icons, custom icon templates
- **Bezels** — iPhone & iPad device frames in every current colorway

## Sources

- **Figma file:** "iOS and iPadOS 26 (Community)" — Apple Design Resources, 41 pages, 225 top‑level frames, 1,271 local components. Mounted read‑only in this project as a virtual filesystem.
- **Apple Human Interface Guidelines** — Designing for iOS / Designing for iPadOS.
- **SF Pro** — Apple's system typeface (distributed by Apple at developer.apple.com/fonts). System‑stack fallback is used in this kit; install SF Pro locally for pixel‑accurate rendering.
- **SF Symbols 7+** — Apple's icon font, referenced by name in the kit but rendered via SVG copies where available.

> ⚠️ **Substitutions**
> - **SF Pro web font:** Apple does not distribute SF Pro under a web font license. This kit ships a system‑font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display"`) and falls back to **Inter** (Google Fonts) on non‑Apple platforms. Drop real `SF-Pro.woff2` files into `/fonts/` and they will take over automatically.
> - **SF Symbols:** Apple's icon set is not redistributable. Where individual SF Symbols are needed we substitute **Lucide** (CDN) at matching stroke weight; for status‑bar glyphs and app icons we use copies from the Figma file.

---

## Index

| File / Folder | What it is |
|---|---|
| `README.md` | This file — system overview, content & visual foundations |
| `SKILL.md` | Skill descriptor — load this design system from Claude Code |
| `colors_and_type.css` | All design tokens: system colors (light + dark + increased‑contrast), labels, fills, materials, typography, radii, spacing |
| `fonts/` | SF Pro placeholders + Inter fallback declarations |
| `assets/` | App icons, system icons, wallpapers, status‑bar glyphs lifted from the Figma file |
| `ui_kits/ios/` | React UI kit — iPhone components & a click‑through prototype (`index.html`) |
| `ui_kits/ipados/` | React UI kit — iPad components & a click‑through prototype (`index.html`) |
| `preview/` | Design‑system cards that populate the Design System tab |

## Content fundamentals

Apple's voice in iOS is **direct, warm, and confident**. It speaks to the user the way a thoughtful person would, never an institution.

- **Pronoun:** "You" (you, your). The system rarely refers to itself as "I"; it just acts. "Your iPhone is up to date." not "I have updated your iPhone."
- **Casing:** **Title Case** for screen titles, settings rows, button labels, and tab labels ("Mail Settings", "Add Account", "Show Battery Percentage"). **Sentence case** for body copy and explanatory text under settings rows.
- **Tone:** Helpful, never chatty. Punctuation is full and correct. Periods end sentences in body copy; **omit periods on single‑sentence button labels and section footers** unless multiple sentences run together.
- **Length:** Aggressively short. A settings row footer is one or two sentences, max. A toast is five or fewer words. A confirmation alert is a question + two button labels.
- **Vocabulary:** Plain English. "Turn on" not "enable." "Delete" not "remove." "Done" not "save." Brand names ("AirDrop", "FaceTime", "iCloud") are always cased correctly and never broken across lines if you can help it.
- **Numbers & units:** Numerals for everything ("3 hr 12 min", "5 GB", "12 °F"). Times use a thin space before AM/PM in metadata, no space in tight contexts.
- **No emoji** in system chrome. Emoji belong to user content (Messages, Notes) — never in titles, buttons, or alerts written by the system itself.
- **No exclamation marks** except in user‑facing celebrations ("All caught up!" empty state). System messages stay calm.

Concrete examples from the kit:

> **Alert title:** "Delete Note?"
> **Alert body:** "This note will be deleted from all of your devices."
> **Destructive button:** "Delete"  ·  **Cancel button:** "Cancel"

> **Settings row:** "Show Battery Percentage"
> **Footer:** "Display the remaining battery as a percentage in the status bar."

> **Empty state title:** "No Messages"
> **Empty state subtitle:** "Messages you receive will appear here."

> **Toolbar action:** "Edit"  ·  "Done"  ·  "Cancel"  ·  "Share"

---

## Visual foundations

### Materials & the Liquid Glass system
iOS 26's defining motif is **Liquid Glass** — a stack of translucent layers that pick up the color and content behind them. Every floating control (toolbars, tab bars, sheets, menus, pop‑overs, even individual buttons) is a glass surface. The kit defines four thicknesses, in both light and dark mode:

| Material | Light fill | Dark fill | Blur |
|---|---|---|---|
| **Ultrathin** | `rgba(255,255,255,0.25)` over `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.25)` over `rgba(0,0,0,0.10)` | `blur(60px)` |
| **Thin** | `rgba(255,255,255,0.4)` over `rgba(255,255,255,0.2)` | `rgba(0,0,0,0.4)` over `rgba(0,0,0,0.2)` | `blur(80px)` |
| **Regular** | `rgba(255,255,255,0.6)` over `rgba(255,255,255,0.25)` | `rgba(0,0,0,0.6)` over `rgba(0,0,0,0.25)` | `blur(100px)` |
| **Thick** | `rgba(255,255,255,0.8)` over `rgba(255,255,255,0.35)` | `rgba(0,0,0,0.8)` over `rgba(0,0,0,0.35)` | `blur(120px)` |

Liquid Glass on a control is a **regular** material with an inner stroke of `rgba(255,255,255,0.4)` at the top edge and `rgba(0,0,0,0.1)` at the bottom edge — the suggestion of a beveled glass lozenge. Always paired with a soft drop shadow (`0 8px 24px rgba(0,0,0,0.10)`).

### Colors
Twelve named system colors (Red, Orange, Yellow, Green, Mint, Teal, Cyan, Blue, Indigo, Purple, Pink, Brown), each with a light and dark variant and an **increased‑contrast** variant for accessibility. Plus a 6‑step gray ramp (`systemGray` → `systemGray6`) that inverts between modes. Plus semantic labels (`label`, `secondaryLabel`, `tertiaryLabel`, `quaternaryLabel`) and fills (`systemFill`, `secondarySystemFill`, …) layered on top.

The accent color across system UI is **systemBlue** (`#007AFF` light / `#0A84FF` dark). Destructive actions are **systemRed**.

### Typography
**SF Pro** in five weights (Regular 400, Medium 500, Semibold 600, Bold 700, Heavy 900). SF Compact and SF Compact Rounded appear in special contexts (status bar time, watchOS‑style numerals, large weather temperatures). The dynamic‑type scale ranges from **xSmall (11pt)** to **xxxLarge (23pt)** at the body size, with eleven named text styles (Large Title, Title 1–3, Headline, Body, Callout, Subhead, Footnote, Caption 1–2). Letter‑spacing is tight on display sizes (negative tracking) and loose on small captions.

### Backgrounds
Three philosophies, layered:
1. **Wallpaper** behind everything on the Home Screen and Lock Screen — full‑bleed photographic, often with parallax. The kit ships an iOS 26 default wallpaper at `assets/wallpaper.jpg`.
2. **Grouped backgrounds** for content surfaces — `systemGroupedBackground` (light: `#F2F2F7`, dark: `#000000`), with `secondarySystemGroupedBackground` for the cards that sit on it (light: `#FFFFFF`, dark: `#1C1C1E`).
3. **Glass overlays** for floating chrome — toolbars and tab bars sit *above* the scrolling content as Liquid Glass, never as opaque bars.

There are **no gradients** in system chrome. The only gradients in the kit are **scroll‑edge protection gradients** (soft fade from transparent to the surface color at the top of a scroll region under a translucent toolbar) and the subtle inner stroke of glass surfaces.

### Animation
- **Easing:** `cubic-bezier(0.32, 0.72, 0, 1)` — Apple's spring‑like ease. Used for transitions, sheets, menu open/close.
- **Duration:** 250–350 ms for most UI transitions; 500–600 ms for sheet present / dismiss.
- **Sheet presentation:** Slide up from the bottom edge of the screen with a slight scale on the underlying view (`scale(0.92)`, corner radius animating from 0 → 12).
- **Liquid Glass press feedback:** Brightness pulses up `+8%` and the glass slightly inflates (`scale(1.02)` for 80 ms, then settles).
- **No bounce, no overshoot** on small UI elements. Bouncy springs are reserved for sheet drag‑to‑dismiss and Dynamic Island morphs.

### Interaction states
- **Hover (iPadOS / Catalyst):** Background goes to `secondarySystemFill` (`rgba(120,120,128,0.16)` light, `rgba(120,120,128,0.32)` dark) with a 12 px capsule.
- **Press:** Opacity drops to **0.4** on plain text/symbol buttons. Glass buttons brighten by 8%. Destructive items press to a 20%‑opacity red wash.
- **Disabled:** Opacity **0.3**, no other change.
- **Focus (keyboard/VoiceOver):** A 4 px outset stroke at `systemBlue`, radius matching the control + 4 px.

### Borders, strokes, shadows
- **Hairlines:** `0.5 px` (or `1 px` on @1× displays) at `separator` color — `rgba(60,60,67,0.29)` light, `rgba(84,84,88,0.65)` dark. Used between list rows and at the bottom of nav bars when materials aren't doing the work.
- **Card shadow:** `0 8px 24px rgba(0,0,0,0.10)` plus a hairline inner stroke.
- **Sheet shadow:** `0 -2px 30px rgba(0,0,0,0.15)` cast upward onto the dimmed background.
- **No drop shadows on text.** No glow effects. No blur on shadows beyond what's listed.

### Corner radii
- **Continuous corners** — iOS uses **superellipse / squircle** corners, not circular. CSS approximation: pair `border-radius` with `overflow: clip`; for the icon/card squircle look use SVG masks where possible.
- **Standard values:**
  - Buttons (capsule): `border-radius: 9999px`
  - Glass control inset: **12 px** small / **22 px** medium / **28 px** large
  - List card: **10 px** (grouped) · **0 px** (plain)
  - Sheet top corners: **10 px** stacked · **38 px** when presented behind a parent sheet
  - App icon: **22.37 %** of icon width (continuous corner; ~ `border-radius: 22.37%`)
  - iPhone bezel: **47.33 px** at @1× (`@375 px` width)

### Layout rules
- **Safe areas:** Always respect the dynamic island / notch and the home indicator. Top safe area is 59 px on a Dynamic Island iPhone, bottom safe area is 34 px.
- **Margins:** 16 px screen margin on iPhone, 20 px on iPad in compact width, 24 px+ on iPad in regular width.
- **Tab bar height:** 49 + 34 (home indicator) = 83 px.
- **Toolbar height:** 44 px regular · 32 px compact (Liquid Glass floats with 8 px inset from edges).
- **List row min height:** 44 px (matches Apple's minimum hit target).

### Transparency & blur
Transparency is the **default**, not an effect. Toolbars and tab bars start translucent and become more opaque as content scrolls beneath them (scroll edge effect). Pop‑overs, menus, sheets and alerts are all Liquid Glass. The only solid surfaces are: photographic content (wallpaper, images), list cards (white / `systemGray6`), and the background of the Settings app (grouped background).

### Imagery
Imagery in system UI is **photographic and warm** — wallpapers shown in the kit lean toward macro nature, atmospheric landscapes, and abstract gradients (the latter as rendered photographs, not CSS gradients). App icons are richly illustrated, full‑bleed, with one or two custom illustrations per app, often featuring soft shadows and dimensional metaphors (calendar grid, stocks line, photo gradient).

---

## Iconography

See `assets/` for the copied set.

- **SF Symbols** is Apple's icon system — a font‑style icon library with 5,000+ glyphs, drawn in three weights (Light, Regular, Bold) and four scales (Small, Medium, Large, XL). Used everywhere: buttons, tab bars, toolbars, list rows.
- In this kit we substitute **Lucide** (CDN) for unknown SF Symbol references, at `stroke-width: 1.5` to match SF Symbols Regular. Where the Figma file ships a real SVG (status bar wifi, signal, battery; the airdrop ring; tab bar shapes) we copy those directly into `assets/icons/`.
- **App icons** in `assets/app-icons/` — Mail, Messages, Notes, Calendar, Calculator, Camera, Maps, Music, Photos, Phone, Reminders, Safari, Settings, Wallet, Weather, App Store, plus a few iWork icons. Each lifted from the Figma file at native resolution (180×180 typically) in the default colorway. Three modes exist in the source (Default, Dark, Clear); we ship Default only to keep the asset folder reasonable.
- **Unicode characters** are sometimes used as glyphs in chrome (chevrons `›`, ellipsis `…`, en/em dashes `– —`) but **never as substitutes for an icon**. If a real icon exists, use it.
- **Emoji** never appear in system chrome — see "Content fundamentals" above.
