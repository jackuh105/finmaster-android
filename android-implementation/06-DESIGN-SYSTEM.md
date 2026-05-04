# 06 - Design System (Neo-Brutalism)

This document defines the complete Neo-brutalism design system as implemented in the web app, with exact values for colors, typography, spacing, shadows, and borders. All values must be replicated in the Android Compose theme.

---

## Design Philosophy

Neo-brutalism is characterized by:
- **Bold, uncompromising borders** - Every container has a thick (2px) solid black border
- **Hard, sharp shadows** - No blur, pure offset + color (3px 3px 0px black)
- **High contrast** - Warm, saturated colors with clear hierarchy
- **Minimal corner rounding** - 2px (essentially square, just slightly softened)
- **Bold typography** - Heavy font weights, clear hierarchy
- **Grid backgrounds** - Subtle repeating grid pattern
- **Playful interactions** - Buttons "press in" by moving into their shadow

---

## Color Palette

### Core Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| Main accent | `#FF7A05` | `bg-main`, `text-main` | Primary buttons, active states, selected items, progress bar fill |
| Secondary | `#A1714F` | `bg-secondary` | Secondary elements (rarely used) |
| Main accent dark | `#005247` | `bg-mainAccent` | Overlay backgrounds |

### Status Colors

| Token | Hex | CSS Class | Usage |
|-------|-----|-----------|-------|
| Alert/Error | `#F34257` | `bg-alert` | Budget exceeded, delete actions, error messages |
| Warning | `#FDC045` | `bg-warning` | Budget approaching limit |
| Success | `#009141` | `bg-success` | Budget healthy, successful actions |

### Light Mode

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| Background | `#FFEDD6` | `--bg` | Page background (warm peach) |
| Secondary background | `#FFFFFF` | `--secondaryBg` | Card backgrounds, sidebar |
| Text | `#402E32` | `--text` | Primary text color (dark brown) |
| Border | `#000000` | `--border` | All borders |

### Dark Mode

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| Background | `#322215` | `--darkBg` | Page background (dark brown) |
| Secondary background | `#212121` | `--secondaryBlack` | Card backgrounds |
| Text | `#eeefe9` | `--darkText` | Primary text color (off-white) |
| Border | `#000000` | `--darkBorder` | All borders (stays black) |

### Chart Colors

| Token | CSS Variable | Default Hue |
|-------|-------------|-------------|
| Chart 1 | `--chart-1` | `12, 76%, 61%` (warm red/orange) |
| Chart 2 | `--chart-2` | `173, 58%, 39%` (teal) |
| Chart 3 | `--chart-3` | `197, 37%, 24%` (dark blue) |
| Chart 4 | `--chart-4` | `43, 74%, 66%` (yellow) |
| Chart 5 | `--chart-5` | `27, 87%, 67%` (orange) |

**Dark mode overrides**:
| Chart 1 | `220, 70%, 50%` (blue) |
| Chart 2 | `160, 60%, 45%` (green) |
| Chart 3 | `30, 80%, 55%` (orange) |
| Chart 4 | `280, 65%, 60%` (purple) |
| Chart 5 | `340, 75%, 55%` (pink) |

---

## Typography

### Font Families

| Role | Font | CSS |
|------|------|-----|
| Body/Sans | Geist Sans | `font-sans`, variable weight 100-900 |
| Mono | Geist Mono | `font-mono`, variable weight 100-900 |

**Android equivalent**: Use system sans-serif or bundle equivalent font files.

### Font Weights

| Token | Weight | CSS | Usage |
|-------|--------|-----|-------|
| Base | 500 | `font-base` | Body text, buttons, inputs |
| Heading | 700 | `font-heading` | Card titles, page headings |

### Font Sizes

| Size | CSS | Usage |
|------|-----|-------|
| xs | 12px (`text-xs`) | Badges, supporting text, muted |
| sm | 14px (`text-sm`) | Descriptions, label text |
| base | 16px (`text-base`) | Body text (default) |
| lg | 18px (`text-lg`) | Card titles, input text |
| xl | 20px (`text-xl`) | App title |
| 2xl | 24px (`text-2xl`) | Page title, stats numbers |

---

## Spacing & Sizing

| Token | Value | CSS | Usage |
|-------|-------|-----|-------|
| Container max-width | 1280px | `max-w-7xl` | Page content width |
| Page padding | 16px | `p-4` | Page container padding |
| Card padding | 16px | `p-4` | Card content padding |
| Gap between cards | 16px | `gap-4` | Grid/flex gaps |
| Header height | 64px | `h-16` | Navigation header |
| Button height | 40px | `h-10` | Default button size |
| Input height | 40px | `h-10` | Text input height |

---

## Borders

### Border Properties

| Property | Value | CSS |
|----------|-------|-----|
| Border width | 2px | `border-2` |
| Border style | solid | (default) |
| Border color (light) | `#000000` | `border-border` |
| Border color (dark) | `#000000` | `border-darkBorder` |
| Border radius | 2px | `rounded-base` |

### Border Usage

- **All cards**: `border-2 border-border`
- **All inputs**: `border-2 border-border`
- **All buttons**: `border-2 border-border`
- **Progress bar**: `border-2 border-border`
- **Badges**: `border-2 border-border`
- **Dialogs**: `border-2 border-border`
- **Header bottom**: `border-b-2`
- **Dividers**: `divide-y-2` (sometimes `border-dotted`)

---

## Shadows

### Shadow Properties

| Token | CSS | Values |
|-------|-----|--------|
| Light shadow | `shadow-light` | `3px 3px 0px 0px #000` |
| Dark shadow | `shadow-dark` | `3px 3px 0px 0px #000` |

### Shadow Behavior (Buttons)

