# Changelog

All notable changes to OneLittleThing will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.9.0] - 2025-11-17

### Added - Names Module & Weekly Highlights

#### Names Feature Enhancements
- **Family Fit Spotlight**: Drag-and-drop zone to preview names with full family context
  - Shows "Tom, Natalia, Parker and [Name] Hamilton" format
  - Parent names editor stored in user preferences
  - Children names and last name integration
  - Drag any name card to see how it fits with the family
- **AI Notes Backfill**: One-time automatic backfill of AI insights into name card notes
  - Generates formatted notes for names with enhancements but missing insights
  - Uses AI to create meaningful summaries of name research
  - Future enhancements auto-save notes when "Enhance All Names" or "Add AI Insight" is clicked
- **Name Comparison Table**: Improved text wrapping with fixed column widths
  - Name column: 150px, other columns: 200-300px (about 2x name width)
  - Added break-words and leading-relaxed for better readability
  - Fixed horizontal scroll issues with wrapped content

#### Weekly Highlights Feature
- **AI-Powered Timeline Summary**: Generate weekly highlights from dashboard
  - Analyzes past week's timeline entries
  - Creates per-child highlight sections (e.g., "Parker's Week", "Natalia's Week")
  - Generates combined family summary that weaves together both kids' moments
  - References specific entry titles and details (e.g., "like when..." or "from [entry title] to...")
  - Provides 2-3 thoughtful reflection questions to inspire presence and mindfulness
  - Copy to clipboard functionality with formatted text
  - Beautiful modal UI with gradient backgrounds for each child section
- Located in "All Moments" section header on dashboard

#### Pregnancy UI Improvements
- **Enhanced Term Modal**: Improved pregnancy term information display
  - Added introductory context paragraph
  - Visual icons for each term stage (🍼 preterm, 👶 early term, 💚 full term, 📅 late term)
  - Modern left-border design with better spacing
  - Larger, bolder headings for improved hierarchy
  - Added disclaimer footer about pregnancy uniqueness
  - Better readability with increased padding and clearer typography

### API Endpoints Added
- `/api/generate-weekly-highlights` - AI-powered weekly timeline summary with per-child sections

### Database Migrations
- `20251117130000_add_parent_names_to_user_preferences.sql` - Parent names storage for family fit display

### Components Added
- `WeeklyHighlights.tsx` - Weekly highlights modal with AI summary and copy functionality
- `FamilyFitSpotlight.tsx` - Drag-and-drop zone for family name preview

### Components Modified
- `NameBoardView.tsx` - Added AI notes backfill, drag-and-drop context, family fit spotlight
- `NameCard.tsx` - Made draggable using @dnd-kit
- `NameComparisonTable.tsx` - Fixed column widths for text wrapping
- `EntriesSection.tsx` - Added Weekly Highlights button
- `BabyCountdownCard.tsx` - Improved pregnancy term modal formatting

### Technical Details
- Uses OpenAI GPT-4o-mini for weekly highlights generation
- Integrated @dnd-kit library for drag-and-drop functionality
- One-time effect execution with useRef for backfill operations
- Clipboard API for copy functionality

### Fixed
- Pregnancy term modal now renders with proper spacing and visual hierarchy
- Name comparison table columns now wrap text properly instead of elongating
- Weekly highlights API uses correct `entries` table (not `timeline_entries`)
- Simplified entry query to avoid relationship query issues (deferred fix)

---

## [1.8.0] - 2025-11-13

### Added - Organize Section Expansion

#### Reminders Feature
- Created reminders table with family sharing capabilities
- Reminders page with card-based UI
- Share reminders to specific family members or "Everyone"
- Mark reminders as complete
- Import reminders from natural language text via AI
- Sort reminders by due date with overdue highlighting

#### Pack Lists Feature
- Reusable pack lists for trips and events
- Pack list templates library with 4 starter templates:
  - Hospital Bags (3-5 lists based on family context)
  - Road Trip Essentials
  - Beach Vacation
  - Camping Trip
