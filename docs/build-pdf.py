# /// script
# requires-python = ">=3.12"
# dependencies = ["markdown>=3.6", "weasyprint>=62"]
# ///
from pathlib import Path

import markdown
from weasyprint import HTML

ROOT = Path(__file__).parent
SRC = ROOT / "menucka-specifikacia.md"
OUT = ROOT / "menucka-specifikacia.pdf"

CSS = """
@page {
  size: A4;
  margin: 13mm 14mm 14mm 14mm;
  @bottom-left { content: "Menučka – špecifikácia, dokumentácia a research"; font-size: 7pt; color: #8a8f98; }
  @bottom-right { content: "strana " counter(page) " / " counter(pages); font-size: 7pt; color: #8a8f98; }
}
:root { --accent: #c2410c; --ink: #1f2328; --muted: #5b616b; --line: #e3e5e8; --soft: #fbf4ef; }
html { font-family: "Adwaita Sans", "DejaVu Sans", sans-serif; font-size: 8.6pt; line-height: 1.34; color: var(--ink); }
body { margin: 0; }
h1 { font-size: 17pt; margin: 0 0 1.5mm; color: var(--accent); letter-spacing: -0.2pt; }
h2 { font-size: 11pt; margin: 3.2mm 0 1.4mm; padding-bottom: 0.6mm; border-bottom: 1.2pt solid var(--accent); break-after: avoid; }
h3 { font-size: 9.2pt; margin: 2.4mm 0 1mm; color: var(--accent); break-after: avoid; }
p { margin: 0 0 1.4mm; }
ul, ol { margin: 0 0 1.4mm; padding-left: 4.5mm; }
li { margin: 0 0 0.4mm; }
strong { font-weight: 700; }
a { color: var(--ink); text-decoration: none; overflow-wrap: anywhere; }
.title-block { background: var(--soft); border-left: 3pt solid var(--accent); padding: 2.6mm 4mm 2.2mm; margin-bottom: 1mm; }
.title-block p { margin: 0; }
.note { display: block; color: var(--muted); font-size: 7.6pt; margin-top: 0.6mm; }
table { width: 100%; border-collapse: collapse; margin: 0.6mm 0 1.6mm; font-size: 7.7pt; line-height: 1.27; break-inside: avoid; }
th { text-align: left; background: #f3f4f6; border-bottom: 1pt solid #c9cdd3; padding: 0.8mm 1.4mm; font-weight: 700; }
td { border-bottom: 0.5pt solid var(--line); padding: 0.7mm 1.4mm; vertical-align: top; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 7.2pt; background: #f3f4f6; padding: 0 0.6mm; border-radius: 1pt; white-space: nowrap; }
pre { background: #f7f8f9; border: 0.5pt solid var(--line); border-radius: 2pt; padding: 1.6mm 2mm; margin: 0.6mm 0 1.6mm; break-inside: avoid; }
pre code { background: none; padding: 0; font-size: 7pt; line-height: 1.22; white-space: pre; }
.cols { display: flex; gap: 4mm; }
.cols > div { flex: 1; min-width: 0; }
.cols pre code { font-size: 6.9pt; }
.page-break { break-after: page; }
.sources { margin-top: 2mm; font-size: 6.6pt; line-height: 1.28; color: var(--muted); }
.sources ul { padding-left: 3.5mm; }
.sources li { margin: 0; }
"""


def main() -> None:
    body = markdown.markdown(
        SRC.read_text(encoding="utf-8"),
        extensions=["tables", "fenced_code", "md_in_html", "sane_lists"],
    )
    html = f'<!doctype html><html lang="sk"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}</body></html>'
    doc = HTML(string=html, base_url=str(ROOT)).render()
    doc.write_pdf(OUT)
    print(f"{OUT.name}: {len(doc.pages)} strán")


if __name__ == "__main__":
    main()
