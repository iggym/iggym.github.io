# Résumé build

Public files live in `assets/resume/`. This folder is not published: `_config.yml` excludes the source files. `resume/index.html` is the public page at `/resume/`.

Do not put a phone number or email address in any résumé source or output.

## Long résumé

`resume.json` is the source.

- Word: `python3 resume/build_docx.py assets/resume/iggy-resume.docx` (needs `python-docx`)
- PDF: `node resume/build_pdf.mjs assets/resume/iggy-resume.pdf` (needs Google Chrome or `CHROME_PATH`)

`resume-short.json` is a compact derivative (`python3 resume/make_short.py`). It is not the file the site serves as the 2-page résumé.

## 2-page résumé

The 2-page layout Iggy confirmed is `build_2page.py`, not a trim of the long JSON.

- Word: `python3 resume/build_2page.py assets/resume/iggy-resume-2page.docx`
- PDF: `python3 resume/build_2page_pdf.py` (reads that Word file; needs `python-docx` and Chrome)

The site’s résumé links point at the 2-page PDF. The long PDF and both Word files stay linked from the contact card.

After rebuilding, the contact card does not quote byte sizes. If a page count changes, update the label in `index.html`.