- AI-powered pack list generation from prompts
- Import pack lists from formatted text
- Manual pack list creation
- Category-based organization within each list
- Archive/unarchive functionality
- Duplicate existing pack lists
- Templates button in Pack Lists page (wrench icon)
- Context-aware hospital bags (shows extra lists for families with older children)

#### Ready for Baby Feature
- Comprehensive pregnancy preparation hub
- Appears in nav when due date is within 9 months
- Four main sections:
  - The Essentials (medical, car seat, hospital prep)
  - Family & Home (nesting, cleaning, sibling prep)
  - Money & Admin (insurance, legal, childcare)
  - Emotional & Community (self-care, support systems)
- Name Ideas section with:
  - Gender tags (F/M/N)
  - AI name enhancement (meaning, origin, popularity, sibling compatibility)
  - Family reactions with heart icon
  - Collaborative comments
- Task recommendations for each section (150+ tasks)
- Context-aware recommendations (first baby vs. second+ baby)
- Auto-generate hospital bag pack lists from task
- Collapsible sections with progress tracking
- Hide/show completed tasks toggle

### API Endpoints Added
- `/api/import-reminders` - Parse natural language into reminders
- `/api/generate-pack-list` - AI pack list generation
- `/api/parse-pack-list` - Parse text into pack list structure
- `/api/import-pack-list-items` - Bulk import pack list items
- `/api/generate-hospital-bags` - Generate pack lists from templates
- `/api/enhance-baby-name` - AI name information enhancement

### Database Migrations
- `20251113000004_create_pack_lists.sql` - Pack lists, categories, and items tables
- `20251113000005_add_reminders_table.sql` - Reminders with family sharing
- `20251113000006_add_baby_prep_tables.sql` - Baby prep lists, tasks, name ideas, and comments

### Fixed
- Users without family_id now redirect to dashboard (auto-creates family)
- Added error handling for null babyPrepList state
- Added comprehensive server-side logging for debugging
- Fixed UUID validation errors in all main pages
- Graceful handling of missing family membership

### Components Added
- `ReminderCard.tsx` - Reminder display and interaction
- `PackListsView.tsx` - Pack lists management UI
- `PackListTemplatesModal.tsx` - Template browser and generator
- `ReadyForBabyView.tsx` - Pregnancy prep hub
- `RecommendedTasksModal.tsx` - Task recommendations browser
- `CreatePackListModal.tsx` - Manual pack list creation
- `GeneratePackListModal.tsx` - AI pack list generation
- `ImportTextToPackListModal.tsx` - Import from text

### Library Files Added
- `lib/baby-prep-templates.ts` - 150+ recommended pregnancy prep tasks
- `lib/hospital-bag-templates.ts` - Pack list templates for hospital bags and travel

### Documentation
- Updated README.md with new features
- Updated CLAUDE.md with correct project context
- Created NEW_API_ENDPOINTS.md documenting all new APIs
- Created .env.example with required environment variables
- Created CHANGELOG.md (this file)

---

## [1.7.0] - 2025-01-12

### Added
- Product documentation and vision alignment
- Care guide generation with markdown templates
- Share guide copy-to-clipboard functionality
- Pregnancy tracker with week-by-week countdown

---

## [1.6.0] - 2024-12-XX

### Added
- Timeline filtering by child and type
- Voice input for moment capture
- "On This Day" memories feature
- Photo attachments for timeline entries

---

## [1.5.0] - 2024-11-XX

### Added
- Care Info guides (child and family sections)
- Sizes tracking with next-size predictions
- Ideas and wishlist management
- AI parenting coach (Advice page)

---

## [1.0.0] - 2024-XX-XX

### Initial Release
- User authentication with Supabase
- Family creation and management
- Dashboard with quick moment capture
- Timeline journal
- Profile and settings
- Basic child management

---

[1.8.0]: https://github.com/trustedcareers/onelittlething/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/trustedcareers/onelittlething/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/trustedcareers/onelittlething/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/trustedcareers/onelittlething/compare/v1.0.0...v1.5.0
[1.0.0]: https://github.com/trustedcareers/onelittlething/releases/tag/v1.0.0
