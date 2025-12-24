from pathlib import Path
from textwrap import wrap
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas

root = Path(__file__).resolve().parents[1]
source = root / "docs" / "strategy" / "decaflow_partnership_outreach.md"
output = root / "docs" / "strategy" / "decaflow_partnership_outreach.pdf"

text = source.read_text().splitlines()

c = canvas.Canvas(str(output), pagesize=LETTER)
width, height = LETTER
y = height - 72
line_height = 14
margin = 72
max_width = 90

for line in text:
    segments = wrap(line, max_width) or [""]
    for segment in segments:
        if y < margin:
            c.showPage()
            y = height - margin
        c.drawString(margin, y, segment)
        y -= line_height
    if line.strip() == "":
        y -= line_height

c.save()
print(f"Wrote {output}")
