# Project Size

The site is a static site with no build step and no `package.json`. Sizes below exclude `.git`.

| Part | Size |
|---|---|
| **Total on disk** | **~4.8 MB** (138 files) |
| Images (`assets/img`, mostly site thumbnails) | ~3.2 MB |
| Fonts (`assets/fonts`, 7 woff2 files) | ~264 KB |
| Resume (PDFs, JSON, DOCX) | ~596 KB |
| `tools/` (12 single-file HTML tools) | ~288 KB |
| `tasks/` (planning markdown) | ~128 KB |
| `articles/` | ~100 KB |
| `assets/js`, `assets/css` | ~96 KB + ~72 KB |
| `sites/`, `scripts/`, `tests/`, root files | ~40 KB + ~16 KB + ~8 KB + ~64 KB |

## Code

- HTML, CSS, JS, and MJS total about 10,800 lines, or roughly 600 KB.
- Largest files: `index.html` (47 KB), `sites/index.html` (39 KB), `assets/css/home.css` (35 KB).

## Git

- The `.git` directory is about 3.9 MB.
