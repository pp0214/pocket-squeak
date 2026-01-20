# Pocket Squeak - UI/UX Design Brief

## App Overview
**Pet health tracker** for small exotic pets (rats, hamsters, guinea pigs, gerbils, mice). Target: Pet-loving millennials/Gen Z who want quick, delightful daily health logging.

## Brand Identity
**Personality:** Warm, Playful, Clean, Trustworthy
**Primary Color:** Orange #ed7a11 (warmth & energy)

## Color System
```
Primary: #ed7a11 (main), #fef7ee (light bg), #b84609 (dark)
Safe: #22c55e (green)
Caution: #eab308 (yellow)  
Danger: #ef4444 (red)
Neutral: #f9fafb (bg) → #111827 (text)
```

## Typography
- System fonts (SF Pro / Roboto)
- Headings: Bold 600-700
- Body: Regular 400
- Sizes: 12px (caption) → 36px+ (hero numbers)

## Design Tokens
- Border radius: 8px (chips), 12px (buttons), 16px (cards), 24px (avatars)
- Spacing: 8px / 16px / 24px
- Shadow: Subtle drop shadow

## Key Screens

### 1. Home (Pet Dashboard)
- Pet cards with: avatar (emoji/photo), name, species badge, weight + trend indicator
- Weight trend: red (>5% loss), green (>5% gain), gray (stable)
- FAB for adding pets
- Swipe-to-delete gesture

### 2. Pet Detail
- Hero header with pet info
- Weight stepper: -10, -1, [value], +1, +10 buttons
- Health observation tags (Normal✅, Sneeze🤧, Porphyrin👁️, Soft Stool💩, Lethargic😴)
- Weight trend line chart (orange)
- History timeline

### 3. Add/Edit Pet Modal
- Circular photo picker
- Species pills with emoji (🐀🐹🐭)
- Gender toggle (Male/Female/Unknown)
- Date input for birthday

### 4. Settings
- Grouped list with icons
- Language switcher
- Notification toggles
- Export/Backup options

## Animation Guidelines
- **Entrance:** FadeInDown with stagger (100ms delay per item)
- **Buttons:** Scale 0.95 on press, spring return
- **Cards:** Subtle shadow + scale on touch
- **Haptics:** Light impact on interactions
- **Loading:** Skeleton shimmer effect

## Component Specs

**Button variants:** primary (orange), secondary (gray), danger (red), ghost
**Card:** White bg, rounded-2xl, subtle shadow, optional colored border
**Input:** Gray-100 bg, rounded-xl, label above
**Tag/Chip:** Semantic colors (green/yellow/red), removable variant
**Avatar:** Sizes 32/48/64/96px, image or emoji fallback

## Optimization Priorities
1. Add micro-interactions (make every tap feel responsive)
2. Skeleton loading states
3. Animated weight number changes
4. Custom empty state illustrations (happy pets)
5. Clear health alert visual distinction
6. Dark mode support

## Deliverables Needed
1. Complete component library
2. All screen designs with states
3. Animation specifications
4. Dark mode variants
5. Design tokens for dev handoff

## Key UX Goals
- Recording health should feel **quick and satisfying**
- App should spark **joy** when opened
- Alerts should be **informative, not alarming**
- Overall experience: **caring companion** for pet parents
