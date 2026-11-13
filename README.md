# iggym.github.io

Personal site for Iggy Mwangi, AI systems architect. The live site is [https://iggym.github.io](https://iggym.github.io).

He is open to Staff and Principal AI Platform, agent-infrastructure, applied AI architect, and forward-deployed AI roles. Consulting is welcome too. Current role: Senior Solutions Architect, AI & Cloud Infrastructure, at VynixAI (January 2025 – present). Nubla AI was January–December 2024.

Compound Engineering is his name for a method, and for the public projects on the site. It is not a company and not a job.

The site is static HTML, CSS, and JavaScript on GitHub Pages. There is no framework and no package install for the site itself. `_config.yml` tells Jekyll what to leave unpublished (`tasks/`, `scripts/`, `tests/`, planning notes, and the résumé generators).

## Contact form

The public contact path is X ([https://x.com/iggym](https://x.com/iggym)) and GitHub ([https://github.com/iggym](https://github.com/iggym)) until a Tally form exists.

Paste the form URL in one place: `window.IGGY_TALLY_URL` in `assets/js/tally-config.js`. The contact section, `/contact/`, and `/now/` read that value. The content security policy already allows `https://tally.so` for the embed and form action. Do not add an email address or a phone number.

## Résumés

Public files are in `assets/resume/`. The site links the 2-page PDF first.

- 2-page Word: `python3 resume/build_2page.py assets/resume/iggy-resume-2page.docx`
- 2-page PDF: `python3 resume/build_2page_pdf.py` (needs `python-docx` and Chrome)
- Long Word: `python3 resume/build_docx.py assets/resume/iggy-resume.docx`
- Long PDF: `node resume/build_pdf.mjs assets/resume/iggy-resume.pdf`

Details are in `resume/README.md`. Do not put a phone number or email address in those files.

## Version

The header version lives in `VERSION` (four numbers). Before a push to `main`:

```sh
node scripts/bump-version.mjs
```

That stamps `?v=` on asset links, rebuilds `sitemap.xml` and `robots.txt`, and rebuilds `sw.js`.

## Checks

```sh
node tests/check-site.mjs
```
