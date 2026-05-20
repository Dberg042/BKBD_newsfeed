# BKBD Newsfeed: Image Optimization Pipeline + Active Pointer Workflow

I have a static news feed display app running on GitHub Pages, used on TV displays in offices (Samsung Tizen, LG WebOS, Android TV — mixed fleet, oldest is Tizen 5.0 with Chromium ~63). I need you to add two automation features via GitHub Actions. The repo is already cloned and you're working in it.

## Context — What This Repo Does

The frontend is an HTML/CSS/JS news carousel. It's updated daily by an external agent ("Hermes") that:

1. Creates a new dated folder under `data/` (e.g., `data/2026-05-17/`)
2. Drops `news-*.json` files into it. Each MAY have an `image_url` pointing to a remote image (often 1-3MB, sometimes 3000x2000px). Many news items have NO image — this is normal.
3. Drops a `manifest.json` listing which news files are active for that date
4. Drops a `birthday.json` for birthday/celebration items (also may or may not have an `image_url`)

The frontend reads `data/active.json` which contains `{"date": "2026-05-17"}` — this tells the carousel which dated folder to load.

**Current pain points:**

1. Remote images are huge → Tizen 5.0 TVs crash on render (RAM exhaustion). I need them downloaded, resized, and served locally as part of the build pipeline.
2. I manually edit `data/active.json` every day to point to the newest date. I want to manually trigger a workflow that does this for me (especially from my phone via the GitHub mobile app).

**I do NOT want to:**
- Touch the Hermes agent (token cost concern)
- Switch hosting (staying on GitHub Pages)
- Run images through any external service (must be self-contained in GitHub Actions)
- Modify CSS — the existing image styling is intentional and works well across aspect ratios

## Repo Structure (Verify Before Editing)

```
.
├── .github/workflows/static.yml      # existing deploy workflow
├── data/
│   ├── active.json                   # {"date": "YYYY-MM-DD", "date_test": "YYYY-MM-DD", ...}
│   ├── 2026-05-13/
│   │   ├── manifest.json             # ["news-X.json", "news-Y.json", ...]
│   │   ├── birthday.json
│   │   └── news-*.json               # each MAY have image_url field
│   ├── 2026-05-14/
│   └── 2026-05-17/
├── css/style.css                     # DO NOT MODIFY
├── js/
│   ├── app.js                        # main entry, fetches active.json
│   └── carousel.js                   # renders slides, sets img.src
├── index.html
├── test.html                         # mirror of index.html, used for mobile preview — KEEP IN SYNC
├── package.json                      # may already exist with sharp installed
└── README.md
```

**Before doing anything else, run these to verify the structure:**

```bash
ls -la data/
cat data/active.json
ls data/$(ls data/ | grep -E '^[0-9]{4}' | tail -1)/
cat data/$(ls data/ | grep -E '^[0-9]{4}' | tail -1)/manifest.json
cat data/$(ls data/ | grep -E '^[0-9]{4}' | tail -1)/news-*.json | head -100
cat data/$(ls data/ | grep -E '^[0-9]{4}' | tail -1)/birthday.json 2>/dev/null || echo "no birthday file"
cat .github/workflows/static.yml
grep -n "image_url\|local_image\|img\.\|\.src" js/carousel.js js/app.js
diff index.html test.html | head -40
```

Then read `BLUEPRINT.md` and `README.md` to understand any constraints I may have forgotten to mention.

## End-to-End Flow (Target State)

```
T0  Hermes creates data/2026-05-17/news-750.json
       { "id": "news-750", "image_url": "https://...", ... }
       (no local_image field yet)

T1  GitHub Actions triggers (on push or manual workflow_dispatch)
       → scripts/optimize-images.js runs
       → Scans all news-*.json and birthday.json files
       → For each one with image_url:
           - Skip if local_image already exists AND the file on disk exists
           - Otherwise: download, resize, save as optimized-images/{id}_{YYMMDD}.jpg
           - Add local_image field to the JSON
       → Skip silently if image_url is missing/empty/null
       → Log and continue if download fails — never exit non-zero

T2  GitHub Actions commits new images + updated JSONs
       Message: "chore: optimize new images [skip ci]"

T3  Deploy job runs, GitHub Pages picks up the changes

T4  TV loads the page
       → carousel reads JSON
       → uses local_image if present
       → falls back to image_url if local fails to load
       → shows fallback UI if both fail (or if neither exists)
```

## Task 1: Image Optimization Pipeline

### Script: `scripts/optimize-images.js`

Build a Node.js script that:

