# OneLittleThing: Product Overview

## Vision

Help parents capture small moments, organize practical info, and share what caregivers need with confidence. Calm, human, private by default.

## Information Architecture

### Capture
- **Home**: Daily anchor, quick add moment, progress tile, pregnancy tile when relevant
- **Timeline**: Rolling 7 days or X entries with "View more", filters by child and type
- **Add Moment**: Text, photo, tags, child selector, voice input (later)

### Organize
- **Sizes and Ideas**: Subtabs for Sizes, Ideas, Wishlist. AI tab first for Ideas, manual second
- **Care Guides**: Child tabs and Family tab. Sections: routines, health, comfort, safety, contacts

### Share and Support
- **Share Links**: Active links dashboard, revoke, access logs
- **Chat with Liv**: AI assistant with shortcuts. Examples:
  - "Suggest winter outfits"
  - "Draft babysitter pack"

### Account
- Profile and Family settings, children management, invitations

## Core Journeys

### Capture a moment
Open Home, tap "What moment do you want to remember", save, see it appear in Timeline.

### Get ideas with AI then add to list
Ideas tab opens on AI mode. Enter "warm rain gear for daycare." Results show cards with title, size chip, one line rationale, "Add to Ideas."

### Create a babysitter guide and share
In Care Guides, "Create Guide", choose Babysitter Pack, preview, inline edits, Save, Share link with optional passcode and expiry.

### Track sizes and prepare to buy
Sizes shows Current and Next for each category. Tap card to edit. Tap heart to "Add to Wishlist."

## UX Principles

- **Mobile first**, single column, big tap targets
- **Autosave** with a subtle "Saved" check, allow Undo within 10 seconds
- **Calm typography**, small hierarchy shifts, clear labels
- **Every action gives feedback**: loading, success, error, empty
- **Privacy cues** and redaction at field level
- **Accessibility**: tab order, ARIA on tabs and modals, contrast targets

## Acceptance Checks

- [ ] I can capture a moment from Home in two taps and see it in Timeline
- [ ] I can open Ideas in AI mode, save two cards, and see them in my list without leaving the page
- [ ] I can create a Babysitter Pack, preview exactly what will be shared, and generate a passcode link that expires
- [ ] I can revoke a link and see a clear viewer notice
- [ ] Autosave works on every form section and I can undo within 10 seconds

## Tone and Copy Patterns

### AI Features
- Human and practical. Avoid technical terms
- Optional facts if wait is long: "Most 4T tops fit for about six months"
- Use saved sizes and child context to tune results

### Errors and Confirmations
- Clear, actionable error messages
- Confirmations before destructive actions
- Success feedback that doesn't interrupt flow
