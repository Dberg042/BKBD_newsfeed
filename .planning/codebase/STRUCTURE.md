# Codebase Structure

**Analysis Date:** 2026-05-13

## Directory Layout

```
BKBD_newsfeed/
├── index.html          # Main landing page
├── README.md           # Project documentation
├── .planning/          # Planning and analysis documents
│   └── codebase/       # Architecture and structure documentation
└── [GSD tooling]       # .claude/, .gemini/, .github/ directories
    ├── skills/         # Project skills and conventions
    ├── commands/       # GSD command definitions
    ├── hooks/          # Pre-execution hooks
    └── settings/       # Configuration
```

## Directory Purposes

**Project Root:**
- Purpose: Contains all project files and static web content
- Contains: HTML pages, documentation, configuration
- Key files: `index.html`, `README.md`

**.planning/codebase:**
- Purpose: Generated architecture and structure documentation
- Contains: ARCHITECTURE.md, STRUCTURE.md, and other analysis documents
- Key files: This file, ARCHITECTURE.md

**[GSD Directories] (.claude/, .gemini/, .github/):**
- Purpose: Get-Shit-Done workflow tooling and project automation
- Contains: Skills, command definitions, hooks, configuration, workflows
- Note: These are infrastructure; separate from application code

## Key File Locations

**Entry Points:**
- `index.html`: Main landing page - serves as the single application entry point

**Configuration:**
- `README.md`: Project overview and description

**Documentation:**
- `.planning/codebase/ARCHITECTURE.md`: System architecture and design patterns
- `.planning/codebase/STRUCTURE.md`: This file - directory layout and conventions

## Naming Conventions

**Files:**
- HTML files: `index.html` (lowercase, no spaces)
- Documentation: `README.md` (UPPERCASE.md convention)
- Analysis documents: `UPPERCASE.md` (e.g., ARCHITECTURE.md)

**Directories:**
- GSD tooling: Hidden directories (`.claude/`, `.gemini/`, `.github/`)
- Planning: `.planning/` (hidden by convention)
- Documentation: Public root-level files (README.md, index.html)

## Where to Add New Code

**New HTML Pages:**
- Location: Root directory or subdirectories like `pages/` or `templates/`
- Naming: `[page-name].html` (lowercase, hyphenated if multi-word)
- Example: `about.html`, `contact-us.html`

**New Styles (if externalizing):**
- Location: Create `css/` directory
- File: `css/styles.css`
- Link in HTML: `<link rel="stylesheet" href="css/styles.css">`

**New Scripts (if adding JavaScript):**
- Location: Create `js/` directory
- Files: `js/main.js`, `js/utils.js`, etc.
- Script tag: `<script src="js/main.js"></script>`

**Assets (Images, fonts):**
- Location: Create `assets/` directory with subdirectories:
  - `assets/images/`
  - `assets/fonts/`
  - `assets/icons/`

**Build Configuration (if needed later):**
- Location: Root directory
- Files: `package.json`, `vite.config.js`, `webpack.config.js`, etc.

## Special Directories

**.planning/codebase:**
- Purpose: Generated analysis documents
- Generated: Yes (by `/gsd-map-codebase` command)
- Committed: Yes (committed to version control)

**.claude/, .gemini/, .github/:**
- Purpose: GSD project automation infrastructure
- Generated: No (manually configured)
- Committed: Yes (tracked in git)

**.git/:**
- Purpose: Git version control
- Generated: Yes (by `git init`)
- Committed: No (internal git structure)

---

*Structure analysis: 2026-05-13*
