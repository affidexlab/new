#!/usr/bin/env python3
import markdown
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration

with open('short-outreach-dms.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {{
            margin: 0.75in;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            max-width: 100%;
            color: #333;
        }}
        h1 {{
            color: #1a1a1a;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
            margin-top: 40px;
            font-size: 24pt;
        }}
        h2 {{
            color: #2c3e50;
            border-bottom: 2px solid #ddd;
            padding-bottom: 8px;
            margin-top: 30px;
            font-size: 16pt;
            page-break-before: always;
        }}
        h2:first-of-type {{
            page-break-before: auto;
        }}
        h3 {{
            color: #34495e;
            margin-top: 20px;
            font-size: 12pt;
        }}
        code {{
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.9em;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            font-size: 10pt;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }}
        th {{
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
        }}
        tr:nth-child(even) {{
            background-color: #f9f9fa;
        }}
        hr {{
            border: none;
            border-top: 2px solid #eee;
            margin: 30px 0;
        }}
        ul, ol {{
            padding-left: 30px;
        }}
        li {{
            margin-bottom: 8px;
        }}
        strong {{
            color: #2c3e50;
        }}
        .highlight {{
            background-color: #fff9e6;
            padding: 15px;
            border-left: 4px solid #4CAF50;
            margin: 15px 0;
        }}
    </style>
</head>
<body>
    {html_content}
</body>
</html>
"""

font_config = FontConfiguration()
HTML(string=html_template).write_pdf(
    'short-outreach-dms.pdf',
    font_config=font_config
)

print("Short DMs PDF generated successfully: short-outreach-dms.pdf")
