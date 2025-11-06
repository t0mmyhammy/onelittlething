# Project Instructions for Claude Code

## Troubleshooting Methodology

When debugging, fixing bugs, or implementing features, ALWAYS follow the principles outlined in `firstprinciples.md`.

Key principles to follow:
- **STOP. THINK. UNDERSTAND. THEN ACT.**
- Understand the problem before writing any code
- Identify root causes, not symptoms
- Design complete solutions that consider all constraints
- Test thoroughly across all environments
- Avoid quick fixes that create technical debt

Refer to `firstprinciples.md` for the complete framework, including:
- The 6-step troubleshooting framework
- Common anti-patterns to avoid
- Decision-making guidelines
- Deployment checklist
- Questions to ask before every fix

## Project Context

This appears to be a scraping/data collection project with:
- Backend (Python)
- Database (SQLite local, PostgreSQL production)
- Deployment (Railway/Vercel)
- Multiple environments to consider

Always verify assumptions and test changes in all relevant environments before deploying.
