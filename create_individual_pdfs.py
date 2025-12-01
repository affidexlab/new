#!/usr/bin/env python3
import os
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

# Create directory for individual PDFs
os.makedirs('individual_pdfs', exist_ok=True)

# Read the full outreach document
with open('outreach-dms.md', 'r', encoding='utf-8') as f:
    full_content = f.read()

# Define the influencers and their sections
influencers = {
    'hidreams': {
        'name': 'Hi Dreams (@hidreams__)',
        'start': '## 1. @hidreams__',
        'end': '## 2. @bitlanger'
    },
    'bitlanger': {
        'name': '₿itlanger (@bitlanger)',
        'start': '## 2. @bitlanger',
        'end': '## 3. @ubong_007'
    },
    'ubong_007': {
        'name': 'Uncle Ubong (@ubong_007)',
        'start': '## 3. @ubong_007',
        'end': '## 4. @godly_godsplan'
    },
    'godly_godsplan': {
        'name': 'GODLY (@godly_godsplan)',
        'start': '## 4. @godly_godsplan',
        'end': '## 5. @ola_crrypt'
    },
    'ola_crrypt': {
        'name': 'La_Crrypt (@ola_crrypt)',
        'start': '## 5. @ola_crrypt',
        'end': '## 6. @kachi_crypto'
    },
    'kachi_crypto': {
        'name': 'Kachi (@kachi_crypto)',
        'start': '## 6. @kachi_crypto',
        'end': '## 7. @sdx_trades'
    },
    'sdx_trades': {
        'name': 'SDX (@sdx_trades)',
        'start': '## 7. @sdx_trades',
        'end': '## 8. @kelvinking_'
    },
    'kelvinking': {
        'name': 'Kelvin king (@kelvinking_)',
        'start': '## 8. @kelvinking_',
        'end': '## Summary of Targets'
    }
}

# HTML template with styling
def get_html_template(title, content):
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {{
            margin: 1in;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            font-size: 11pt;
        }}
        h1 {{
            color: #1a1a1a;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
            margin-top: 0;
            font-size: 24pt;
        }}
        h2 {{
            color: #2c3e50;
            border-bottom: 2px solid #ddd;
            padding-bottom: 8px;
            margin-top: 30px;
            font-size: 18pt;
        }}
        h3 {{
            color: #34495e;
            margin-top: 25px;
            font-size: 14pt;
        }}
        h4 {{
            color: #4CAF50;
            margin-top: 20px;
            font-size: 12pt;
        }}
        p {{
            margin-bottom: 10px;
        }}
        ul, ol {{
            padding-left: 30px;
            margin-bottom: 15px;
        }}
        li {{
            margin-bottom: 8px;
        }}
        strong {{
            color: #2c3e50;
        }}
        em {{
            color: #666;
        }}
        .header {{
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            margin: -40px -40px 30px -40px;
            border-radius: 5px;
        }}
        .header h1 {{
            margin: 0;
            border: none;
            color: white;
            font-size: 28pt;
        }}
        .value-box {{
            background-color: #f8f9fa;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 20px 0;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 9pt;
        }}
        a {{
            color: #4CAF50;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>DecaFlow Partnership Proposal</h1>
        <p style="margin: 10px 0 0 0; font-size: 14pt;">Tailored for {title}</p>
    </div>
    {content}
    <div class="footer">
        <p><strong>DecaFlow - Privacy-Focused Cross-Chain DEX on Base</strong></p>
        <p>🌐 https://decaflow.xyz | X: @Decaflow | 💬 Telegram: t.me/decaflowprotocol</p>
        <p>Contact: Samuel David | Telegram: @defidboss</p>
    </div>
</body>
</html>
"""

# Extract and convert each section
for handle, info in influencers.items():
    print(f"Creating PDF for {info['name']}...")
    
    # Extract the section
    start_idx = full_content.find(info['start'])
    end_idx = full_content.find(info['end'])
    
    if start_idx == -1 or end_idx == -1:
        print(f"  Warning: Could not find section boundaries for {handle}")
        continue
    
    section_content = full_content[start_idx:end_idx].strip()
    
    # Convert markdown to HTML (simple conversion)
    html_content = section_content
    
    # Basic markdown to HTML conversion
    import re
    
    # Headers
    html_content = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html_content, flags=re.MULTILINE)
    html_content = re.sub(r'^\*\*(.*?)\*\*$', r'<h4>\1</h4>', html_content, flags=re.MULTILINE)
    
    # Bold and italic
    html_content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_content)
    html_content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html_content)
    
    # Bullet points
    html_content = re.sub(r'^• (.*?)$', r'<li>\1</li>', html_content, flags=re.MULTILINE)
    html_content = re.sub(r'(<li>.*?</li>\n)+', r'<ul>\g<0></ul>', html_content, flags=re.DOTALL)
    
    # Paragraphs
    html_content = re.sub(r'\n\n', '</p><p>', html_content)
    html_content = '<p>' + html_content + '</p>'
    
    # Clean up
    html_content = html_content.replace('<p></p>', '')
    html_content = html_content.replace('<p><ul>', '<ul>')
    html_content = html_content.replace('</ul></p>', '</ul>')
    html_content = html_content.replace('<p><h', '<h')
    html_content = html_content.replace('</h3></p>', '</h3>')
    html_content = html_content.replace('</h4></p>', '</h4>')
    
    # Create HTML with template
    html_doc = get_html_template(info['name'], html_content)
    
    # Generate PDF
    font_config = FontConfiguration()
    output_path = f'individual_pdfs/{handle}_partnership_proposal.pdf'
    HTML(string=html_doc).write_pdf(output_path, font_config=font_config)
    
    print(f"  ✓ Created: {output_path}")

print("\n✓ All individual PDFs created successfully in 'individual_pdfs/' directory")
