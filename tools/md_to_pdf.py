"""
Small utility to convert DEPLOY_INSTRUCTIONS.md to PDF.
Strategy:
- Try WeasyPrint (markdown -> html -> pdf) for better formatting.
- Fallback to ReportLab (simple plain text PDF) if WeasyPrint not available.

Usage (PowerShell):
  python tools\md_to_pdf.py

Output:
  DEPLOY_INSTRUCTIONS.pdf in project root
"""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_FILE = ROOT / 'DEPLOY_INSTRUCTIONS.md'
OUT_PDF = ROOT / 'DEPLOY_INSTRUCTIONS.pdf'

if not MD_FILE.exists():
    print('Markdown file not found:', MD_FILE)
    sys.exit(1)

with open(MD_FILE, 'r', encoding='utf-8') as f:
    md = f.read()

# Try WeasyPrint first
try:
    from markdown import markdown
    from weasyprint import HTML, CSS

    print('Using WeasyPrint + markdown -> HTML -> PDF')
    html_body = markdown(md, extensions=['extra', 'smarty'])
    html = f"""<html><head><meta charset='utf-8'><style>
    body {{ font-family: DejaVu Sans, Arial, sans-serif; margin: 30px; line-height:1.4 }}
    pre {{ background:#f6f8fa; padding:10px; border-radius:6px }}
    code {{ background:#f6f8fa; padding:2px 4px; border-radius:4px }}
    h1,h2,h3 {{ color:#111 }}
    </style></head><body>{html_body}</body></html>"""

    HTML(string=html).write_pdf(str(OUT_PDF))
    print('PDF generato in:', OUT_PDF)
    sys.exit(0)
except Exception as e:
    print('WeasyPrint non disponibile o errore, fallback a ReportLab:', e)

# Fallback: ReportLab simple PDF
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import mm

    print('Using ReportLab fallback (simple formatting)')

    # Register a standard unicode font if available
    try:
        pdfmetrics.registerFont(TTFont('DejaVuSans', 'DejaVuSans.ttf'))
        font_name = 'DejaVuSans'
    except Exception:
        font_name = 'Helvetica'

    c = canvas.Canvas(str(OUT_PDF), pagesize=A4)
    width, height = A4
    margin = 20 * mm
    x = margin
    y = height - margin
    line_height = 10

    c.setFont(font_name, 12)
    for line in md.splitlines():
        if y < margin:
            c.showPage()
            c.setFont(font_name, 12)
            y = height - margin
        # very basic handling for markdown headers
        if line.startswith('# '):
            c.setFont(font_name, 16)
            c.drawString(x, y, line[2:].strip())
            y -= 18
            c.setFont(font_name, 12)
        elif line.startswith('## '):
            c.setFont(font_name, 14)
            c.drawString(x, y, line[3:].strip())
            y -= 16
            c.setFont(font_name, 12)
        elif line.startswith('### '):
            c.setFont(font_name, 12)
            c.drawString(x, y, line[4:].strip())
            y -= 14
        else:
            # wrap long lines
            max_chars = 100
            while len(line) > max_chars:
                part = line[:max_chars]
                c.drawString(x, y, part)
                line = line[max_chars:]
                y -= line_height
                if y < margin:
                    c.showPage()
                    c.setFont(font_name, 12)
                    y = height - margin
            if line.strip():
                c.drawString(x, y, line)
                y -= line_height
            else:
                y -= line_height

    c.save()
    print('PDF generato (ReportLab) in:', OUT_PDF)
    sys.exit(0)
except Exception as e:
    print('Errore nella generazione PDF di fallback:', e)
    sys.exit(2)
