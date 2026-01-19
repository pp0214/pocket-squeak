# Pocket Squeak - UI/UX Design Optimization Prompt for Google Stitch

## 🎯 App Overview

**App Name:** Pocket Squeak  
**Platform:** iOS & Android (React Native / Expo)  
**Category:** Pet Health Tracking  
**Target Users:** Owners of small exotic pets (rats, hamsters, guinea pigs, gerbils, mice)  
**Core Value:** Simple, delightful daily health tracking for beloved small furry companions

### User Persona
- Age: 18-45, primarily millennials and Gen Z
- Tech-savvy pet enthusiasts
- Value both functionality and aesthetics
- Use the app daily for quick health logging
- Emotionally attached to their pets, want a warm, caring app experience

---

## 🎨 Current Design System

### Brand Colors

```
Primary (Orange - Warmth & Energy):
  50:  #fef7ee (Lightest - Backgrounds)
  100: #fdedd3 (Light - Hover states)
  200: #fad7a5 (Subtle accents)
  300: #f6bc6d (Medium accents)
  400: #f19633 (Active states)
  500: #ed7a11 (Primary brand color - CTAs, highlights)
  600: #de5f07 (Pressed states)
  700: #b84609 (Dark accents)
  800: #92380f (Very dark)
  900: #76300f (Darkest)

Semantic Colors:
  Safe:    #22c55e (Green - Healthy status)
  Caution: #eab308 (Yellow - Warning)
  Danger:  #ef4444 (Red - Critical alerts)

Neutral (Gray scale for UI):
  50:  #f9fafb (Background)
  100: #f3f4f6 (Cards, inputs)
  200: #e5e7eb (Borders)
  300: #d1d5db (Disabled)
  400: #9ca3af (Placeholder text)
  500: #6b7280 (Secondary text)
  600: #4b5563 (Body text)
  700: #374151 (Headings)
  800: #1f2937 (Dark headings)
  900: #111827 (Darkest text)
```

### Typography

- **Font Family:** System default (San Francisco on iOS, Roboto on Android)
- **Headings:** Bold weight (600-700)
- **Body:** Regular weight (400)
- **Labels:** Medium weight (500)

**Size Scale:**
- xs: 12px (Captions, badges)
- sm: 14px (Secondary text, labels)
- base: 16px (Body text)
- lg: 18px (Card titles)
- xl: 20px (Section headers)
- 2xl: 24px (Page titles)
- 4xl+: 36px+ (Hero numbers, weights)

### Spacing & Layout

- **Border Radius:**
  - Small: 8px (chips, badges)
  - Medium: 12px (buttons, inputs)
  - Large: 16px (cards)
  - XL: 24px (large cards, avatars)
  - Full: 9999px (pills, circular avatars)

- **Padding:**
  - Compact: 8px
  - Default: 16px
  - Spacious: 24px

- **Card Shadow:** Subtle drop shadow (sm level)

### Iconography

- **Icon Library:** FontAwesome + Custom Emoji
- **Pet Species Emojis:** 🐀 (rat), 🐹 (guinea pig/hamster), 🐭 (gerbil/mouse)
- **Feature Icons:** Standard FontAwesome (paw, plus, book, cog, chart, etc.)

---

## 📱 Screen-by-Screen Design Specifications

### 1. Home Screen (Pet Dashboard)

**Current State:**
- FlatList of PetCard components
- Floating Action Button (FAB) for adding pets
- Pull-to-refresh functionality
- Subtle gradient background (primary-50 to gray-50)

**Components:**
- **PetCard:** Displays pet avatar (emoji or photo), name, species badge, age, weight with trend indicator
- **Weight Trend Badge:** Color-coded (red for >5% loss, green for >5% gain, gray for stable)
- **Swipe-to-delete:** Right swipe reveals red delete button
- **Long-press:** Shows action sheet for deletion

**Animations:**
- FadeInDown with staggered delay per card
- FAB scale-in with spring animation
- Pull-to-refresh spinner

**Optimization Goals:**
- Add micro-interactions on card press
- Improve visual hierarchy between pets
- Consider card grouping by health status
- Add skeleton loading states
- Enhance empty state illustration

---

### 2. Pet Detail Screen

**Current State:**
- Scrollable detail view with multiple cards
- Pet info header with avatar, name, species, age
- "Today's Record" editable section
- Weight chart (line chart with bezier curve)
- History timeline

