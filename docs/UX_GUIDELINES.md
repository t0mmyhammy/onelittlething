# UX Guidelines

## Design System

### Type Scale
```
H1: 32px / 2rem - font-serif - Page titles
H2: 24px / 1.5rem - font-serif - Section headers
H3: 20px / 1.25rem - font-semibold - Subsection headers
Body: 16px / 1rem - font-sans - Main text
Small: 14px / 0.875rem - font-sans - Supporting text
Tiny: 12px / 0.75rem - font-sans - Labels and metadata
```

### Spacing Scale
```
4px  - xs   - Tight inline spacing
8px  - sm   - Icon gaps, chip padding
12px - base - Card padding, form spacing
16px - md   - Section padding
24px - lg   - Between major sections
32px - xl   - Page margins
48px - 2xl  - Major breaks
```

### Color Palette
```
Sage: #8B9D83 - Primary actions, active states
Rose: #D4A5A5 - Child-focused features, highlights
Sand: #F5E6D3 - Borders, subtle backgrounds
Cream: #FBF7F0 - Page background
Amber: #F59E0B - Warnings, incomplete states
Gray scale: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
```

### Border Radius
```
Small: 8px - Chips, small buttons
Base: 12px - Form inputs, cards
Large: 16px - Major cards, modals
XL: 24px - Hero sections
```

### Shadows
```
sm: 0 1px 2px rgba(0,0,0,0.05) - Subtle lift
base: 0 1px 3px rgba(0,0,0,0.1) - Cards
md: 0 4px 6px rgba(0,0,0,0.1) - Hover states
lg: 0 10px 15px rgba(0,0,0,0.1) - Modals
```

## Components

### Buttons

**Primary**
```tsx
<button className="px-4 py-2.5 bg-sage text-white rounded-xl font-medium hover:bg-sage/90 transition-colors shadow-sm">
  Save
</button>
```

**Secondary**
```tsx
<button className="px-4 py-2.5 border border-sand text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
  Cancel
</button>
```

**Icon Button**
```tsx
<button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center">
  <Icon className="w-5 h-5" />
</button>
```

### Cards

**Standard Card**
```tsx
<div className="bg-white rounded-2xl shadow-sm border border-sand p-4 hover:shadow-md transition-shadow cursor-pointer">
  {/* Content */}
</div>
```

**Whole card should be tappable** - wrap in button or add onClick to div with proper keyboard handling.

### Chips

**Status Chip**
```tsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sage/10 text-sage text-sm font-medium">
  Active
</span>
```

**Size Chip**
```tsx
<span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
  4T
</span>
```

### Loading States

**Progress Ring**
```tsx
<div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-sage animate-spin" />
```

**Success Check Morph**
```tsx
// Rotate spinner out, morph to checkmark with scale animation
<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
  <Check className="w-6 h-6 text-green-600" />
</div>
```

**Skeleton Loader**
```tsx
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

### AI Button

**Wand Icon in Soft Circle**
```tsx
<button className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors">
  <Wand2 className="w-4 h-4" />
  Get AI Ideas
</button>
```

Add tooltip: "Get ideas with AI"

### Toasts

**Autosave Success**
```tsx
<div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-xl p-4 flex items-center gap-3 border border-sand animate-slide-up">
  <Check className="w-5 h-5 text-green-600" />
  <span className="text-sm font-medium">Saved</span>
</div>
```

**Undo Toast**
```tsx
<div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-xl p-4 flex items-center gap-3 border border-sand">
  <span className="text-sm">Changes saved</span>
  <button className="text-sage font-medium hover:underline">Undo</button>
</div>
```

Disappear after 10 seconds.

### Empty States

**Illustration + Message + Action**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="w-16 h-16 text-gray-300 mb-4" />
  <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
  <p className="text-gray-600 mb-6">Start by adding your first item</p>
  <button className="px-4 py-2 bg-sage text-white rounded-xl font-medium">
    Add Item
  </button>
</div>
```

## Motion and Timing

### Transitions
```
Fast: 150ms - Hover states, button presses
Base: 200ms - Most transitions
Slow: 300ms - Modals, slides, complex animations
```

### Easing
```
ease-in-out - Default for most transitions
ease-out - Entering animations
ease-in - Exiting animations
```

### Animations
- Keep animations subtle and purposeful
- Prefer transforms over position changes (better performance)
- Use scale, opacity, and translateY for most needs
- Avoid overly bouncy or spring effects - keep it calm

## Copy Patterns

### AI Features
- **Human and practical**: "Let's find some warm rain gear for daycare"
- **Optional facts during wait**: "Most 4T tops fit for about six months"
- **Use saved context**: "Based on Emma's sizes..."

### Errors
- **Clear and actionable**: "We couldn't save that. Check your connection and try again."
- **Avoid blame**: ~~"You entered invalid data"~~ → "That field needs a valid email address"
- **Offer solutions**: "Link expired. Ask the sender for a fresh link."

### Confirmations
- **Destructive actions**: "Delete this moment? You can't undo this."
- **Revoke shares**: "Revoke access? The link will stop working immediately."
- **Use verb buttons**: "Delete" / "Keep" instead of "Yes" / "No"

### Success
- **Brief and friendly**: "Guide shared!"
- **Don't interrupt**: Toast, not modal
- **Include next step if helpful**: "Link copied. Send it to your sitter!"

## Accessibility

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order follows visual order
- Focus rings visible and clear (2px sage outline)
- Modal traps focus, Escape to close

### Screen Readers
- Use semantic HTML (nav, main, article, etc.)
- ARIA labels on icon buttons
- ARIA live regions for toasts and dynamic content
- Tab components use proper ARIA (tablist, tab, tabpanel)

### Contrast
- Text on background: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum

### Touch Targets
- Minimum 44x44px for all tappable elements
- Adequate spacing between adjacent targets
- Whole card tappable, not just small buttons inside

## Forms and Input

### Autosave Pattern
1. User makes change
2. Debounce 1 second
3. Save to database
4. Show brief "Saved" toast with check icon
5. Offer "Undo" for 10 seconds

### Validation
- Inline validation on blur or after typing stops
- Show errors below field with red text and icon
- Don't block submission if non-critical fields incomplete
- Clear errors when user starts typing again

### Field-Level Privacy
```tsx
<div className="flex items-center justify-between">
  <label>Field Name</label>
  <button onClick={toggleRedaction}>
    {isRedacted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
</div>
```

Eye-off = hidden from shares. Make this obvious with tooltip.
