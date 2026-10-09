# Résumé build

`resume.json` is the single source for the résumé. Both outputs are generated from it:

- `assets/resume/iggy-resume.docx`: `python3 resume/build_docx.py assets/resume/iggy-resume.docx` (needs `python-docx`)
- `assets/resume/iggy-resume.pdf`: `node resume/build_pdf.mjs assets/resume/iggy-resume.pdf` (needs Playwright and a Chromium install)

This folder is not published: `_config.yml` excludes it from the Pages build.

After rebuilding, update the file sizes quoted in `index.html` (contact card), `sites/index.html` (footer), and `assets/js/site-map.js` (Explore dialog).