1. Scans all `data/YYYY-MM-DD/news-*.json` AND `data/YYYY-MM-DD/birthday.json` files
2. For each file:
   - **If `image_url` is missing, empty string, or null** → skip silently (no log, no JSON modification)
   - **If `image_url` exists AND `local_image` already exists AND the file at that local path exists on disk** → skip (cache hit, log as "cached")
   - **Otherwise** process it (see below)
3. **Always exit 0**, even with errors. A bad URL must never break the pipeline.

### Processing logic (the core)

For each image that needs processing:

1. Download with 15-second timeout
2. Use User-Agent header: `Mozilla/5.0 (compatible; BKBD-NewsFeed/1.0)` (some servers 403 without this)
3. Apply the **adaptive optimization algorithm** below
4. Save to `optimized-images/{filename}` at repo root
5. Add `local_image` field to the JSON: `"local_image": "optimized-images/news-750_260517.jpg"` (relative path, NO leading slash)

### Adaptive optimization algorithm (CRITICAL — read carefully)

**Hard constraint:** Final file MUST be ≤200KB. **Hard constraint:** Max dimensions 1920x1080, preserve aspect ratio.

Try the following passes in order. Accept the first one whose output is ≤200KB:

```
Pass 1: resize 1920x1080 (fit: inside, withoutEnlargement: true), JPEG Q75 mozjpeg progressive
Pass 2: resize 1920x1080 (same), JPEG Q65 mozjpeg progressive
Pass 3: resize 1920x1080 (same), JPEG Q55 mozjpeg progressive
Pass 4: resize 1600x900  (same), JPEG Q60 mozjpeg progressive
Pass 5: resize 1280x720  (same), JPEG Q60 mozjpeg progressive
Pass 6: resize 1280x720  (same), JPEG Q50 mozjpeg progressive
Pass 7: resize 1280x720  (same), JPEG Q40 mozjpeg progressive  ← floor
```

If Pass 7 still produces >200KB, accept it anyway and log a warning with the final size. Do NOT go below Q40 — output becomes unusable.

The key Sharp config for every pass:
```javascript
.resize({
  width: <pass-width>,
  height: <pass-height>,
  fit: 'inside',              // preserve aspect ratio
  withoutEnlargement: true    // don't upscale small images
})
.jpeg({
  quality: <pass-quality>,
  progressive: true,
  mozjpeg: true
})
```

Note: `fit: 'inside'` means the image is scaled so both dimensions fit WITHIN the max — a 3000x2000 source becomes 1620x1080 (height limit wins), a 2000x3000 source becomes 720x1080 (width hits the cap first, but the height limit wins at 1080 anyway — actually no, 2000x3000 with max 1920x1080 inside becomes 720x1080). This is what we want: each image keeps its natural ratio.

For each accepted pass, log: filename, source URL, final dimensions, final size in KB, which pass succeeded (e.g., "Pass 2 @ Q65").

### Filename format

- News items: `optimized-images/{news-id}_{YYMMDD}.jpg`
  - `news-id` from the JSON's `id` field (e.g., `news-750`)
  - `YYMMDD` from the parent folder name (`2026-05-17` → `260517`)
- Birthday: `optimized-images/birthday_{YYMMDD}.jpg`

This format means:
- Same news ID on different dates gets different files (handles Hermes re-runs with updated images)
- Filename is debuggable
- The slight duplication (same URL on two days = two files) is acceptable

### Concurrency, logging, summary

- Process 3 images concurrently (use a simple worker pool, not Promise.all on everything at once)
- Final summary printed at end:
  ```
  === SUMMARY ===
  Total JSONs scanned:     XX
  No image_url (skipped):  XX
  Already cached:          XX
  Newly optimized:         XX
  Download errors:         XX
  Optimization warnings:   XX  (couldn't get under 200KB)
  Total disk size:         XX MB
  ```
- If there were errors, list the URLs after the summary
- Exit code: always 0

### Dependencies

Use `sharp` and `node-fetch@2`. Add them to `package.json` as `dependencies` (not devDependencies — GitHub Actions does `npm ci` for production).

### Folder rules

- `optimized-images/` lives at repo root, NOT under dist/, NOT under data/
- This folder IS committed to the repo (it acts as the persistent cache between Actions runs)
- Make sure `.gitignore` does NOT exclude it
- The script should `mkdir -p` it before writing

## Task 1b: Frontend Changes

### Files to modify

1. `js/carousel.js` — main image handling
2. `js/app.js` — if it touches image src anywhere
3. `index.html` AND `test.html` — must stay in sync, mirror any HTML structure changes to both

