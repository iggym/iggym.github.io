"""Print the 2-page public résumé PDF from the Word file.

The Word file is the source (resume/build_2page.py). This renders that same
text to a letter-size PDF with headless Chrome. It does not add contact
details that are not already in the document.

Usage: python3 resume/build_2page_pdf.py [in.docx] [out.pdf]
"""
import html
import os
import subprocess
import sys
from pathlib import Path

from docx import Document

HERE = Path(__file__).resolve().parent
DEFAULT_IN = HERE.parent / "assets" / "resume" / "iggy-resume-2page.docx"
DEFAULT_OUT = HERE.parent / "assets" / "resume" / "iggy-resume-2page.pdf"
CHROME = os.environ.get("CHROME_PATH", "/usr/bin/google-chrome")

CSS = """
@font-face { font-family: Carlito; src: url('file:///usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf'); font-weight: 400; }
@font-face { font-family: Carlito; src: url('file:///usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf'); font-weight: 700; }
@font-face { font-family: Carlito; src: url('file:///usr/share/fonts/truetype/crosextra/Carlito-Italic.ttf'); font-style: italic; font-weight: 400; }
@page { size: Letter; margin: 0.42in 0.5in 0.38in; }
* { box-sizing: border-box; }
html, body { margin: 0; color: #1a1a1f; font-family: Carlito, 'Liberation Sans', Arial, sans-serif; font-size: 8.55pt; line-height: 1.22; }
h1 { font-size: 16pt; text-align: center; margin: 0; letter-spacing: 0.04em; }
.contact, .headline { text-align: center; margin: 0; }
.headline { font-weight: 700; font-size: 10.2pt; margin: 2px 0 2px; }
h2 { font-size: 9.2pt; letter-spacing: 0.06em; margin: 7px 0 2px; padding-bottom: 1px; border-bottom: 0.6pt solid #444; }
p { margin: 0 0 2px; }
ul { margin: 0 0 2px; padding-left: 1.05em; }
li { margin: 0 0 1px; }
.job { margin-top: 4px; }
"""


def runs_html(p):
    out = []
    for r in p.runs:
        t = html.escape(r.text)
        if not t:
            continue
        if r.bold:
            t = f"<strong>{t}</strong>"
        if r.italic:
            t = f"<em>{t}</em>"
        out.append(t)
    return "".join(out)


def to_html(doc):
    paras = list(doc.paragraphs)
    parts = [
        "<!doctype html><html lang='en'><head><meta charset='utf-8'>",
        "<title>Iggy Mwangi résumé</title><style>",
        CSS,
        "</style></head><body>",
        f"<h1>{html.escape(paras[0].text)}</h1>",
        f"<p class='contact'>{html.escape(paras[1].text)}</p>",
        f"<p class='headline'>{html.escape(paras[2].text)}</p>",
    ]
    open_ul = False
    for p in paras[3:]:
        text = p.text.strip()
        if not text:
            continue
        style = p.style.name if p.style else ""
        if text.isupper() and len(text) < 90:
            if open_ul:
                parts.append("</ul>")
                open_ul = False
            parts.append(f"<h2>{html.escape(text)}</h2>")
            continue
        if style == "List Bullet":
            if not open_ul:
                parts.append("<ul>")
                open_ul = True
            parts.append(f"<li>{runs_html(p)}</li>")
            continue
        if open_ul:
            parts.append("</ul>")
            open_ul = False
        cls = "job" if (p.runs and p.runs[0].bold and "|" in text) else ""
        parts.append(f"<p class='{cls}'>{runs_html(p)}</p>")
    if open_ul:
        parts.append("</ul>")
    parts.append("</body></html>")
    return "".join(parts)


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_IN
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT
    html_path = HERE / ".resume-2page.html"
    html_path.write_text(to_html(Document(str(src))), encoding="utf-8")
    try:
        subprocess.check_call([
            CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
            "--no-pdf-header-footer", f"--print-to-pdf={out.resolve()}",
            html_path.resolve().as_uri(),
        ], stdout=subprocess.DEVNULL)
    finally:
        html_path.unlink(missing_ok=True)
    print("wrote", out)


if __name__ == "__main__":
    main()