**Components:**
- **Pet Info Card:** Centered layout with emoji avatar, stats below
- **WeightStepper:** -10, -1, [value], +1, +10 buttons with central display
- **ObservationInput:** Preset tags (Normal ✅, Sneeze 🤧, etc.) + custom notes
- **Weight Chart:** Orange line chart with dot markers
- **History List:** Timeline-style with date headers, weight, and observation chips

**Animations:**
- Refresh control with branded color
- Chart render animation (if supported)

**Optimization Goals:**
- Add hero header with parallax effect on scroll
- Animate weight change numbers
- Add haptic feedback patterns for weight stepping
- Consider bottom sheet for quick editing
- Add photo carousel if pet has multiple photos

---

### 3. Add/Edit Pet Modal

**Current State:**
- Form with photo picker, name input, species selector, gender selector, birthday input
- Species selection as horizontal pill buttons with emoji
- Gender as three equal-width buttons

**Components:**
- **Photo Picker:** Circular touch target with camera icon
- **Input Fields:** Rounded rectangle with label above
- **Selection Buttons:** Pill-shaped, toggle state with primary color

**Optimization Goals:**
- Add image crop/zoom preview
- Animate form field focus states
- Add date picker instead of text input
- Consider step-by-step wizard for new users
- Add species-specific illustrations

---

### 4. Record Screen (Quick Record)

**Current State:**
- List of pets with chevron navigation
- Simple card layout per pet
- Navigates to recorder modal

**Optimization Goals:**
- Add inline quick-record option
- Show last recorded date/time
- Add visual indicator for pets needing attention
- Consider swipe gestures for common actions

---

### 5. Wiki Screen (Food Safety)

**Current State:**
- Search bar at top
- Legend for safety levels (✅ Safe, ⚠️ Caution, ❌ Danger)
- Cards with colored left border indicating safety
- Category and notes display

**Optimization Goals:**
- Add category filters/tabs
- Improve card visual distinction by safety level
- Add expandable details
- Consider grid layout for browsing
- Add "favorites" functionality

---

### 6. Settings Screen

**Current State:**
- Grouped settings with icons
- Language selector with alert dialog
- Navigation to export/backup modals

**Optimization Goals:**
- Add toggle animations
- Improve section visual separation
- Add user avatar/profile section
- Consider in-line controls vs navigation

---

## ✨ Animation & Motion Design

### Current Animations

1. **Page Transitions:**
   - Modal: iOS-style slide-up presentation
   - Push: Standard horizontal slide

2. **List Animations:**
   - FadeInDown with staggered delay (100ms per item)
   - Spring-based physics (damping: 12)

3. **Empty State:**
   - Scale-in with spring
   - Continuous bounce loop (translateY: 0 → -8 → 0)
   - Sequential fade-in for text and button

4. **Interactive Feedback:**
   - Haptic feedback (Light impact) on button press
   - Active opacity reduction (0.8) on touchables

### Desired Animation Enhancements

1. **Micro-interactions:**
   - Button press: Scale down slightly (0.95) with spring return
   - Card press: Subtle shadow increase + slight scale
   - Toggle switches: Smooth slide with bounce
   - Success states: Checkmark draw animation

2. **Data Visualization:**
   - Weight number: Count-up animation on change
   - Chart: Line draw animation on appear
   - Progress indicators: Smooth fill animations

3. **Gestures:**
   - Swipe delete: Smooth spring-based reveal
   - Pull-to-refresh: Branded loading animation (bouncing pet emoji?)
   - Long-press: Scale feedback before action sheet

4. **Page Transitions:**
   - Shared element transitions for pet cards → detail
   - Modal dismiss with velocity-based gesture

5. **Loading States:**
   - Skeleton shimmer effect for cards
   - Pulsing placeholders for avatars
   - Spinner with brand color gradient

---

## 🎭 Design Personality & Tone

### Visual Personality
- **Warm:** Orange primary color evokes warmth, care, and energy
- **Playful:** Emoji usage, rounded corners, bouncy animations
- **Clean:** Generous whitespace, clear hierarchy
- **Trustworthy:** Consistent patterns, reliable feedback

### Emotional Goals
- Users should feel **joy** when opening the app
- Recording health should feel **quick and satisfying**
- Health alerts should feel **informative, not alarming**
- The app should feel like a **caring companion** in pet parenthood