### What to change

Find where image `src` is set from news data. Implement this fallback chain:

```javascript
// Pseudocode — adapt to actual code structure
function setNewsImage(imgElement, newsItem) {
  imgElement.loading = 'lazy';  // help newer browsers, ignored by old ones
  
  var primarySrc = newsItem.local_image || newsItem.image_url;
  
  if (!primarySrc) {
    showImageFallback(imgElement);
    return;
  }
  
  imgElement.onerror = function() {
    // If local failed and we have a remote URL, try remote
    if (this.src.indexOf('optimized-images/') !== -1 && newsItem.image_url) {
      this.onerror = function() { showImageFallback(this); };
      this.src = newsItem.image_url;
      return;
    }
    showImageFallback(this);
  };
  
  imgElement.src = primarySrc;
}
```

The exact integration depends on how the existing code is structured. Look at the current `carousel-image` and `carousel-image-bg` handling — both need the fallback chain applied. Don't break the existing background-blur effect.

### Tizen 5.0 syntax compatibility (Chromium ~63)

The browser doesn't support:
- Optional chaining (`?.`)
- Optional chaining with arrays (`?.[]`)
- Nullish coalescing (`??`)
- `String.prototype.matchAll`
- Top-level await

Use `&&` guards, `||` defaults, and explicit `for` loops with `regex.exec()` instead.

**While in the JS files, also fix any existing modern syntax you find.** I know there's at least:
- `carousel.js` around line 155: `img.parentElement?.querySelector(...)`
- `carousel.js` around line 185: `nextItem.names?.[0]`
- `app.js` around line 154: `[...html.matchAll(...)]`

Fix these too while you're there. Scan the whole JS for similar patterns.

### DO NOT modify CSS

`css/style.css` has intentional aspect-ratio handling via:
- `.carousel-image-section` (container with `clamp(200px, 55vh, 550px)`)
- `.carousel-image` (foreground, `object-fit: cover`, masked edges)
- `.carousel-image-bg` (blurred background, `object-fit: cover`)

This design handles any aspect ratio gracefully. Don't touch it.

### test.html must stay in sync with index.html

I use `test.html` for previewing changes from my phone. Whatever you change in `index.html` for image handling, mirror the equivalent change in `test.html`. If they were already structurally identical (just different titles/data sources), keep that pattern. Run `diff index.html test.html` to see what's expected to differ vs what should match.

## Task 2: Active Pointer Update Workflow

Create a NEW workflow file: `.github/workflows/update-pointer.yml`.

### Trigger

ONLY `workflow_dispatch`. No push trigger, no cron.

### Input

One optional input: `target_date`
- Description: "Target date in YYYY-MM-DD format. Leave blank to auto-pick the newest dated folder."
- Required: false
- Type: string

### Steps

1. Checkout repo with write permissions (`fetch-depth: 0`, `token: ${{ secrets.GITHUB_TOKEN }}`)
2. Determine target date:
   - If input provided: validate format `YYYY-MM-DD`, then verify `data/{date}/manifest.json` exists. Fail with clear message if not.
   - If input blank: find the newest `data/YYYY-MM-DD/` folder by lexicographic sort
3. Read current `data/active.json` to capture old date
4. Update `data/active.json`:
   - `date`: new date
   - `date_test`: new date
   - `approved_at`: current ISO timestamp (e.g., `2026-05-20T14:30:00Z`)
   - `approved_by`: `"GitHub Actions (${{ github.actor }})"`
5. Commit with message: `chore: point active to {date}` — **NO `[skip ci]`** (we WANT the deploy to trigger)
6. Push to main

### Step summary output

Write to `$GITHUB_STEP_SUMMARY`:

```markdown
## Active Pointer Updated
- **Old date:** {old_date}
- **New date:** {new_date}
- **News items in new folder:** {count of news-*.json files}
- **Triggered by:** {github.actor}
- **Deploy will start automatically.** Check the [Actions tab]({link}).
```

### Edge cases

- No dated folders exist at all → fail with: "No dated folders found under data/. Cannot update pointer."
- `target_date` input given but folder doesn't exist → fail with: "data/{date}/ does not exist or has no manifest.json."
- `target_date` is same as current → still update timestamp, still commit (user gets feedback)
- Folder exists but `manifest.json` is missing → fail (incomplete data)

## Task 3: Update Existing static.yml

Modify `.github/workflows/static.yml` to add image optimization BEFORE the deploy step:

