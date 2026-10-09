# Résumé build

`resume.json` is the single source for the full résumé. Two shorter outputs are derived from it:

| Output | Source | Command |
| :--- | :--- | :--- |
| `assets/resume/iggy-resume.docx` (8 pages) | `resume/resume.json` | `python3 resume/build_docx.py assets/resume/iggy-resume.docx` (needs `python-docx`) |
| `assets/resume/iggy-resume.pdf` (8 pages) | `resume/resume.json` | `node resume/build_pdf.mjs assets/resume/iggy-resume.pdf` (needs Playwright and a Chromium install) |
| `resume/resume-short.json` (2-page source) | `resume/resume.json` | `python3 resume/make_short.py` |
| `assets/resume/iggy-resume-2page.docx` | `resume/resume-short.json` | `python3 resume/build_docx.py assets/resume/iggy-resume-2page.docx resume/resume-short.json` |
| `assets/resume/iggy-resume-2page.pdf` | `resume/resume-short.json` | `node resume/build_pdf.mjs assets/resume/iggy-resume-2page.pdf resume/resume-short.json` |

`make_short.py` keeps the strongest bullets for the most recent roles (the ones listed in `DETAIL`) and turns older roles into one-line entries. Run it again whenever `resume.json` changes, then rebuild the 2-page files.

This folder is not published: `_config.yml` excludes it from the Pages build.

The homepage and `/sites/` link to these PDFs without quoting file sizes, so nothing on the site needs updating after a rebuild.