### Brand Voice in UI
- Friendly, conversational labels ("Add Your First Pet", "Quick Record")
- Encouraging empty states
- Celebratory success feedback
- Gentle, supportive error messages

---

## 🚀 Optimization Priorities

### High Priority
1. **Improved Empty States:** Custom illustrations showing happy pets
2. **Loading Skeletons:** Reduce perceived loading time
3. **Micro-interactions:** Make every tap feel responsive
4. **Weight Visualization:** Animated number changes, better chart
5. **Health Status Clarity:** Clear visual distinction for alerts

### Medium Priority
1. **Onboarding Flow:** First-time user experience
2. **Gesture Enhancements:** More intuitive swipe actions
3. **Photo Experience:** Better preview, edit, and display
4. **Dark Mode:** Full dark theme support
5. **Accessibility:** VoiceOver labels, contrast improvements

### Nice to Have
1. **Widget Preview:** Show widget designs in settings
2. **Achievements/Streaks:** Gamification elements
3. **Seasonal Themes:** Holiday-themed accents
4. **Pet Mood Indicators:** Visual mood representation

---

## 📐 Component Library Requirements

### Core Components Needed

1. **Avatar**
   - Sizes: sm (32px), md (48px), lg (64px), xl (96px)
   - Variants: image, emoji, initials
   - States: default, selected, alert badge

2. **Card**
   - Variants: default, interactive, highlighted, alert
   - With optional: header, footer, actions

3. **Button**
   - Variants: primary, secondary, danger, ghost, icon-only
   - Sizes: sm, md, lg
   - States: default, pressed, disabled, loading

4. **Input**
   - Variants: text, number, date, search
   - States: default, focused, error, disabled
   - With optional: label, helper text, icon

5. **Tag/Chip**
   - Variants: default, selected, removable
   - Colors: semantic (green, yellow, red) + primary

6. **Toggle/Switch**
   - Animated on/off state
   - With optional label

7. **Progress/Chart**
   - Line chart for weight trends
   - Progress bar for goals (future)

8. **Bottom Sheet**
   - Draggable with snap points
   - With optional header and handle

9. **Alert/Toast**
   - Variants: success, warning, error, info
   - Auto-dismiss with progress

10. **Skeleton**
    - Shape variants: text, circle, rectangle
    - Shimmer animation

---

## 🖼️ Illustration & Imagery Guidelines

### Pet Illustrations
- Style: Cute, slightly stylized, not too cartoonish
- Mood: Happy, healthy, playful
- Use cases: Empty states, onboarding, achievements

### Icon Style
- Consistent stroke width
- Rounded corners to match UI
- Consider custom pet-related icons

### Photo Treatment
- Circular crop for avatars
- Subtle border or shadow
- Placeholder with species emoji

---

## 📱 Platform-Specific Considerations

### iOS
- Respect safe areas
- Native-feeling modals (slide up, swipe to dismiss)
- SF Symbols compatibility
- Haptic feedback patterns

### Android
- Material-inspired elevation
- Ripple effect on touches
- System navigation respect
- Different status bar handling

---

## 🎨 Deliverables Expected

1. **Complete Color Palette** with accessibility-checked contrast ratios
2. **Typography Scale** with line heights and letter spacing
3. **Component Library** in Figma/design tool format
4. **Animation Specifications** with timing curves and durations
5. **Screen Designs** for all major flows
6. **Interaction Prototypes** demonstrating key animations
7. **Dark Mode Variants** for all screens
8. **Responsive Layouts** for different device sizes
9. **Design Tokens** exportable for code implementation
10. **Asset Export Guidelines** for icons and illustrations

---

## 📋 Summary

**Pocket Squeak** is a pet health tracking app that needs to feel **warm, playful, and trustworthy**. The design should make daily health recording feel **quick, satisfying, and even joyful**. 

Key focus areas:
- **Enhance micro-interactions** to make the app feel alive
- **Improve visual hierarchy** for faster scanning
- **Add delight** through animations and illustrations
- **Maintain simplicity** - don't overcomplicate the core flow
- **Ensure accessibility** for all users

The orange primary color is central to the brand identity. All enhancements should feel cohesive with this warm, energetic palette while introducing subtle variety through the semantic color system (green for healthy, yellow for caution, red for alerts).

The target is a **premium mobile experience** that pet owners will love using every day.
