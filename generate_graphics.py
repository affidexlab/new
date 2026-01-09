#!/usr/bin/env python3
"""
DecaFlow Week 1 Graphics Generator
Generates all 7 social media graphics based on detailed prompts
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# Create output directory
OUTPUT_DIR = "/project/workspace/affidexlab/new/graphics/week1"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Brand colors
COLORS = {
    'electric_blue': '#00D4FF',
    'deep_purple': '#8B5CF6',
    'cyber_violet': '#A855F7',
    'orange': '#FF8C00',
    'gold': '#FFD700',
    'success_green': '#10B981',
    'alert_red': '#EF4444',
    'darkest': '#0A0E1A',
    'dark_secondary': '#1A1F35',
    'dark_tertiary': '#2D3250',
    'white': '#FFFFFF',
    'secondary_gray': '#E5E7EB',
    'muted_gray': '#9CA3AF',
}

# Standard dimensions
WIDTH = 1200
HEIGHT = 675

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient_background(width, height, color1, color2):
    """Create a vertical gradient background"""
    base = Image.new('RGB', (width, height), color1)
    top = Image.new('RGB', (width, height), color2)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        for x in range(width):
            mask_data.append(int(255 * (y / height)))
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def add_text_with_outline(draw, text, position, font, fill_color, outline_color=None, outline_width=2):
    """Add text with optional outline"""
    x, y = position
    if outline_color:
        # Draw outline
        for adj_x in range(-outline_width, outline_width+1):
            for adj_y in range(-outline_width, outline_width+1):
                draw.text((x+adj_x, y+adj_y), text, font=font, fill=outline_color)
    # Draw main text
    draw.text((x, y), text, font=font, fill=fill_color)

def add_glow_effect(img, mask, glow_color, blur_radius=20, opacity=0.4):
    """Add glow effect to image"""
    glow = Image.new('RGBA', img.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    
    # Create glow layer
    glow = glow.filter(ImageFilter.GaussianBlur(blur_radius))
    
    # Composite with original
    return Image.alpha_composite(img.convert('RGBA'), glow)

# ============================================================================
# DAY 1: THE REAL PROBLEM KILLING DEFI
# ============================================================================
def generate_day1_trust():
    """Generate Day 1 graphic - The Real Problem Killing DeFi"""
    print("Generating Day 1: The Real Problem Killing DeFi...")
    
    # Create base image with gradient
    img = create_gradient_background(WIDTH, HEIGHT, 
                                     hex_to_rgb(COLORS['darkest']), 
                                     hex_to_rgb(COLORS['dark_secondary']))
    draw = ImageDraw.Draw(img)
    
    # Try to load fonts, fallback to default if not available
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
        body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
    
    # Draw cracked TRUST text in center
    trust_text = "TRUST"
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), trust_text, font=title_font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center position
    x = (WIDTH - text_width) // 2
    y = (HEIGHT - text_height) // 2 - 50
    
    # Draw shadow/glow effect
    for offset in range(5, 0, -1):
        alpha = int(50 * (offset / 5))
        shadow_color = hex_to_rgb(COLORS['electric_blue']) + (alpha,)
    
    # Draw main text with gradient effect (simulate with layers)
    add_text_with_outline(draw, trust_text, (x, y), title_font, 
                         hex_to_rgb(COLORS['white']), 
                         hex_to_rgb(COLORS['electric_blue']), 3)
    
    # Draw crack line through text
    crack_y = y + text_height // 2
    draw.line([(200, crack_y-20), (1000, crack_y+20)], 
              fill=hex_to_rgb(COLORS['alert_red']), width=8)
    
    # Add floating warning symbols
    warning_font = body_font
    for pos in [(250, 200), (850, 250), (300, 450), (900, 400)]:
        draw.text(pos, "⚠", font=warning_font, fill=hex_to_rgb(COLORS['alert_red']))
    
    # Add subtitle at bottom
    subtitle = "THE REAL PROBLEM KILLING DEFI"
    bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    sub_width = bbox[2] - bbox[0]
    sub_x = (WIDTH - sub_width) // 2
    draw.text((sub_x, HEIGHT - 100), subtitle, font=subtitle_font, 
             fill=hex_to_rgb(COLORS['electric_blue']))
    
    # Add decorative elements - broken chain symbols
    for pos in [(150, 150), (1000, 500)]:
        draw.ellipse([pos[0], pos[1], pos[0]+40, pos[1]+40], 
                    outline=hex_to_rgb(COLORS['muted_gray']), width=3)
        draw.line([(pos[0]+20, pos[1]), (pos[0]+20, pos[1]+20)], 
                 fill=hex_to_rgb(COLORS['alert_red']), width=4)
    
    # Save
    output_path = os.path.join(OUTPUT_DIR, "DECAFLOW_W1D1_AUTHORITY_TRUST_V1.png")
    img.save(output_path, 'PNG')
    print(f"✓ Saved: {output_path}")
    return output_path

# ============================================================================
# DAY 2: WHAT DECAFLOW ACTUALLY DOES
# ============================================================================
def generate_day2_products():
    """Generate Day 2 graphic - What DecaFlow Actually Does"""
    print("Generating Day 2: What DecaFlow Actually Does...")
    
    # Create base image
    img = create_gradient_background(WIDTH, HEIGHT, 
                                     hex_to_rgb(COLORS['darkest']), 
                                     hex_to_rgb(COLORS['dark_secondary']))
    draw = ImageDraw.Draw(img)
    
    try:
        header_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 44)
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        header_font = title_font = body_font = small_font = ImageFont.load_default()
    
    # Header
    header_text = "WHAT DECAFLOW DOES"
    bbox = draw.textbbox((0, 0), header_text, font=header_font)
    header_width = bbox[2] - bbox[0]
    draw.text(((WIDTH - header_width) // 2, 40), header_text, 
             font=header_font, fill=hex_to_rgb(COLORS['white']))
    
    # Define 4 quadrants
    quadrant_width = 550
    quadrant_height = 280
    padding = 50
    gap = 20
    
    quadrants = [
        {
            'title': '1. PRIVACY SWAPS',
            'desc': 'Trade without MEV bots\nfront-running you',
            'color': COLORS['electric_blue'],
            'x': padding,
            'y': 140,
        },
        {
            'title': '2. CROSS-CHAIN BRIDGE',
            'desc': 'Move assets between 6 chains\nin under 60 seconds',
            'color': COLORS['cyber_violet'],
            'x': WIDTH // 2 + gap,
            'y': 140,
        },
        {
            'title': '3. LIQUIDITY POOLS',
            'desc': 'Provide liquidity and\nearn fees automatically',
            'color': COLORS['success_green'],
            'x': padding,
            'y': 140 + quadrant_height + gap,
        },
        {
            'title': '4. PRIVACY SDK',
            'desc': 'One line of code = MEV\nprotection for any DeFi app',
            'color': COLORS['orange'],
            'x': WIDTH // 2 + gap,
            'y': 140 + quadrant_height + gap,
        },
    ]
    
    for q in quadrants:
        # Draw card background
        card_x = q['x']
        card_y = q['y']
        card_width = quadrant_width
        card_height = quadrant_height
        
        # Card background
        draw.rectangle([card_x, card_y, card_x + card_width, card_y + card_height],
                      fill=hex_to_rgb(COLORS['dark_secondary']),
                      outline=hex_to_rgb(q['color']), width=2)
        
        # Icon circle (simplified)
        icon_size = 80
        icon_x = card_x + (card_width - icon_size) // 2
        icon_y = card_y + 40
        draw.ellipse([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size],
                    fill=hex_to_rgb(COLORS['dark_tertiary']),
                    outline=hex_to_rgb(q['color']), width=3)
        
        # Number badge
        badge_size = 35
        badge_x = card_x + 15
        badge_y = card_y + 15
        draw.ellipse([badge_x, badge_y, badge_x + badge_size, badge_y + badge_size],
                    fill=hex_to_rgb(q['color']))
        
        number = q['title'][0]
        bbox = draw.textbbox((0, 0), number, font=title_font)
        num_width = bbox[2] - bbox[0]
        num_height = bbox[3] - bbox[1]
        draw.text((badge_x + (badge_size - num_width) // 2, 
                  badge_y + (badge_size - num_height) // 2 - 5),
                 number, font=title_font, fill=hex_to_rgb(COLORS['white']))
        
        # Title
        title_y = icon_y + icon_size + 20
        bbox = draw.textbbox((0, 0), q['title'], font=title_font)
        title_width = bbox[2] - bbox[0]
        draw.text((card_x + (card_width - title_width) // 2, title_y),
                 q['title'], font=title_font, fill=hex_to_rgb(COLORS['white']))
        
        # Description
        desc_y = title_y + 45
        lines = q['desc'].split('\n')
        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=body_font)
            line_width = bbox[2] - bbox[0]
            draw.text((card_x + (card_width - line_width) // 2, desc_y + i * 25),
                     line, font=body_font, fill=hex_to_rgb(COLORS['secondary_gray']))
    
    # Footer
    footer_text = "decaflow.xyz"
    bbox = draw.textbbox((0, 0), footer_text, font=body_font)
    footer_width = bbox[2] - bbox[0]
    draw.text(((WIDTH - footer_width) // 2, HEIGHT - 35), footer_text,
             font=body_font, fill=hex_to_rgb(COLORS['electric_blue']))
    
    # Save
    output_path = os.path.join(OUTPUT_DIR, "DECAFLOW_W1D2_PRODUCT_FEATURES_V1.png")
    img.save(output_path, 'PNG')
    print(f"✓ Saved: {output_path}")
    return output_path

# ============================================================================
# DAY 3: HOW TO EARN WITH DECAFLOW
# ============================================================================
def generate_day3_rewards():
    """Generate Day 3 graphic - How to Earn with DecaFlow"""
    print("Generating Day 3: How to Earn with DecaFlow...")
    
    # Create base with warm gradient
    img = create_gradient_background(WIDTH, HEIGHT, 
                                     hex_to_rgb(COLORS['darkest']), 
                                     hex_to_rgb(COLORS['dark_secondary']))
    draw = ImageDraw.Draw(img)
    
    try:
        mega_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    except:
        mega_font = title_font = body_font = small_font = ImageFont.load_default()
    
    # Add radial gold glow effect (simplified)
    center_x, center_y = WIDTH // 2, 180
    for radius in range(200, 50, -20):
        alpha = int(30 * ((200 - radius) / 150))
        draw.ellipse([center_x - radius, center_y - radius, 
                     center_x + radius, center_y + radius],
                    fill=hex_to_rgb(COLORS['orange']) + (alpha,))
    
    # Central "EARN POINTS" text
    main_text = "EARN POINTS"
    bbox = draw.textbbox((0, 0), main_text, font=mega_font)
    text_width = bbox[2] - bbox[0]
    text_x = (WIDTH - text_width) // 2
    
    # Add glow effect to text
    add_text_with_outline(draw, main_text, (text_x, 140), mega_font,
                         hex_to_rgb(COLORS['gold']),
                         hex_to_rgb(COLORS['orange']), 4)
    
    # Three tier cards
    card_width = 280
    card_height = 160
    card_y = 300
    gap = 50
    
    total_width = (card_width * 3) + (gap * 2)
    start_x = (WIDTH - total_width) // 2
    
    tiers = [
        {'name': 'Standard Swap', 'mult': '1x', 'color': COLORS['muted_gray'], 'glow': False},
        {'name': 'Privacy Swap', 'mult': '2.5x', 'color': COLORS['electric_blue'], 'glow': True},
        {'name': 'Provide Liquidity', 'mult': '7x', 'color': COLORS['gold'], 'glow': True, 'best': True},
    ]
    
    for i, tier in enumerate(tiers):
        card_x = start_x + (i * (card_width + gap))
        
        # Draw card with glow for important ones
        border_width = 3 if tier.get('glow') else 2
        
        draw.rectangle([card_x, card_y, card_x + card_width, card_y + card_height],
                      fill=hex_to_rgb(COLORS['dark_secondary']),
                      outline=hex_to_rgb(tier['color']), width=border_width)
        
        # Best value ribbon
        if tier.get('best'):
            ribbon_height = 30
            draw.rectangle([card_x, card_y, card_x + card_width, card_y + ribbon_height],
                          fill=hex_to_rgb(COLORS['gold']))
            ribbon_text = "BEST VALUE"
            bbox = draw.textbbox((0, 0), ribbon_text, font=small_font)
            r_width = bbox[2] - bbox[0]
            draw.text((card_x + (card_width - r_width) // 2, card_y + 5),
                     ribbon_text, font=small_font, fill=hex_to_rgb(COLORS['darkest']))
        
        # Multiplier badge (top right)
        badge_size = 50
        badge_x = card_x + card_width - badge_size - 10
        badge_y = card_y + 10
        draw.ellipse([badge_x, badge_y, badge_x + badge_size, badge_y + badge_size],
                    fill=hex_to_rgb(tier['color']))
        
        mult_text = tier['mult']
        bbox = draw.textbbox((0, 0), mult_text, font=title_font)
        m_width = bbox[2] - bbox[0]
        m_height = bbox[3] - bbox[1]
        draw.text((badge_x + (badge_size - m_width) // 2,
                  badge_y + (badge_size - m_height) // 2 - 5),
                 mult_text, font=title_font, fill=hex_to_rgb(COLORS['white']))
        
        # Icon placeholder (simplified icon)
        icon_y = card_y + 50
        icon_size = 50
        icon_x = card_x + (card_width - icon_size) // 2
        draw.ellipse([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size],
                    outline=hex_to_rgb(tier['color']), width=3)
        
        # Name
        name_y = icon_y + icon_size + 15
        bbox = draw.textbbox((0, 0), tier['name'], font=body_font)
        name_width = bbox[2] - bbox[0]
        draw.text((card_x + (card_width - name_width) // 2, name_y),
                 tier['name'], font=body_font, fill=hex_to_rgb(COLORS['white']))
    
    # Bottom CTA
    cta_text = "Check your points → decaflow.xyz/quests"
    bbox = draw.textbbox((0, 0), cta_text, font=body_font)
    cta_width = bbox[2] - bbox[0]
    draw.text(((WIDTH - cta_width) // 2, HEIGHT - 60), cta_text,
             font=body_font, fill=hex_to_rgb(COLORS['electric_blue']))
    
    # Add floating coin symbols
    coin_font = mega_font
    for pos in [(100, 150), (1050, 200), (150, 500), (1000, 450), (200, 300), (950, 350)]:
        draw.text(pos, "◆", font=body_font, fill=hex_to_rgb(COLORS['gold']) + (int(255 * 0.3),))
    
    # Save
    output_path = os.path.join(OUTPUT_DIR, "DECAFLOW_W1D3_REWARDS_EARNPOINTS_V1.png")
    img.save(output_path, 'PNG')
    print(f"✓ Saved: {output_path}")
    return output_path

# ============================================================================
# DAY 4: WHY DEFI KEEPS FAILING RETAIL
# ============================================================================
def generate_day4_whales_vs_retail():
    """Generate Day 4 graphic - Why DeFi Keeps Failing Retail"""
    print("Generating Day 4: Why DeFi Keeps Failing Retail...")
    
    # Create base
    img = Image.new('RGB', (WIDTH, HEIGHT), hex_to_rgb(COLORS['darkest']))
    draw = ImageDraw.Draw(img)
    
    try:
        header_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42)
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except:
        header_font = title_font = body_font = small_font = ImageFont.load_default()
    
    # Split screen - green overlay left, red overlay right
    left_overlay = Image.new('RGBA', (WIDTH // 2, HEIGHT), 
                             hex_to_rgb(COLORS['success_green']) + (int(255 * 0.1),))
    right_overlay = Image.new('RGBA', (WIDTH // 2, HEIGHT), 
                              hex_to_rgb(COLORS['alert_red']) + (int(255 * 0.1),))
    
    img = img.convert('RGBA')
    img.paste(left_overlay, (0, 0), left_overlay)
    img.paste(right_overlay, (WIDTH // 2, 0), right_overlay)
    img = img.convert('RGB')
    draw = ImageDraw.Draw(img)
    
    # Center dividing line
    center_x = WIDTH // 2
    draw.line([(center_x, 0), (center_x, HEIGHT)], 
             fill=hex_to_rgb(COLORS['white']), width=4)
    
    # Left side - WHALES
    whale_title = "WHALES"
    bbox = draw.textbbox((0, 0), whale_title, font=title_font)
    title_width = bbox[2] - bbox[0]
    draw.text((center_x // 2 - title_width // 2, 60), whale_title,
             font=title_font, fill=hex_to_rgb(COLORS['white']))
    
    # Whale advantages
    advantages = [
        "✓ Better data",
        "✓ Faster execution",
        "✓ Private order flow",
        "✓ Direct validator relationships"
    ]
    
    y_offset = 180
    for adv in advantages:
        draw.text((80, y_offset), adv, font=body_font, 
                 fill=hex_to_rgb(COLORS['success_green']))
        y_offset += 80
    
    # Right side - RETAIL
    retail_title = "RETAIL"
    bbox = draw.textbbox((0, 0), retail_title, font=title_font)
    title_width = bbox[2] - bbox[0]
    draw.text((center_x + center_x // 2 - title_width // 2, 60), retail_title,
             font=title_font, fill=hex_to_rgb(COLORS['white']))
    
    # Retail disadvantages
    disadvantages = [
        "✗ A Metamask wallet",
        "✗ High gas fees",
        "✗ Public mempool exposure",
        "✗ Front-run by bots"
    ]
    
    y_offset = 180
    for dis in disadvantages:
        draw.text((center_x + 80, y_offset), dis, font=body_font,
                 fill=hex_to_rgb(COLORS['alert_red']))
        y_offset += 80
    
    # Center scale icon (unbalanced)
    scale_y = HEIGHT // 2 - 50
    scale_size = 120
    scale_x = center_x - scale_size // 2
    
    # Draw circle background for scale
    draw.ellipse([scale_x, scale_y, scale_x + scale_size, scale_y + scale_size],
                fill=hex_to_rgb(COLORS['darkest']),
                outline=hex_to_rgb(COLORS['white']), width=3)
    
    # Draw simple unbalanced scale
    # Center pivot
    pivot_x = center_x
    pivot_y = scale_y + scale_size // 2
    
    # Left side (heavy/down)
    draw.line([(pivot_x - 40, pivot_y + 20), (pivot_x, pivot_y)], 
             fill=hex_to_rgb(COLORS['white']), width=4)
    
    # Right side (light/up)
    draw.line([(pivot_x, pivot_y), (pivot_x + 40, pivot_y - 20)], 
             fill=hex_to_rgb(COLORS['white']), width=4)
    
    # Bottom tagline
    tagline = "It's not a fair fight."
    bbox = draw.textbbox((0, 0), tagline, font=header_font)
    tag_width = bbox[2] - bbox[0]
    draw.text(((WIDTH - tag_width) // 2, HEIGHT - 80), tagline,
             font=header_font, fill=hex_to_rgb(COLORS['white']))
    
    # Save
    output_path = os.path.join(OUTPUT_DIR, "DECAFLOW_W1D4_AUTHORITY_WHALESVSRETAIL_V1.png")
    img.save(output_path, 'PNG')
    print(f"✓ Saved: {output_path}")
    return output_path

# ============================================================================
# DAY 5: DECAFLOW FOR DEVELOPERS
# ============================================================================
def generate_day5_developers():
    """Generate Day 5 graphic - DecaFlow for Developers"""
    print("Generating Day 5: DecaFlow for Developers...")
    
    # Create base
    img = Image.new('RGB', (WIDTH, HEIGHT), hex_to_rgb('#060810'))
    draw = ImageDraw.Draw(img)
    
    try:
        header_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
        code_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 18)
        body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        header_font = code_font = body_font = small_font = ImageFont.load_default()
    
    # Code editor window
    window_x = 150
    window_y = 100
    window_width = 900
    window_height = 400
    
    # Window chrome (top bar)
    chrome_height = 40
    draw.rectangle([window_x, window_y, window_x + window_width, window_y + chrome_height],
                  fill=hex_to_rgb('#12141F'))
    
    # Window control dots
    dot_y = window_y + chrome_height // 2
    for i, color in enumerate(['#FF5F56', '#FFBD2E', '#27C93F']):
        dot_x = window_x + 15 + (i * 20)
        draw.ellipse([dot_x - 6, dot_y - 6, dot_x + 6, dot_y + 6], fill=hex_to_rgb(color))
    
    # File name
    filename = "privacy-integration.ts"
    draw.text((window_x + 100, window_y + 12), filename, font=small_font,
             fill=hex_to_rgb(COLORS['muted_gray']))
    
    # Code area
    code_y = window_y + chrome_height
    code_height = window_height - chrome_height
    
    # Line number gutter
    gutter_width = 50
    draw.rectangle([window_x, code_y, window_x + gutter_width, code_y + code_height],
                  fill=hex_to_rgb('#0D0F18'))
    draw.line([(window_x + gutter_width, code_y), 
              (window_x + gutter_width, code_y + code_height)],
             fill=hex_to_rgb(COLORS['dark_tertiary']), width=1)
    
    # Line numbers
    for i in range(1, 7):
        line_y = code_y + 20 + (i * 40)
        draw.text((window_x + 20, line_y), str(i), font=code_font,
                 fill=hex_to_rgb('#4B5563'))
    
    # Code background
    draw.rectangle([window_x + gutter_width, code_y, 
                   window_x + window_width, code_y + code_height],
                  fill=hex_to_rgb('#0D0F18'))
    
    # Code content (syntax highlighted)
    code_x = window_x + gutter_width + 20
    line_height = 40
    
    # Line 1
    line_y = code_y + 60
    draw.text((code_x, line_y), "import", font=code_font, fill=hex_to_rgb('#C586C0'))
    draw.text((code_x + 80, line_y), "{ createPrivacyClient }", font=code_font, 
             fill=hex_to_rgb('#DCDCAA'))
    draw.text((code_x + 320, line_y), "from", font=code_font, fill=hex_to_rgb('#C586C0'))
    draw.text((code_x + 380, line_y), "'@decaflow/privacy-sdk'", font=code_font, 
             fill=hex_to_rgb('#CE9178'))
    
    # Line 3
    line_y += line_height * 2
    draw.text((code_x, line_y), "const", font=code_font, fill=hex_to_rgb('#569CD6'))
    draw.text((code_x + 80, line_y), "privacy = createPrivacyClient({", font=code_font,
             fill=hex_to_rgb('#9CDCFE'))
    
    # Line 4
    line_y += line_height
    draw.text((code_x + 40, line_y), "network:", font=code_font, fill=hex_to_rgb('#9CDCFE'))
    draw.text((code_x + 170, line_y), "'arbitrum'", font=code_font, fill=hex_to_rgb('#CE9178'))
    draw.text((code_x + 280, line_y), "});", font=code_font, fill=hex_to_rgb('#D4D4D4'))
    
    # Line 5
    line_y += line_height
    draw.text((code_x, line_y), "await", font=code_font, fill=hex_to_rgb('#C586C0'))
    draw.text((code_x + 80, line_y), "privacy.executeSwap(...);", font=code_font,
             fill=hex_to_rgb('#DCDCAA'))
    
    # Feature badges at bottom
    badge_y = window_y + window_height + 60
    badges = [
        ("6 Chains", COLORS['electric_blue']),
        ("Open Source", COLORS['success_green']),
        ("Free Tier", COLORS['electric_blue']),
    ]
    
    badge_width = 200
    gap = 40
    total_width = (badge_width * 3) + (gap * 2)
    badge_x = (WIDTH - total_width) // 2
    
    for text, color in badges:
        draw.rectangle([badge_x, badge_y, badge_x + badge_width, badge_y + 40],
                      fill=hex_to_rgb(COLORS['dark_secondary']),
                      outline=hex_to_rgb(color), width=2)
        
        bbox = draw.textbbox((0, 0), text, font=body_font)
        text_width = bbox[2] - bbox[0]
        draw.text((badge_x + (badge_width - text_width) // 2, badge_y + 10),
                 text, font=body_font, fill=hex_to_rgb(COLORS['white']))
        
        badge_x += badge_width + gap
    
    # CTA
    cta_text = "Read the Docs → decaflow.xyz/sdk"
    bbox = draw.textbbox((0, 0), cta_text, font=body_font)
    cta_width = bbox[2] - bbox[0]
    draw.text(((WIDTH - cta_width) // 2, HEIGHT - 40), cta_text,
             font=body_font, fill=hex_to_rgb(COLORS['electric_blue']))
    
    # Save
    output_path = os.path.join(OUTPUT_DIR, "DECAFLOW_W1D5_PRODUCT_DEVELOPERS_V1.png")
    img.save(output_path, 'PNG')
    print(f"✓ Saved: {output_path}")
    return output_path

# ============================================================================
# DAY 6: WEEKLY LEADERBOARD RESET
# ============================================================================
def generate_day6_leaderboard():
    """Generate Day 6 graphic - Weekly Leaderboard Reset"""
    print("Generating Day 6: Weekly Leaderboard Reset...")
    
    # Create base with urgent red tint
    img = create_gradient_background(WIDTH, HEIGHT, 
                                     hex_to_rgb(COLORS['darkest']), 
                                     hex_to_rgb(COLORS['dark_secondary']))
    
    # Add red overlay for urgency
    red_overlay = Image.new('RGBA', (WIDTH, HEIGHT), 
                            hex_to_rgb(COLORS['alert_red']) + (int(255 * 0.08),))
    img = img.convert('RGBA')
    img.paste(red_overlay, (0, 0), red_overlay)
    img = img.convert('RGB')
    
    draw = ImageDraw.Draw(img)
    
    try:
        mega_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
        body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    except:
        mega_font = title_font = body_font = small_font = ImageFont.load_default()
    
    # Countdown timer (top center)
    timer_width = 400
    timer_height = 120
    timer_x = (WIDTH - timer_width) // 2
    timer_y = 60
    
    # Timer box with urgent styling
    draw.rectangle([timer_x, timer_y, timer_x + timer_width, timer_y + timer_height],
                  fill=hex_to_rgb(COLORS['dark_secondary']),
                  outline=hex_to_rgb(COLORS['orange']), width=4)
    
    # Timer label
    label = "RESETS IN"
    bbox = draw.textbbox((0, 0), label, font=small_font)
    label_width = bbox[2] - bbox[0]
    draw.text((timer_x + (timer_width - label_width) // 2, timer_y + 15),
             label, font=small_font, fill=hex_to_rgb(COLORS['white']))
    
    # Timer number
    time_text = "48 HOURS"
    bbox = draw.textbbox((0, 0), time_text, font=mega_font)
    time_width = bbox[2] - bbox[0]
    add_text_with_outline(draw, time_text, 
                         (timer_x + (timer_width - time_width) // 2, timer_y + 45),
                         mega_font, hex_to_rgb(COLORS['white']),
                         hex_to_rgb(COLORS['alert_red']), 2)
    
    # Podium
    podium_y = 260
    podium_heights = [120, 160, 100]  # 2nd, 1st, 3rd
    podium_width = 150
    gap = 30
    
    colors_podium = [
        hex_to_rgb('#C0C0C0'),  # Silver
        hex_to_rgb(COLORS['gold']),  # Gold
        hex_to_rgb('#CD7F32'),  # Bronze
    ]
    
    positions = [2, 1, 3]
    
    total_width = (podium_width * 3) + (gap * 2)
    start_x = (WIDTH - total_width) // 2
    
    for i, (height, color, pos) in enumerate(zip(podium_heights, colors_podium, positions)):
        podium_x = start_x + (i * (podium_width + gap))
        podium_bottom = podium_y + max(podium_heights)
        podium_top = podium_bottom - height
        
        # Draw podium
        draw.rectangle([podium_x, podium_top, podium_x + podium_width, podium_bottom],
                      fill=color, outline=color, width=3)
        
        # Position number
        pos_text = f"#{pos}"
        bbox = draw.textbbox((0, 0), pos_text, font=title_font)
        pos_width = bbox[2] - bbox[0]
        draw.text((podium_x + (podium_width - pos_width) // 2, podium_top + 20),
                 pos_text, font=title_font, fill=hex_to_rgb(COLORS['darkest']))
        
        # Crown for 1st place
        if pos == 1:
            crown_text = "👑"
            bbox = draw.textbbox((0, 0), crown_text, font=title_font)
            crown_width = bbox[2] - bbox[0]
            draw.text((podium_x + (podium_width - crown_width) // 2, podium_top - 50),
                     crown_text, font=title_font)
    
    # Gap indicator card
    gap_card_width = 320
    gap_card_height = 120
    gap_card_x = (WIDTH - gap_card_width) // 2
    gap_card_y = 470
    
    draw.rectangle([gap_card_x, gap_card_y, 
                   gap_card_x + gap_card_width, gap_card_y + gap_card_height],
                  fill=hex_to_rgb(COLORS['dark_secondary']),
                  outline=hex_to_rgb(COLORS['orange']), width=3)
    
    # Gap number
    gap_text = "3 SWAPS"
    bbox = draw.textbbox((0, 0), gap_text, font=mega_font)
    gap_width = bbox[2] - bbox[0]
    draw.text((gap_card_x + (gap_card_width - gap_width) // 2, gap_card_y + 15),
             gap_text, font=mega_font, fill=hex_to_rgb(COLORS['white']))
    
    # Gap label
    gap_label = "between #10 and #11"
    bbox = draw.textbbox((0, 0), gap_label, font=body_font)
    gap_label_width = bbox[2] - bbox[0]
    draw.text((gap_card_x + (gap_card_width - gap_label_width) // 2, gap_card_y + 90),
             gap_label, font=body_font, fill=hex_to_rgb(COLORS['secondary_gray']))
    
    # CTA
    cta_text = "CHECK YOUR RANK"
    bbox = draw.textbbox((0, 0), cta_text, font=title_font)
    cta_width = bbox[2] - bbox[0]
    cta_height = bbox[3] - bbox[1]
    
    cta_x = (WIDTH - cta_width) // 2 - 20
    cta_y = HEIGHT - 100
    
    # CTA button
    draw.rectangle([cta_x - 30, cta_y - 15, cta_x + cta_width + 30, cta_y + cta_height + 15],
                  fill=hex_to_rgb(COLORS['electric_blue']))
    
    draw.text((cta_x, cta_y), cta_text, font=title_font, fill=hex_to_rgb(COLORS['darkest']))
    
    # URL below
    url_text = "decaflow.xyz/leaderboard"
    bbox = draw.textbbox((0, 0), url_text, font=body_font)
    url_width = bbox[2] - bbox[0]
    draw.text(((WIDTH - url_width) // 2, HEIGHT - 50), url_text,
             font=body_font, fill=hex_to_rgb(COLORS['electric_blue']))
    
    # Save
    output_path = os.path.join(OUTPUT_DIR, "DECAFLOW_W1D6_REWARDS_LEADERBOARD_V1.png")
    img.save(output_path, 'PNG')
    print(f"✓ Saved: {output_path}")
    return output_path

# ============================================================================
# DAY 7: THE INVISIBLE TAX ON EVERY DEFI TRADE
# ============================================================================
def generate_day7_hidden_costs():
    """Generate Day 7 graphic - The Invisible Tax on Every DeFi Trade"""
    print("Generating Day 7: The Invisible Tax on Every DeFi Trade...")
    
    # Create base
    img = create_gradient_background(WIDTH, HEIGHT, 
                                     hex_to_rgb(COLORS['darkest']), 
                                     hex_to_rgb(COLORS['dark_secondary']))
    draw = ImageDraw.Draw(img)
    
    try:
        header_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        mega_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        header_font = mega_font = title_font = body_font = small_font = ImageFont.load_default()
    
    # Title
    title = "THE INVISIBLE TAX"
    bbox = draw.textbbox((0, 0), title, font=header_font)
    title_width = bbox[2] - bbox[0]
    draw.text(((WIDTH - title_width) // 2, 40), title,
             font=header_font, fill=hex_to_rgb(COLORS['white']))
    
    # Left box - Expected
    left_box_width = 250
    left_box_height = 120
    left_box_x = 150
    left_box_y = 140
    
    draw.rectangle([left_box_x, left_box_y, 
                   left_box_x + left_box_width, left_box_y + left_box_height],
                  fill=hex_to_rgb(COLORS['dark_secondary']),
                  outline=hex_to_rgb(COLORS['success_green']), width=3)
    
    draw.text((left_box_x + 20, left_box_y + 15), "EXPECTED", font=small_font,
             fill=hex_to_rgb(COLORS['secondary_gray']))
    
    expected_text = "1000"
    bbox = draw.textbbox((0, 0), expected_text, font=mega_font)
    exp_width = bbox[2] - bbox[0]
    draw.text((left_box_x + (left_box_width - exp_width) // 2, left_box_y + 45),
             expected_text, font=mega_font, fill=hex_to_rgb(COLORS['white']))
    
    draw.text((left_box_x + left_box_width - 70, left_box_y + 80), "USDC", font=body_font,
             fill=hex_to_rgb(COLORS['secondary_gray']))
    
    # Right box - Received
    right_box_x = WIDTH - 150 - left_box_width
    
    draw.rectangle([right_box_x, left_box_y, 
                   right_box_x + left_box_width, left_box_y + left_box_height],
                  fill=hex_to_rgb(COLORS['dark_secondary']),
                  outline=hex_to_rgb(COLORS['alert_red']), width=3)
    
    draw.text((right_box_x + 20, left_box_y + 15), "RECEIVED", font=small_font,
             fill=hex_to_rgb(COLORS['secondary_gray']))
    
    received_text = "920"
    bbox = draw.textbbox((0, 0), received_text, font=mega_font)
    rec_width = bbox[2] - bbox[0]
    draw.text((right_box_x + (left_box_width - rec_width) // 2, left_box_y + 45),
             received_text, font=mega_font, fill=hex_to_rgb(COLORS['alert_red']))
    
    draw.text((right_box_x + left_box_width - 70, left_box_y + 80), "USDC", font=body_font,
             fill=hex_to_rgb(COLORS['secondary_gray']))
    
    # Arrow connecting boxes
    arrow_y = left_box_y + left_box_height // 2
    draw.line([(left_box_x + left_box_width + 20, arrow_y),
              (right_box_x - 20, arrow_y)],
             fill=hex_to_rgb(COLORS['muted_gray']), width=3)
    
    # Arrow head
    draw.polygon([(right_box_x - 20, arrow_y),
                  (right_box_x - 40, arrow_y - 10),
                  (right_box_x - 40, arrow_y + 10)],
                fill=hex_to_rgb(COLORS['muted_gray']))
    
    # Cost breakdown (layered bars)
    breakdown_y = 320
    bar_width = 800
    bar_x = (WIDTH - bar_width) // 2
    
    costs = [
        {"label": "Protocol Fee (0.3%)", "amount": "$3", "width": 30, "color": COLORS['muted_gray']},
        {"label": "Slippage (0.5-2%)", "amount": "$5-20", "width": 80, "color": COLORS['orange']},
        {"label": "MEV Extraction (0.3-5%)", "amount": "$3-50", "width": 150, "color": COLORS['alert_red']},
        {"label": "Gas Fees ($1-50)", "amount": "$30", "width": 100, "color": COLORS['orange']},
        {"label": "Bridge Fees (0.1-1%)", "amount": "$7", "width": 60, "color": COLORS['deep_purple']},
    ]
    
    current_x = bar_x
    bar_height = 50
    
    for cost in costs:
        # Draw bar segment
        draw.rectangle([current_x, breakdown_y, 
                       current_x + cost['width'], breakdown_y + bar_height],
                      fill=hex_to_rgb(cost['color']),
                      outline=hex_to_rgb(COLORS['darkest']), width=2)
        
        current_x += cost['width']
    
    # Cost labels below
    label_y = breakdown_y + bar_height + 20
    current_x = bar_x
    
    for cost in costs:
        # Rotate labels or show vertically
        label_lines = cost['label'].split(' ')
        for i, line in enumerate(label_lines):
            draw.text((current_x + 5, label_y + (i * 18)), line, 
                     font=small_font, fill=hex_to_rgb(COLORS['secondary_gray']))
        
        current_x += cost['width']
    
    # Total loss indicator
    total_box_width = 350
    total_box_height = 80
    total_box_x = (WIDTH - total_box_width) // 2
    total_box_y = 520
    
    draw.rectangle([total_box_x, total_box_y, 
                   total_box_x + total_box_width, total_box_y + total_box_height],
                  fill=hex_to_rgb(COLORS['dark_secondary']),
                  outline=hex_to_rgb(COLORS['alert_red']), width=3)
    
    draw.text((total_box_x + 20, total_box_y + 15), "TOTAL HIDDEN COST:", 
             font=body_font, fill=hex_to_rgb(COLORS['secondary_gray']))
    
    total_text = "2-10% ($80)"
    bbox = draw.textbbox((0, 0), total_text, font=title_font)
    total_width = bbox[2] - bbox[0]
    draw.text((total_box_x + (total_box_width - total_width) // 2, total_box_y + 45),
             total_text, font=title_font, fill=hex_to_rgb(COLORS['alert_red']))
    
    # Bottom quote
    quote = "Most users don't see these costs broken down."
    bbox = draw.textbbox((0, 0), quote, font=body_font)
    quote_width = bbox[2] - bbox[0]
    draw.text(((WIDTH - quote_width) // 2, HEIGHT - 60), quote,
             font=body_font, fill=hex_to_rgb(COLORS['secondary_gray']))
    
    # Save
    output_path = os.path.join(OUTPUT_DIR, "DECAFLOW_W1D7_AUTHORITY_HIDDENCOSTS_V1.png")
    img.save(output_path, 'PNG')
    print(f"✓ Saved: {output_path}")
    return output_path

# ============================================================================
# MAIN EXECUTION
# ============================================================================
def main():
    """Generate all graphics"""
    print("\n" + "="*60)
    print("DECAFLOW WEEK 1 GRAPHICS GENERATOR")
    print("="*60 + "\n")
    
    print(f"Output directory: {OUTPUT_DIR}\n")
    
    graphics = []
    
    # Generate all 7 days
    graphics.append(generate_day1_trust())
    graphics.append(generate_day2_products())
    graphics.append(generate_day3_rewards())
    graphics.append(generate_day4_whales_vs_retail())
    graphics.append(generate_day5_developers())
    graphics.append(generate_day6_leaderboard())
    graphics.append(generate_day7_hidden_costs())
    
    print("\n" + "="*60)
    print(f"✓ ALL GRAPHICS GENERATED SUCCESSFULLY!")
    print("="*60)
    print(f"\nTotal graphics created: {len(graphics)}")
    print(f"Location: {OUTPUT_DIR}\n")
    
    for i, path in enumerate(graphics, 1):
        print(f"  {i}. {os.path.basename(path)}")
    
    print("\n")

if __name__ == "__main__":
    main()