Buttons have a distinctive "press" animation:
- **Default state**: Button shown with shadow offset
- **Hover state**: Button translates right 3px, down 3px (`hover:translate-x-boxShadowX hover:translate-y-boxShadowY`)
- **Hover state (shadow)**: Shadow disappears (`hover:shadow-none`)
- **Net effect**: Button appears to "press into" the page

Translation tokens:
- `translate-boxShadowX`: `3px`
- `translate-boxShadowY`: `3px`
- `translate-reverseBoxShadowX`: `-3px`
- `translate-reverseBoxShadowY`: `-3px`

### Shadow Usage

- `default` buttons: shadow + press animation
- `neutral` buttons: shadow + press animation
- `noShadow` buttons: border only, no shadow
- `reverse` buttons: no shadow normally, shadow appears on hover (reverse animation)
- `ghost` buttons: transparent, no shadow, border appears on hover
- Cards: no shadow (border-2 provides visual weight)
- Dialogs: shadow-light

---

## Grid Background

### Pattern

```
background-size: 70px 70px;
background-image:
  linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px);
```

**Dark mode**:
```
background-image:
  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
```

### Android Implementation

```kotlin
@Composable
fun GridBackground(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier.fillMaxSize()) {
        val gridSize = 70.dp.toPx()
        val gridColor = if (isSystemInDarkTheme()) {
            Color.White.copy(alpha = 0.1f)
        } else {
            Color.Black.copy(alpha = 0.1f)
        }
        val strokeWidth = 1.dp.toPx()

        var x = 0f
        while (x < size.width) {
            drawLine(gridColor, Offset(x, 0f), Offset(x, size.height), strokeWidth)
            x += gridSize
        }
        var y = 0f
        while (y < size.height) {
            drawLine(gridColor, Offset(0f, y), Offset(size.width, y), strokeWidth)
            y += gridSize
        }
    }
}
```

---

## Focus & Interaction States

### Focus Ring
- `focus-visible:outline-none`
- `focus-visible:ring-2`
- `focus-visible:ring-black`
- `focus-visible:ring-offset-2`
- `focus-visible:ring-offset-white`

### Hover States
- Buttons: translate + shadow change (see above)
- Table rows: subtle background change
- Navigation links: underline animation (width 0 → 100% with 150ms transition)
- Sidebar items: `bg-main` when active, hover background otherwise

### Disabled States
- `opacity-50`
- `pointer-events-none`

### Loading States
- Button: text changes to "Logging in...", "Exporting...", etc.
- Data areas: no dedicated skeleton/spinner for main content
- Dialog buttons: loading text

---

## Dialog Styling

### Overlay
- Background: `rgba(0,0,0,0.8)` (`bg-overlay`)
- Fills entire viewport
- Click to dismiss

### Dialog Card
- `bg-white dark:bg-secondaryBlack`
- `border-2 border-border`
- `shadow-light` (3px 3px 0px #000)
- `rounded-base` (2px)
- Max width: 425px (sm breakpoint)
- Padding: 24px (`p-6`)

---

## Empty States

### No Budget Set
```
┌─────────────────────────────────────────┐
│  (dashed border, yellow background)     │
│  ┌─────────────────────────────────┐    │
│  │  "No Budget Set" (font-bold)    │    │
│  │  "Please set a budget to       │    │
│  │   start tracking your spending."│    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```
Style: `border-2 border-black border-dashed bg-yellow-200 dark:bg-yellow-900/20`

### No Transactions
- Table shows: "No results." centered in a single cell spanning all columns
- No special styling

### No Categories/Accounts
- List is empty, "Add" form is available below

---

## Android Compose Theme Structure

```kotlin
// Color.kt
object FinColors {
    // Light theme
    val LightMain = Color(0xFFFF7A05)
    val LightBg = Color(0xFFFFEDD6)
    val LightSecondaryBg = Color(0xFFFFFFFF)
    val LightText = Color(0xFF402E32)
    val LightBorder = Color(0xFF000000)
    val LightOverlay = Color(0xCC000000) // rgba(0,0,0,0.8)

    val Alert = Color(0xFFF34257)
    val Warning = Color(0xFFFDC045)
    val Success = Color(0xFF009141)

    // Dark theme
    val DarkBg = Color(0xFF322215)
    val DarkSecondaryBg = Color(0xFF212121)
    val DarkText = Color(0xFFEEEFE9)
    val DarkBorder = Color(0xFF000000)

    // Chart colors
    val ChartColors = listOf(
        Color(0xFFF28B82), // --chart-1
        Color(0xFF81C995), // --chart-2
        Color(0xFF8AB4F8), // --chart-3
        Color(0xFFFDD663), // --chart-4
        Color(0xFFFFB74D), // --chart-5
    )
}

// Type.kt
object FinTypography {
    val Heading = TextStyle(fontWeight = FontWeight.Bold, fontSize = 18.sp)
    val Title = TextStyle(fontWeight = FontWeight.Bold, fontSize = 24.sp)
    val Body = TextStyle(fontWeight = FontWeight.Medium, fontSize = 16.sp)
    val Label = TextStyle(fontWeight = FontWeight.Medium, fontSize = 14.sp)
    val Badge = TextStyle(fontWeight = FontWeight.Medium, fontSize = 12.sp)
}

// Shape.kt
object FinShapes {
    val Base = RoundedCornerShape(2.dp)
    val Circle = CircleShape
}

// Theme.kt
@Composable
fun FinMasterTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) darkColorScheme(...) else lightColorScheme(...)
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(bodyLarge = FinTypography.Body, ...),
        shapes = Shapes(small = FinShapes.Base, medium = FinShapes.Base, large = FinShapes.Base),
        content = content
    )
}
```