1. Setup Node 20 (`actions/setup-node@v4` with `node-version: '20'`)
2. Cache `node_modules`:
   - `actions/cache@v4`
   - Key: `node-modules-${{ hashFiles('package-lock.json') }}`
3. Cache `optimized-images/`:
   - `actions/cache@v4`
   - Key: `optimized-images-${{ hashFiles('data/**/news-*.json', 'data/**/birthday.json') }}`
   - Restore-keys: `optimized-images-` (so we can use any cached version as starting point)
4. Run `npm ci`
5. Run `node scripts/optimize-images.js`
6. Auto-commit any changes (new images, updated JSONs):
   - Use `stefanzweifel/git-auto-commit-action@v5`
   - Commit message: `chore: optimize new images [skip ci]`
   - Branch: `${{ github.ref_name }}`
   - File pattern: `optimized-images/* data/**/*.json`
7. Then existing upload + deploy steps

Keep existing triggers: `push` to main, and `workflow_dispatch`. Permissions block must include `contents: write` (for the auto-commit).

## Acceptance Criteria

After you finish, ALL of these should be true:

1. `npm install && node scripts/optimize-images.js` runs locally and produces optimized images
2. `optimized-images/` folder contains files named `{news-id}_{YYMMDD}.jpg` and possibly `birthday_{YYMMDD}.jpg`
3. **All produced files are ≤200KB** (warnings allowed for the unavoidable few)
4. **All produced files preserve the source aspect ratio** (no squishing, no cropping in the build)
5. **All produced files are at most 1920x1080**
6. JSONs with `image_url` now also have `local_image` field
7. JSONs without `image_url` are untouched
8. JSONs with broken `image_url` are untouched; the script logs the failure but exits 0
9. Opening `index.html` and `test.html` locally still works (use a local server like `npx serve`) — images load from optimized paths; fallback works
10. Pushing to main triggers: deps install → image optimization → auto-commit (if changes) → deploy
11. Manually triggering "Update Active Pointer" from Actions UI works (with and without `target_date` input)
12. Manual trigger updates `active.json` and the deploy workflow picks up that push automatically
13. Tizen 5.0 syntax (no `?.`, no `??`, no `matchAll` spread) — verified by scanning all JS files
14. `index.html` and `test.html` are structurally in sync regarding image handling
15. `css/style.css` is unchanged
16. Both workflows succeed on a clean run

## Execution Order

**Do NOT just start coding.** Follow this order:

1. **Run all the verification commands listed in "Repo Structure" above.** Confirm:
   - What's in `data/`
   - The structure of a `news-*.json` (with and without `image_url`)
   - The structure of `birthday.json`
   - The current state of `.github/workflows/static.yml`
   - Where image src is set in JS
   - The diff between `index.html` and `test.html`
   - What's in `BLUEPRINT.md` and `README.md` that I might have forgotten
2. **Report back to me** with:
   - A summary of what you found
   - Your plan for each task (script structure, JS changes, workflow changes)
   - Any questions or concerns
   - Any conflicts with the existing repo state
3. **Wait for my confirmation** before writing any code
4. After approval, work in this order:
   a. Install deps + write `scripts/optimize-images.js`
   b. Test it locally, show me the output with the summary stats
   c. Patch JS files (carousel.js, app.js) for `local_image` fallback + syntax fixes
   d. Patch `index.html` and `test.html` if needed
   e. Update `.github/workflows/static.yml`
   f. Create `.github/workflows/update-pointer.yml`
   g. Show me a diff overview of all changes before committing
5. **Do not commit until I approve the diff**

## Watchpoints

- **GitHub Pages relative paths**: Use `optimized-images/abc.jpg`, never `/optimized-images/abc.jpg`. Pages may serve from a sub-path.
- **`[skip ci]` discipline**: ONLY the static.yml auto-commit has `[skip ci]`. The update-pointer commit does NOT, because we want it to trigger deploy.
- **`.gitignore`**: Confirm `node_modules/` and `dist/` are ignored. Confirm `optimized-images/` is NOT ignored.
- **Aspect ratio**: `fit: 'inside'` is the only acceptable Sharp fit mode. NEVER use `cover` or `fill` in the build script — that would distort images. CSS handles display fitting.
- **Filename consistency**: For news, format is `news-{numericId}_{YYMMDD}.jpg`. Don't add prefixes or change separators.
- **Birthday edge case**: birthday.json is one per date. Some dates may not have it. Handle the missing case.
- **Empty data folders**: Some date folders may exist but be empty/incomplete. Don't crash on those.

Begin by running the verification commands and reporting back with your plan. Don't write code yet.