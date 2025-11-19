# DecaFlow UI/UX Specification Document
## Replicating ChainSwap.tech for Arbitrum-Powered DeFi

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Marketing Website (Landing Page)](#marketing-website-landing-page)
3. [DApp Interface (Swap Application)](#dapp-interface-swap-application)
4. [Revenue Dashboard](#revenue-dashboard)
5. [Design System & Branding](#design-system--branding)
6. [Technical Stack Recommendations](#technical-stack-recommendations)
7. [Implementation Priority](#implementation-priority)

---

## Project Overview

**Project Name:** DecaFlow  
**Current URL:** https://decaflow.vercel.app  
**Reference Site:** https://www.chainswap.tech  
**Key Difference:** DecaFlow is powered by Arbitrum blockchain, while ChainSwap uses Chainlink CCIP

### Objective
Replicate the exact UI/UX of ChainSwap.tech for DecaFlow, maintaining identical visual design, layout, animations, and user interactions, while replacing Chainlink-specific branding and messaging with Arbitrum-focused content.

---

## Marketing Website (Landing Page)

### 1. HEADER / NAVIGATION

#### Desktop Navigation
```
Layout: Horizontal navigation bar, fixed at top
Background: Semi-transparent dark blue gradient (rgba overlay)
Height: ~70px

Components:
- Logo (Left): "DECAFLOW" logo with icon
- Navigation Links (Center):
  * Home (active)
  * Documentation (links to #docs or external)
  * Features (anchor to #features)
  * Roadmap (anchor to #roadmap)
- CTA Buttons (Right):
  * "ENTER DAPP" → Primary button, blue gradient
  * Settings icon → Opens settings modal
```

#### Mobile Navigation
```
- Hamburger menu icon (top right)
- When clicked, opens full-screen overlay menu
- Same links as desktop, stacked vertically
- Close icon (X) at top right
- Background: Dark blue with slight blur effect
```

---

### 2. HERO SECTION

#### Badge Component (Top of hero)
```
Style: Pill-shaped badge with arrow
Background: Dark semi-transparent with blue border
Text: "DECAFLOW | Powered by Arbitrum" 
Icon: Right-pointing arrow
Animation: Subtle glow effect on hover
```

#### Main Headline
```
Text: "Defy Limits
       Embrace Anonymity"
       
Font: Extra bold, very large (80-100px desktop)
Color: White with slight blue glow
Text Shadow: Multiple layers for depth effect
Line Height: 1.1
Letter Spacing: -1px
Animation: Fade in from bottom on load
```

#### Subheadline
```
Text: "Where Privacy Meets Secure Cross-Chain Swaps"
Font: Regular weight, medium size (20-24px)
Color: Light blue-gray (#A8B1B1)
Position: Centered below headline
Margin: 24px top
```

#### CTA Button
```
Text: "Access Platform"
Style: Large gradient button
  - Background: Linear gradient (Blue #3396FF to Cyan #47A1FF)
  - Border Radius: 12px
  - Padding: 18px 48px
  - Font: Bold, 18px
  - Shadow: Multiple layers for 3D effect
  - Hover: Slight scale up (1.05), increased glow
  - Cursor: Pointer
```

#### Background
```
- Deep dark blue gradient (#0A0E27 to #141B3D)
- Animated particle system (floating dots/orbs)
- Subtle grid lines overlay
- Video background option: Looping abstract animation
  * Play/Pause control button (bottom right of video)
  * Muted by default
```

---

### 3. STATS SECTION

#### Layout
```
Position: Below hero, full-width
Background: Slightly lighter than hero
Padding: 80px vertical

Three columns (responsive to 1 column on mobile):
[Total Trades] [Total Volume] [Total Wallets]
```

#### Individual Stat Card
```
Structure per card:
- Large number (60-80px, bold, white)
- Label below (18px, gray)
- Animated counting effect on scroll into view
- Subtle card hover effect (slight elevation)

Example Values:
- Total Trades: "3,590+"
- Total Volume: "$10,560,000+"
- Total Wallets: "1,820+"

Animation: Count up from 0 when card enters viewport
Transition: Smooth, 2 second duration
```

#### Partner Logos Carousel
```
Position: Below stats
Layout: Infinite horizontal scroll

Logos to include:
- Arbitrum (primary network)
- Ethereum
- Polygon
- Avalanche  
- Binance Smart Chain
- Optimism
- Base
- Additional DEX/protocol partners

Animation: Continuous left scroll
  - No pause between loops
  - Seamless transition
  - Hover: Pause animation
  - Speed: Slow, ~30 seconds per full loop
```

---

### 4. MOBILE HERO VARIANT

#### Second Hero Section (Mobile-Specific)
```
**Note:** ChainSwap has a second, simplified hero for mobile viewports

Headline: "Defy Limits
          Embrace Anonymity"
Subheadline: "Where Privacy Meets Secure Cross Chain Swaps"
CTA: "Access Platform"

Stats:
- 33,000+ Total Trades
- $44,000,000+ Total Volume  
- 1,400+ Total Users

Blockchain Icons:
- Displayed as row of logos (OP, POLY, AVAX, BSC, etc.)
- Smaller than desktop version
```

---

### 5. "INTRODUCING DECAFLOW" SECTION

#### Section Header
```
Headline: "Introducing DecaFlow"
Subheadline: "A New Era of Interoperability and Privacy"

Font: Bold, 48px
Color: White
Text Align: Center
Margin Bottom: 60px
```

#### Three Feature Cards

##### Card Structure (Repeated 3 times)
```
Layout: Three columns (stacks on mobile)
Card Style:
  - Background: Dark blue gradient with border
  - Border: 1px solid rgba(71, 161, 255, 0.2)
  - Border Radius: 16px
  - Padding: 40px
  - Hover: Border glows, card elevates slightly
  
Each card has:
  - Icon/Illustration (top)
    * Size: 80x80px minimum
    * Style: Isometric 3D style
  - Title (24px, bold, white)
  - Description (16px, light gray, line height 1.6)
```

##### Card 1: Integration Challenges
```
Icon: Abstract network/chain breaking illustration
Title: "Integration Challenges"
Content: "Web3's evolution requires asset movement across blockchains, 
however, the fragmented ecosystem is complex and risky, hindering 
widespread crypto adoption."
```

##### Card 2: DecaFlow Solution
```
Icon: Shield with checkmark or bridge illustration
Title: "DecaFlow Solution"
Content: "DecaFlow bridges blockchains using advanced security protocols 
optimized for Arbitrum. This ensures a highly secure environment for 
cross-chain transactions, facilitating secure asset transfers."
```

##### Card 3: Simplified Transactions
```
Icon: Lightning bolt or simplified flow illustration  
Title: "Simplified Transactions"
Content: "DecaFlow supports secure swaps through a multi-chain DEX. It 
enables cross-chain swaps, privacy-focused transactions, and smooth 
token distribution in one environment."
```

---

### 6. "WHAT DO WE DO?" SECTION

#### Section Header
```
Headline: "What do we do?"
Subheadline: "DecaFlow is recognized as a trusted, private, and secure 
platform for multichain and privacy swaps."

Style: Same as "Introducing" section
```

#### Tab Navigation Component

##### Tab Structure
```
Layout: Vertical tabs on left, content on right (desktop)
        Stacked tabs on mobile

Tab List (Left Side):
- Cross Chain Swap
- Telegram Bot
- Privacy Swap
- Multichain DEX

Active Tab Style:
  - Blue gradient background
  - White text
  - Left border accent (4px, bright blue)
  
Inactive Tab Style:
  - Transparent background
  - Gray text
  - Hover: Slight blue tint
```

##### Tab Content (Right Side)

**Tab 1: Cross Chain Swap**
```
Content:
"Embrace interoperability and unlock the full potential of DeFi with 
DecaFlow's Cross Chain Swap utilizing Arbitrum's infrastructure and 
bridging protocols to trade any token effortlessly between various 
leading blockchains, all within a single platform."

Visual: Large illustration/graphic showing cross-chain swap flow
```

**Tab 2: Telegram Bot**
```
Content:
"DecaFlow prioritizes user efficiency by incorporating technology built 
upon next-generation infrastructure into our Telegram Bot."

Visual: Telegram bot interface mockup or illustration
```

**Tab 3: Privacy Swap**
```
Content:
"Unlike traditional swaps that leave visibility to all, DecaFlow 
utilizes advanced techniques to ensure Privacy and complete anonymity 
throughout the entire Swap process."

Visual: Privacy/anonymity themed illustration
```

**Tab 4: Multichain DEX**
```
Content:
"Ditch the limitations of single-chain DEXs. DecaFlow shatters the walls, 
allowing you to trade tokens, protocols, and manage liquidity freely 
across multiple blockchains for unparalleled access and opportunity."

Visual: Multi-chain network illustration
```

---

### 7. PROTOCOL INTEGRATION SECTIONS

#### Section A: Arbitrum Integration
```
**Replaces ChainSwap's CCIP section**

Layout: Image left, content right (reverses on mobile)

Heading: "Integrating Arbitrum's Layer 2 Scaling Solution"

Content:
"DecaFlow leverages Arbitrum's cutting-edge Layer 2 technology for 
secure and efficient cross-chain swaps. This innovative protocol boasts 
industry-leading security through its decentralized network and 
optimistic rollup architecture, allowing for the seamless transfer of 
both data and tokens between blockchains with minimal fees and maximum 
speed."

Image: 3D isometric illustration showing:
  - Arbitrum network nodes
  - Connected blockchain networks
  - Data flow visualization
  - Blue/cyan color scheme
  
Style: Dark background card with glowing blue border
Card ID/Anchor: #CardArbitrum
```

#### Section B: Bridge Protocol Integration
```
**Replaces ChainSwap's CCTP section**

Layout: Content left, image right (opposite of Section A)

Heading: "Multi-Protocol Bridging - CCTP, CCIP & Socket"

Content:
"DecaFlow supports multiple bridging protocols for maximum flexibility. 
Circle's CCTP eliminates the need for complex conversions by facilitating 
direct USDC swaps between supported blockchains. Combined with Chainlink's 
CCIP and Socket aggregator, we offer the most comprehensive bridging 
solution with a reliable burn and mint mechanism. Our protocol streamlines 
transactions, minimizing processing times and fees, allowing users to swap 
assets across chains efficiently and cost-effectively."

Image: 3D isometric illustration showing:
  - USDC token burn/mint mechanism
  - Multiple bridge connections
  - Security shield iconography
  
Card ID/Anchor: #CardBridge
```

---

### 8. INTRA-CHAIN SWAPS SECTION

#### Layout
```
Background: Slightly darker section to create visual break
Padding: 100px vertical

Heading: "Intra-Chain Swaps and Future Multi-Chain DEX"
Subheading: "Swap tokens directly on any of the supported blockchains 
that DecaFlow integrates including Arbitrum, Ethereum, Avalanche, Binance 
Smart Chain, Optimism, Polygon, and Base."
```

#### Visual Element
```
Animated blockchain logo carousel:
- Display network logos in a flowing pattern
- Logos: Arbitrum (prominent), ETH, AVAX, BSC, OP, POLY, BASE
- Animation: Floating effect, subtle rotation
- Glow effect on each logo
- Connected by animated lines/paths
```

#### CTA
```
Button: "Learn More"
Style: Secondary button (outline style)
  - Border: 2px solid blue
  - Background: Transparent
  - Text: White
  - Hover: Fill with blue gradient
Link: Points to documentation or feature details
```

---

### 9. FOOTER

#### Footer Structure
```
Background: Very dark blue/black (#0A0E1F)
Padding: 80px vertical, 60px horizontal
Border Top: 1px solid rgba(71, 161, 255, 0.1)
```

#### Footer Layout (4 Columns)

##### Column 1: Brand
```
- DecaFlow logo (larger version)
- Tagline: "Where Privacy Meets Secure Cross Chain Swaps"
- Social media icons (row):
  * Twitter/X
  * Telegram
  * Discord  
  * Medium
  * GitHub
  * Etherscan (contract link)
  
Icon Style:
  - Size: 32x32px
  - Color: Gray, hover → Blue
  - Spacing: 12px between icons
```

##### Column 2: Find Us
```
Heading: "Find Us"

Links:
- CoinMarketCap
- CoinGecko  
- DexScreener
- DexTools
- Arbitrum Explorer

Style:
  - Font: 14px, gray
  - Hover: Blue, underline
  - Line Height: 2
```

##### Column 3: Socials
```
Heading: "Socials"

Links:
- Telegram
- Twitter/X
- Discord
- Medium
- LinkTree

Style: Same as Column 2
```

##### Column 4: Website
```
Heading: "Website"

Links:
- Home
- Arbitrum Integration
- Bridge Protocols
- Statistics

Heading: "Developers"

Links:
- GitBook/Docs
- Audit Reports
- Report Bug
- Support
- List Token

Style: Same as Column 2
```

#### Footer Badge
```
Position: Center of footer, above columns
Badge: "Cross Chain SECURED WITH Arbitrum"
  - Style: Pill shape
  - Background: Dark blue with border
  - Icon: Arbitrum logo
  - Text: White, 12px
```

#### Newsletter Signup (Optional)
```
Heading: "Start using DecaFlow today"

Form:
  - Email input field
  - Submit button: "Open DApp"
  - Success message: "Thanks for joining our newsletter."
  - Error message: "Oops! Something went wrong."
  
Style:
  - Input: Dark background, light border
  - Button: Blue gradient
  - Width: Max 400px
```

#### Copyright Bar
```
Position: Bottom of footer
Background: Slightly darker than footer
Padding: 20px vertical
Text Align: Center

Content: "Website by [YourTeam] | Copyright © DecaFlow 2024 | Powered by Arbitrum"
Font: 12px, gray
```

---

## DApp Interface (Swap Application)

### Base URL
```
app.decaflow.vercel.app
OR
decaflow.app (when custom domain is set)
```

---

### 1. DAPP HEADER

#### Layout
```
Position: Fixed at top
Height: 70px
Background: Dark navy (#0F1419) with slight transparency
Border Bottom: 1px solid rgba(255,255,255,0.05)
Z-index: 999
```

#### Components (Left to Right)

##### Logo
```
- DecaFlow logo/icon
- Size: 40x40px
- Click: Returns to home/swap page
```

##### Navigation Links
```
Position: Center-left
Links:
  - Home (default/swap page)
  - Swap (main swap interface)
  - Docs (documentation)
  - Support (help/contact)
  - List Token (token listing form)
  - Revenue Share (revenue dashboard)
  
Style:
  - Font: 15px, medium weight
  - Color: Gray (#A8B1B1)
  - Active: White with blue underline
  - Hover: White
  - Spacing: 24px between links
```

##### Right Side Actions
```
Components (left to right):
1. Settings Icon
   - Icon: Gear/cog
   - Size: 24x24px
   - Color: Gray, hover → Blue
   - Click: Opens settings modal
   
2. Connect Wallet Button
   - Text: "CONNECT WALLET"
   - Background: Blue gradient
   - Border Radius: 8px
   - Padding: 10px 24px
   - Font: Bold, 14px
   - Shadow: Subtle
   - Hover: Slight scale + glow
   
   When Connected:
   - Shows shortened address (0x1234...5678)
   - Network icon on left
   - Dropdown arrow on right
   - Click: Opens wallet menu
```

---

### 2. MAIN SWAP INTERFACE

#### Container
```
Layout: Centered card
Max Width: 480px
Margin: 100px auto 60px
Background: Dark gradient (#1A1F2E to #141824)
Border: 1px solid rgba(71, 161, 255, 0.15)
Border Radius: 24px
Padding: 32px
Box Shadow: 0 20px 60px rgba(0,0,0,0.4)
```

#### Card Header
```
Layout: Flex row, space between

Left Side:
  - Text: "Swap"
  - Font: 24px, bold, white
  
Right Side:
  - Toggle: "Smart"
  - Style: Pill toggle switch
  - Background: Dark blue
  - Active: Blue gradient
  - Size: 60px x 28px
```

---

### 3. TOKEN INPUT SECTIONS

#### FROM Section (Top Input)

##### Network Selector (Dropdown)
```
Position: Top of FROM section
Style: Button-like dropdown

Components:
  - Network icon (left)
  - Network name ("Ethereum", "Arbitrum", etc.)
  - Dropdown arrow icon (right)
  
Background: Dark blue (#1E2433)
Border: 1px solid rgba(255,255,255,0.1)
Border Radius: 12px
Padding: 12px 16px
Width: 160px

Hover: Border glows blue
Click: Opens network selection modal

Dropdown Modal:
  - Full list of supported networks
  - Search bar at top
  - Network icons + names + chain IDs
  - Hover: Background highlight
  - Selected: Blue checkmark
```

##### Amount Input
```
Position: Center, large

Input Field:
  - Placeholder: "0"
  - Font Size: 36px
  - Font Weight: Bold
  - Color: White
  - Background: Transparent
  - Border: None
  - Text Align: Right
  - Width: 100%
  
Validation:
  - Only numbers and decimals
  - Max decimals based on token
  - Real-time USD conversion shown below
```

##### Token Selector Button
```
Position: Right of amount input

Default State (No token selected):
  - Text: "Select Token"
  - Icon: Generic token icon
  - Arrow: Dropdown arrow
  
Token Selected State:
  - Token icon (left)
  - Token symbol (e.g., "ETH")
  - Dropdown arrow (right)
  
Style:
  - Background: Blue gradient
  - Border Radius: 12px
  - Padding: 10px 16px
  - Font: Bold, 16px
  - Hover: Slight glow
  - Click: Opens token selection modal
```

##### Balance Display
```
Position: Below input, left side

Text: "Balance: 0.0000"
Font: 12px, gray
Click: Auto-fills max amount (acts as MAX button)
```

##### MAX Button
```
Position: Below input, next to balance

Text: "MAX"
Style: Small pill button
Background: Transparent
Border: 1px solid rgba(71, 161, 255, 0.5)
Color: Blue
Padding: 4px 12px
Font: 11px, bold
Hover: Filled blue background
Click: Sets input to maximum balance
```

##### Price Display
```
Position: Below input, right side

Text: "Price: $0.00"
Font: 12px, gray
Updates: Real-time based on input amount
```

---

#### SWAP DIRECTION BUTTON

```
Position: Between FROM and TO sections
Layout: Centered

Button Style:
  - Shape: Circle
  - Size: 48px diameter
  - Background: Dark blue gradient
  - Border: 2px solid rgba(71, 161, 255, 0.3)
  - Icon: Swap arrows (↑↓)
  - Icon Color: Blue
  - Z-index: Appears above both sections
  
Hover:
  - Rotate icon 180 degrees
  - Border glows
  - Background lightens slightly
  
Click Function:
  - Swaps FROM and TO tokens
  - Swaps FROM and TO networks
  - Maintains entered amount
  - Smooth animation (0.3s)
```

---

#### TO Section (Bottom Input)

```
**Structure: Identical to FROM section with these differences:**

Amount Input:
  - Read-only (calculated from FROM amount)
  - Shows estimated receive amount
  - Includes slippage tolerance
  - Updates in real-time as FROM amount changes
  
MAX Button:
  - Not present in TO section
  
Balance Display:
  - Shows balance of TO token on TO network
  - Not clickable (no MAX function)
```

---

### 4. SWAP DETAILS SECTION

#### Fees & Slippage Row
```
Position: Below TO section
Layout: Flex row, space between

Left Side:
  - Icon: Info icon (i in circle)
  - Text: "Fees & Slippage"
  - Font: 14px, gray
  
Right Side:
  - Value: "-$0.00" (updates with quote)
  - Font: 14px, white
  - Breakdown on hover:
    * DEX fee
    * Protocol fee
    * Network fee
    * Slippage tolerance %
```

#### Gas Row
```
Layout: Same as Fees row

Left Side:
  - Icon: Gas pump icon
  - Text: "Gas"
  
Right Side:
  - Value: "-$0.00"
  - Gwei amount in parentheses
  - Updates based on network conditions
  - Hover: Shows detailed gas breakdown
```

#### Route Display (When available)
```
Shows when swap route is calculated

Layout: Collapsible row

Header:
  - Icon: Route/path icon
  - Text: "Route"
  - Dropdown arrow
  
Expanded Content:
  - Visual diagram of swap route
  - Each step with icons
  - Example: ETH → USDC → wBTC
  - Network bridges highlighted
  - Expected slippage per step
```

---

### 5. MAIN ACTION BUTTON

#### States

##### Default (No Wallet)
```
Text: "Connect Wallet"
Background: Blue gradient
Border Radius: 12px
Width: 100%
Height: 56px
Font: Bold, 16px
Hover: Scale 1.02, increased glow
Click: Opens wallet connection modal
```

##### Wallet Connected, No Token Selected
```
Text: "Select a token"
Background: Gray gradient
Disabled: true
Cursor: not-allowed
```

##### Wallet Connected, Insufficient Balance
```
Text: "Insufficient [TOKEN] balance"
Background: Red gradient
Disabled: true
```

##### Wallet Connected, Amount Too Low
```
Text: "Amount too low"
Background: Gray gradient
Disabled: true
```

##### Ready to Swap
```
Text: "Swap"
Background: Blue gradient
Enabled: true
Hover: Glow effect
Click: Opens swap confirmation modal
```

##### Loading Quote
```
Text: "Fetching best price..."
Background: Blue gradient
Disabled: true
Icon: Spinning loader
```

##### Swapping (Transaction in Progress)
```
Text: "Swapping..."
Background: Blue gradient (pulsing)
Disabled: true
Icon: Spinning loader
Progress indicator below button
```

##### Transaction Submitted
```
Text: "View on Explorer"
Background: Green gradient
Icon: External link
Click: Opens block explorer in new tab
```

---

### 6. SETTINGS MODAL

#### Trigger
```
Click on settings icon in header
Opens modal overlay
```

#### Modal Structure
```
Position: Fixed, centered
Size: 480px width, auto height
Background: Dark gradient matching swap card
Border: 1px solid rgba(71, 161, 255, 0.2)
Border Radius: 24px
Padding: 32px
Z-index: 1000

Backdrop:
  - Semi-transparent dark overlay
  - Click: Closes modal
```

#### Modal Header
```
Layout: Flex row, space between

Left:
  - Text: "Settings"
  - Font: 24px, bold, white
  
Right:
  - Close icon (X)
  - Size: 24x24px
  - Color: Gray, hover → White
  - Click: Closes modal
```

#### Settings Sections

##### Section 1: Refund Configuration
```
Heading: "Refund and copy swap configuration"
Font: 14px, gray
Margin Bottom: 16px

Refund Dropdown:
  - Label: "Refund"
  - Options: "Transactions", "Blocks", "Time"
  - Default: "Transactions"
  - Style: Same as network selector
  
Copy Configuration Button:
  - Text: "Copy Swap Configuration"
  - Icon: Copy icon
  - Style: Secondary button (outline)
  - Click: Copies config to clipboard
  - Feedback: "Copied!" tooltip
```

##### Section 2: Preferences
```
Heading: "Preferences"
Font: 14px, gray
Margin Top: 32px

Theme Selector:
  - Label: "Theme"
  - Options: Three radio buttons
    * Auto (system default)
    * Dark mode (default selected)
    * Light mode
  - Layout: Horizontal row
  - Style: Custom radio buttons with icons
    * Sun icon (light)
    * Moon icon (dark)
    * Auto icon (circle half-filled)
  - Selected: Blue background, white icon
  - Unselected: Gray background, gray icon
  
Language Selector:
  - Label: "Languages"
  - Dropdown: Country flags + names
  - Default: "English 🇬🇧"
  - Options: Support multiple languages
  - Style: Same as other dropdowns
```

##### Section 3: Slippage Tolerance
```
Heading: "Slippage Tolerance"
Description: "Your transaction will revert if the price changes 
unfavorably by more than this percentage."

Options: Radio buttons + custom input
  - 0.1% (Low slippage, may fail)
  - 0.5% (Recommended)
  - 1.0% (Higher tolerance)
  - Custom: Input field (accepts 0.01 to 50)
  
Warning: Shows if slippage > 5%
  - Text: "High slippage! Transaction may be frontrun."
  - Color: Orange/yellow
  - Icon: Warning triangle
```

##### Section 4: Transaction Speed
```
Heading: "Transaction Speed"

Options: Three radio buttons
  - Standard (Normal gas)
  - Fast (+10% gas)
  - Instant (+30% gas)
  
Shows estimated time for each
  - Standard: ~2 min
  - Fast: ~30 sec
  - Instant: ~15 sec
  
Gas price in Gwei shown next to each
Updates in real-time based on network
```

---

### 7. TOKEN SELECTION MODAL

#### Trigger
```
Click on "Select Token" or token button in FROM/TO sections
```

#### Modal Structure
```
Size: 420px width, 600px max height
Position: Fixed, centered
Style: Same as settings modal
Scrollable: Yes (token list)
```

#### Modal Header
```
Title: "Select a token"
Close button: X icon (top right)
```

#### Search Input
```
Position: Below header
Placeholder: "Search name or paste address"
Icon: Search icon (left side of input)
Function:
  - Filters token list in real-time
  - Searches by: Name, symbol, contract address
  - Shows "No results" if nothing found
  - Can import custom tokens by address
  
Style:
  - Background: Dark blue
  - Border: 1px solid rgba(255,255,255,0.1)
  - Border Radius: 12px
  - Padding: 14px 16px 14px 44px (space for icon)
  - Focus: Border glows blue
```

#### Popular Tokens (Pills)
```
Position: Below search
Layout: Horizontal row of pill buttons

Tokens: ETH, USDC, USDT, WBTC, (network-specific popular tokens)
Style:
  - Pill-shaped buttons
  - Background: Dark blue
  - Border: 1px solid rgba(71, 161, 255, 0.3)
  - Padding: 8px 16px
  - Hover: Blue gradient background
  - Click: Selects that token immediately
```

#### Token List
```
Position: Below popular tokens
Height: 400px max, scrollable
Padding: 8px

Each Token Row:
  Layout: Flex row, space between
  Padding: 12px 16px
  Border Radius: 12px
  Hover: Background lightens
  Click: Selects token and closes modal
  
  Left Side:
    - Token icon (32x32px)
    - Token symbol (16px, bold, white)
    - Token name (14px, gray) below symbol
    
  Right Side:
    - Balance (if available)
    - USD value (gray, below balance)
    
Sort Options (dropdown at top of list):
  - By balance (descending)
  - By name (A-Z)
  - By market cap
```

#### Import Custom Token Section
```
Shows when: Search input contains valid contract address
            but token not in default list

Content:
  - Token details (name, symbol, decimals)
  - Warning: "Anyone can create a token..."
  - Security checklist
  - "Import" button
  
Warning Style:
  - Yellow/orange background
  - Warning icon
  - Font: 12px
```

#### Common Bases Section
```
Position: After popular tokens, before full list

Heading: "Common bases"
Description: "These tokens are commonly used in pairs"

Tokens: Platform-specific common tokens
Style: Grid layout, smaller than popular tokens
```

---

### 8. NETWORK SELECTION MODAL

#### Structure
```
Similar to token selection modal
Size: 400px width, auto height
Title: "Select a network"
```

#### Network List
```
Each Network Row:
  - Network icon (left)
  - Network name ("Arbitrum", "Ethereum", etc.)
  - Chain ID (gray text below name)
  - Active indicator (blue dot if currently selected)
  - Hover: Background highlight
  - Click: Switches to that network
  
Networks to Include:
  ✓ Arbitrum (featured/primary)
  ✓ Ethereum Mainnet
  ✓ Polygon
  ✓ Optimism
  ✓ Base
  ✓ Avalanche
  ✓ Binance Smart Chain
  
Style: Same as token list rows
```

#### Network Details on Hover
```
Shows:
  - Current gas price
  - Average block time
  - Your balance on network (if wallet connected)
```

---

### 9. SWAP CONFIRMATION MODAL

#### Triggered When
```
User clicks "Swap" button with valid inputs
```

#### Modal Structure
```
Size: 400px width, auto height
Style: Matching other modals
Z-index: 1001 (above other modals)
```

#### Header
```
Icon: Swap arrows icon (large, centered)
Title: "Confirm Swap"
Color: White
```

#### Swap Details Display
```
FROM Section:
  - Amount + Token symbol (large, bold)
  - USD value (gray, below)
  - Network badge (small pill)
  
Swap Arrow Icon (centered)
  
TO Section:
  - Amount + Token symbol (large, bold)
  - USD value (gray, below)
  - Network badge (small pill)
  
Rate Display:
  - "1 ETH = 0.0XX BTC"
  - Small text, centered
  - Click to invert rate
```

#### Transaction Details (Expandable)
```
Default: Collapsed, shows summary
Click to expand full details

Summary Row:
  - "Rate" | "1 ETH = 0.0XX BTC"
  - "Price Impact" | "< 0.01%" (green if low, orange/red if high)
  - "Minimum Received" | "0.0XX BTC" (after slippage)
  - "Network Fee" | "$0.XX"
  
Expanded Rows (additional):
  - Route (visual diagram)
  - Max Slippage
  - Protocol Fee
  - Estimated Time
  - Expiry (quote valid for XX seconds)
```

#### Warning Notices
```
Shows if applicable:
  - High price impact (> 3%)
  - Low liquidity warning
  - Network congestion alert
  - Slippage may be high
  
Style:
  - Yellow background
  - Warning icon
  - Bold text
  - Border: Orange
```

#### Action Buttons
```
Layout: Two buttons, side by side

Cancel Button:
  - Text: "Cancel"
  - Style: Secondary (outline)
  - Width: 48%
  - Click: Closes modal
  
Confirm Button:
  - Text: "Confirm Swap"
  - Style: Primary (blue gradient)
  - Width: 48%
  - Click: Initiates transaction
  - Disabled if: Quote expired, insufficient balance
```

#### Transaction Pending State
```
After confirm clicked:
  - Shows loading spinner
  - Text: "Waiting for confirmation..."
  - Subtitle: "Confirm this transaction in your wallet"
  - Cancel option available
```

#### Transaction Submitted State
```
After wallet confirms:
  - Success icon (checkmark in circle)
  - Text: "Transaction Submitted"
  - Transaction hash (abbreviated, copyable)
  - "View on Explorer" button
  - Countdown: "Transaction should complete in ~X seconds"
  
Auto-closes after 3 seconds
Or user clicks "Close" button
```

---

### 10. WALLET CONNECTION MODAL

#### Triggered By
```
Clicking "Connect Wallet" button anywhere in app
```

#### Modal Structure
```
Size: 400px width, auto height
Title: "Connect a wallet"
Close button: X icon
```

#### Wallet Options
```
List of supported wallets, each as large button:

Popular Wallets:
  1. MetaMask
  2. WalletConnect
  3. Coinbase Wallet
  4. Rainbow
  5. Trust Wallet
  6. Ledger
  7. Phantom (for Solana, if applicable)
  
Each Button:
  - Wallet icon (left)
  - Wallet name (center)
  - "Popular" badge (if applicable)
  - Arrow icon (right)
  - Background: Dark blue
  - Border: 1px solid rgba(255,255,255,0.1)
  - Padding: 16px
  - Border Radius: 12px
  - Hover: Blue glow
  - Click: Initiates connection to that wallet
```

#### Connection States

##### Connecting
```
- Shows loader
- Text: "Connecting to [Wallet Name]..."
- Subtitle: "Approve connection in your wallet"
```

##### Connected Successfully
```
- Success icon
- Text: "Wallet Connected"
- Shows connected address
- Auto-closes after 1.5 seconds
```

##### Connection Failed
```
- Error icon
- Text: "Connection Failed"
- Error message (from wallet)
- "Try Again" button
```

#### Terms & Privacy Notice
```
Position: Bottom of modal
Text: "By connecting a wallet, you agree to DecaFlow's Terms of 
Service and Privacy Policy"
Links: Underlined, blue
Font: 11px, gray
```

---

### 11. CONNECTED WALLET MENU

#### Trigger
```
Click on connected wallet button/address in header
```

#### Dropdown Menu
```
Position: Below wallet button, right-aligned
Width: 280px
Background: Dark gradient
Border: 1px solid rgba(71, 161, 255, 0.2)
Border Radius: 16px
Padding: 16px
```

#### Wallet Info Section
```
Address:
  - Full address shown
  - Copy icon (click to copy)
  - "Copied!" feedback
  
Balance:
  - Total portfolio value (USD)
  - Font: 24px, bold, white
  
Network Indicator:
  - Current network icon + name
  - "Switch Network" button (if needed)
```

#### Menu Options
```
Each as button/link:

1. "View on Explorer"
   - Icon: External link
   - Opens address in block explorer
   
2. "Copy Address"
   - Icon: Copy
   - Copies full address to clipboard
   
3. "Recent Transactions"
   - Icon: Clock/history
   - Opens transaction history panel
   - Shows last 10 transactions
   - Each with status, amount, time
   
4. "Disconnect"
   - Icon: Logout
   - Color: Red text
   - Click: Disconnects wallet, closes menu
   - Confirmation: "Are you sure?"
```

---

### 12. TRANSACTION HISTORY PANEL

#### Location
```
Option A: Slide-out panel from right side
Option B: Separate page/tab in app
```

#### Structure (if Panel)
```
Width: 400px
Height: Full viewport
Background: Dark gradient
Border Left: 1px solid rgba(71, 161, 255, 0.1)
Z-index: 1000
Animation: Slide in from right
```

#### Header
```
Title: "Recent Activity"
Filter buttons:
  - All
  - Swaps
  - Bridged
  - Failed
  
Sort: Newest first (dropdown to change)
```

#### Transaction Items
```
Each Transaction Row:
  Layout: Vertical stack
  Padding: 16px
  Border Bottom: 1px solid rgba(255,255,255,0.05)
  Hover: Background lightens slightly
  
  Top Row:
    - Action (e.g., "Swap")
    - Status badge (Pending/Success/Failed)
    - Time ago (e.g., "2 min ago")
    
  Middle Row:
    - Token icons + symbols
    - Arrow between tokens
    - Amount received (if complete)
    
  Bottom Row:
    - Transaction hash (abbreviated)
    - Copy icon
    - View on explorer link
    
  Status Colors:
    - Pending: Yellow
    - Success: Green
    - Failed: Red
```

#### Empty State
```
Shows when: No transactions yet
Icon: Empty box illustration
Text: "No transactions yet"
Subtitle: "Your swap history will appear here"
```

---

### 13. PRIVACY SWAP PAGE

#### URL
```
app.decaflow.vercel.app/privacy
```

#### Layout
```
Similar to main swap interface but with privacy features
```

#### Privacy Toggle/Badge
```
Position: Top of swap card
Badge: "PRIVACY MODE ENABLED"
Style:
  - Background: Dark with green accent
  - Icon: Shield with checkmark
  - Prominent positioning
```

#### Additional Privacy Options
```
Options (checkboxes/toggles):

1. "Use Private RPC"
   - Description: "Prevents transaction tracking"
   - Default: ON
   
2. "Delayed Execution"
   - Description: "Adds random delay to obfuscate timing"
   - Default: OFF
   - Range: 1-60 seconds
   
3. "Split Transactions"
   - Description: "Splits large swaps into smaller ones"
   - Default: OFF
   - Warning: "Higher gas fees"
```

#### Privacy Info Panel
```
Heading: "How Privacy Swap Works"
Content:
  - Bullet points explaining privacy features
  - Uses CoW intents, Flashbots, etc.
  - No transaction visibility before execution
  - Protection from MEV and front-running
  
Style: Info card with icon
```

#### Rest of Interface
```
Same as regular swap interface:
  - FROM/TO sections
  - Token selectors
  - Amount inputs
  - Swap button
  - Settings
```

---

### 14. DAPP FOOTER

#### Layout
```
Position: Bottom of page
Background: Slightly darker than main background
Padding: 40px 20px
Border Top: 1px solid rgba(255,255,255,0.05)
```

#### Content (Centered)
```
Top Row: Social Icons
  - GitBook (documentation)
  - Etherscan (contract)
  - Telegram
  - Medium
  - Twitter/X
  - Discord
  
  Style: Same as marketing site footer
  Size: 24x24px each
  Spacing: 16px between icons
  
Middle Row: Badge
  - "Cross Chain SECURED WITH Arbitrum"
  - Same style as marketing site
  
Bottom Row: App Info
  - Left: "Version X.X.X"
  - Center: ENS domain (if applicable)
  - Right: Email contact
  
  Font: 12px, gray
  Layout: Flex row, space between
  Max Width: 800px
```

---

### 15. RESPONSIVE BEHAVIOR (DAPP)

#### Mobile Adaptations (< 768px)

##### Header
```
- Logo scales down
- Navigation collapses to hamburger menu
- Wallet button shows shortened address
- Settings icon remains visible
```

##### Swap Card
```
- Padding reduces to 20px
- Font sizes scale down 15%
- Network selector width: 100%
- Token/amount inputs stack vertically
- Buttons become full-width
```

##### Modals
```
- Width: 100vw (full screen)
- Height: 100vh (full screen)
- Border Radius: 0
- Animation: Slide up from bottom
```

#### Tablet (768px - 1024px)
```
- Swap card maintains desktop layout
- Margins adjust to fit screen
- Font sizes remain same
- All interactions same as desktop
```

---

## Revenue Dashboard

### URL
```
dashboard.decaflow.vercel.app
OR
app.decaflow.vercel.app/revenue
```

---

### 1. DASHBOARD HEADER

```
Same as DApp header
Active link: "Revenue Share"
```

---

### 2. STATS CARDS (Top Section)

#### Layout
```
Two cards, side by side (stacks on mobile)
Gap: 24px
Margin Bottom: 32px
```

#### Card 1: Total Volume
```
Structure:
  - Heading: "Total Volume" (14px, gray)
  - Value: "$157,625,037" (32px, bold, white)
  - Icon: Chart icon (right side of card)
  
Style:
  - Background: Dark blue gradient
  - Border: 1px solid rgba(71, 161, 255, 0.15)
  - Border Radius: 16px
  - Padding: 24px
  - Icon: Simple line chart icon
  - Icon Color: Blue
  - Icon Size: 32x32px
```

#### Card 2: Transactions
```
Structure: Same as Card 1
  - Heading: "Transactions"
  - Value: "188,159"
  - Icon: Arrows/swap icon
```

---

### 3. REVENUE CHART (Main Section)

#### Chart Container
```
Background: Same dark gradient as cards
Border: 1px solid rgba(71, 161, 255, 0.15)
Border Radius: 16px
Padding: 32px
Height: 500px
```

#### Chart Header
```
Layout: Flex row, space between

Left Side:
  - Title: "Total Revenue Overview" (24px, bold, white)
  - Subtitle: "(+3%) This Month" (14px, green)
  
Right Side:
  - Total Revenue: "$1,186,585" (20px, bold, white)
  - Background: Dark blue pill
  - Padding: 12px 24px
```

#### Chart Type
```
Type: Area Chart
Library: ApexCharts or Recharts recommended

Configuration:
  - X-axis: Dates (3/24 to 10/25)
  - Y-axis: Revenue values ($0 to $1200K)
  - Line Color: Blue gradient (#47A1FF)
  - Fill: Blue gradient with transparency
    * Top: rgba(71, 161, 255, 0.4)
    * Bottom: rgba(71, 161, 255, 0.05)
  - Grid Lines: Dashed, subtle gray
  - Curve: Smooth (not sharp angles)
  - Animation: Draws from left on load
  - Tooltips: Show exact value + date on hover
  
Style:
  - Background: Transparent
  - Axis Text: Gray, 12px
  - Grid: rgba(255,255,255,0.05)
```

#### Chart Features
```
Interactive Elements:
  - Hover: Shows tooltip with exact data
  - Crosshair: Vertical line follows mouse
  - Data point: Highlighted circle on hover
  
Zoom/Pan (Optional):
  - Buttons: "1M", "3M", "6M", "1Y", "ALL"
  - Position: Top right of chart
  - Active: Blue background
  
Export (Optional):
  - Download as PNG/CSV
  - Menu icon (top right)
```

---

### 4. REVENUE SHARE CALCULATOR

#### Section Header
```
Heading: "Your Next Revenue Share"
Font: 20px, bold, white
Margin Bottom: 16px
```

#### Input Group
```
Layout: Flex row with input and button

Wallet Address Input:
  - Placeholder: "Enter wallet address"
  - Width: Flexible (grows to fill space)
  - Background: Dark blue
  - Border: 1px solid rgba(255,255,255,0.1)
  - Border Radius: 12px (left side only)
  - Padding: 16px 20px
  - Font: 14px, monospace
  - Color: White
  - Focus: Border glows blue
  
Check Button:
  - Text: "Check"
  - Position: Right of input (attached)
  - Background: Blue gradient
  - Border Radius: 12px (right side only)
  - Padding: 16px 32px
  - Font: Bold, 14px
  - Hover: Glow effect
  - Click: Queries revenue data for address
```

#### Results Display (After Check)
```
Shows below input after successful query

Card Style:
  - Background: Dark gradient
  - Border: 1px solid rgba(71, 161, 255, 0.15)
  - Border Radius: 16px
  - Padding: 24px
  - Margin Top: 16px
  
Content:
  Row 1:
    - Label: "Your Holdings"
    - Value: "X,XXX DECA" (token amount)
    
  Row 2:
    - Label: "Revenue Share %"
    - Value: "0.XX%"
    
  Row 3:
    - Label: "Estimated Next Payout"
    - Value: "$XXX.XX"
    - Color: Green (if positive)
    
  Row 4:
    - Label: "Next Distribution"
    - Value: "MM/DD/YYYY" (date)
    
  Claim Button (if claimable):
    - Text: "Claim Revenue"
    - Style: Primary button
    - Full width
    - Click: Initiates claim transaction
```

#### Info Panel
```
Position: Below calculator
Content:
  - "Revenue is distributed monthly to token holders"
  - "Must hold minimum XXX DECA to qualify"
  - "Distribution occurs on the 1st of each month"
  
Style: Info card with info icon
Background: Transparent with blue border (left side)
Font: 14px, gray
Padding: 16px 20px
```

---

### 5. HISTORICAL DISTRIBUTIONS TABLE

#### Section Header
```
Heading: "Distribution History"
Font: 20px, bold, white
Margin: 40px 0 20px
```

#### Table Structure
```
Background: Dark gradient
Border: 1px solid rgba(71, 161, 255, 0.15)
Border Radius: 16px
Overflow: Hidden
```

#### Table Header
```
Columns:
  | Date | Total Distributed | Recipients | Avg. Payout | Status |

Style:
  - Background: Slightly lighter than table
  - Font: 12px, bold, gray
  - Padding: 16px
  - Border Bottom: 1px solid rgba(255,255,255,0.05)
```

#### Table Rows
```
Each row:
  - Date: "MM/DD/YYYY"
  - Total: "$X,XXX.XX"
  - Recipients: "XXX holders"
  - Avg. Payout: "$XX.XX"
  - Status: Badge (Completed/Pending)
  
Style:
  - Padding: 16px
  - Border Bottom: 1px solid rgba(255,255,255,0.05)
  - Hover: Background lightens
  - Alternating: Subtle background difference
  
Status Badge:
  - Completed: Green background, white text
  - Pending: Yellow background, dark text
  - Border Radius: 6px
  - Padding: 4px 12px
  - Font: 11px, bold
```

#### Pagination (if many rows)
```
Position: Bottom of table
Layout: Center aligned

Elements:
  - Previous button
  - Page numbers (1, 2, 3, ...)
  - Next button
  
Style: Simple, minimal
Active page: Blue background
```

---

### 6. DASHBOARD FOOTER

```
Same as DApp footer
Social icons + badge + app info
```

---

### 7. RESPONSIVE (DASHBOARD)

#### Mobile (< 768px)
```
Stats Cards:
  - Stack vertically
  - Full width
  
Chart:
  - Height: 300px (reduced)
  - X-axis labels: Rotated or fewer shown
  - Touch: Swipe to pan chart
  
Calculator:
  - Input + button stack vertically
  - Button: Full width
  
Table:
  - Horizontal scroll
  - Sticky first column
  - Simplified view (hide less important columns)
```

#### Tablet (768px - 1024px)
```
- Stats cards remain side by side
- Chart maintains full height
- Table shows all columns
- Adequate padding maintained
```

---

## Design System & Branding

### 1. COLOR PALETTE

#### Primary Colors
```
Primary Blue:     #3396FF (lighter shade)
Primary Blue Dark: #2978CC (darker shade)
Accent Blue:      #47A1FF (hover states, highlights)
Cyan Accent:      #6CB4FF (light accents, gradients)
```

#### Gradients
```
Primary Gradient:
  linear-gradient(135deg, #3396FF 0%, #47A1FF 100%)
  
Secondary Gradient:
  linear-gradient(135deg, #2978CC 0%, #3396FF 100%)
  
Background Gradient (Hero):
  linear-gradient(180deg, #0A0E27 0%, #141B3D 100%)
  
Card Gradient:
  linear-gradient(135deg, #1A1F2E 0%, #141824 100%)
```

#### Background Colors
```
App Background:       #0F1419 (very dark navy)
Card Background:      #1A1F2E (dark blue-gray)
Elevated Background:  #222833 (slightly lighter)
Input Background:     #1E2433 (dark blue)
Hover Background:     #252B3B (medium dark)
```

#### Text Colors
```
Primary Text:    #FFFFFF (white)
Secondary Text:  #A8B1B1 (light gray)
Tertiary Text:   #6E7777 (gray)
Disabled Text:   #474D4D (dark gray)
Link Text:       #47A1FF (blue)
Link Hover:      #6CB4FF (light blue)
```

#### Semantic Colors
```
Success Green:  #26D962
Success Dark:   #26B562
Error Red:      #F25A67
Error Dark:     #F05142
Warning Yellow: #FFD641
Warning Orange: #F0AD4E
Info Blue:      #337AB7
```

#### Border Colors
```
Default:    rgba(71, 161, 255, 0.15)
Hover:      rgba(71, 161, 255, 0.3)
Focus:      rgba(71, 161, 255, 0.5)
Subtle:     rgba(255, 255, 255, 0.05)
Strong:     rgba(255, 255, 255, 0.1)
```

---

### 2. TYPOGRAPHY

#### Font Family
```
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
         Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif

Monospace (for addresses, hashes):
         'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace
```

#### Font Sizes
```
Heading 1:    48px (Desktop) / 32px (Mobile)
Heading 2:    36px (Desktop) / 28px (Mobile)
Heading 3:    24px
Heading 4:    20px
Body Large:   18px
Body:         16px
Body Small:   14px
Caption:      12px
Micro:        11px
```

#### Font Weights
```
Light:    300 (rarely used)
Regular:  400 (body text)
Medium:   500 (emphasized text)
Semibold: 600 (sub-headings)
Bold:     700 (headings, buttons)
Extra:    800 (hero headlines)
```

#### Line Heights
```
Tight:    1.1 (large headings)
Normal:   1.5 (body text)
Relaxed:  1.6 (long-form content)
Loose:    2.0 (nav links, spaced elements)
```

---

### 3. SPACING SYSTEM

```
Based on 4px grid:

4px   - xs   - Tiny gaps, icon padding
8px   - sm   - Small gaps
12px  - md   - Default gaps
16px  - lg   - Medium gaps
24px  - xl   - Large gaps
32px  - 2xl  - Section spacing
48px  - 3xl  - Large section spacing
64px  - 4xl  - Major section dividers
80px  - 5xl  - Page sections
100px - 6xl  - Hero sections
```

---

### 4. BORDER RADIUS

```
Small:  6px  - Small elements, badges
Medium: 12px - Buttons, inputs, small cards
Large:  16px - Cards, modals
XLarge: 24px - Main swap card, large modals
Pill:   9999px - Pills, toggles
Circle: 50% - Icon buttons, avatars
```

---

### 5. SHADOWS

#### Elevation System
```
Low (Cards):
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

Medium (Hover states):
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

High (Modals):
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

Glow (Blue accent):
  box-shadow: 0 0 20px rgba(71, 161, 255, 0.3);

Inner Shadow (Inputs):
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
```

---

### 6. ANIMATIONS & TRANSITIONS

#### Duration
```
Fast:     150ms - Hover effects, small UI changes
Normal:   300ms - Modals, dropdowns, most transitions
Slow:     500ms - Page transitions, large animations
Very Slow: 1000ms+ - Counters, chart animations
```

#### Easing Functions
```
Default:    ease-in-out (most transitions)
Enter:      ease-out (modals opening)
Exit:       ease-in (modals closing)
Bounce:     cubic-bezier(0.68, -0.55, 0.265, 1.55)
Smooth:     cubic-bezier(0.4, 0.0, 0.2, 1)
```

#### Common Animations
```
Fade In:
  opacity: 0 → 1
  duration: 300ms
  easing: ease-out

Scale In (Modals):
  opacity: 0 → 1
  transform: scale(0.95) → scale(1)
  duration: 300ms
  
Slide Up (Mobile modals):
  transform: translateY(100%) → translateY(0)
  duration: 300ms
  
Hover Scale (Buttons):
  transform: scale(1) → scale(1.02)
  duration: 150ms
  
Glow Pulse:
  box-shadow: 0 0 10px → 0 0 20px
  duration: 1000ms
  iteration: infinite
  direction: alternate
```

---

### 7. ICONOGRAPHY

#### Icon Library
```
Recommended: Lucide Icons, Heroicons, or Feather Icons
Size: 16px, 20px, 24px, 32px (based on context)
Weight: 2px stroke for most icons
Color: Inherit from parent or specific color
```

#### Common Icons Needed
```
- Swap arrows (↑↓)
- Settings (gear)
- Search (magnifying glass)
- Wallet (wallet icon)
- Network icons (custom for each blockchain)
- Token icons (custom for each token)
- Check mark (success)
- X / Close
- Info (i in circle)
- Warning (triangle with !)
- External link (arrow pointing out)
- Copy (two overlapping squares)
- Dropdown arrow (chevron down)
- Menu (hamburger)
- Chart/Graph
- Shield (privacy/security)
- Clock (pending)
- Gas pump
```

---

### 8. BUTTONS

#### Primary Button
```
Background: linear-gradient(135deg, #3396FF, #47A1FF)
Color: White
Font: Bold, 16px
Padding: 14px 32px
Border Radius: 12px
Border: None
Cursor: Pointer
Transition: all 150ms ease

Hover:
  transform: scale(1.02)
  box-shadow: 0 0 20px rgba(71, 161, 255, 0.4)
  
Active:
  transform: scale(0.98)
  
Disabled:
  opacity: 0.5
  cursor: not-allowed
  transform: none
```

#### Secondary Button (Outline)
```
Background: Transparent
Color: #47A1FF
Border: 2px solid #47A1FF
Font: Bold, 16px
Padding: 12px 32px (less to account for border)
Border Radius: 12px

Hover:
  background: linear-gradient(135deg, #3396FF, #47A1FF)
  color: White
```

#### Tertiary Button (Ghost)
```
Background: Transparent
Color: #A8B1B1
Border: None
Font: Medium, 14px
Padding: 8px 16px

Hover:
  color: White
  background: rgba(255, 255, 255, 0.05)
```

#### Icon Button
```
Background: Transparent or rgba(255,255,255,0.05)
Size: 40x40px
Border Radius: 50% (circle) or 12px (rounded square)
Padding: 8px
Color: #A8B1B1

Hover:
  color: #47A1FF
  background: rgba(71, 161, 255, 0.1)
```

---

### 9. INPUTS

#### Text Input
```
Background: #1E2433
Color: White
Font: 16px (14px for smaller inputs)
Padding: 14px 16px
Border: 1px solid rgba(255, 255, 255, 0.1)
Border Radius: 12px
Transition: border 150ms ease

Placeholder:
  color: #6E7777
  
Focus:
  border-color: rgba(71, 161, 255, 0.5)
  box-shadow: 0 0 0 3px rgba(71, 161, 255, 0.1)
  outline: none
  
Error:
  border-color: #F25A67
  
Disabled:
  opacity: 0.5
  cursor: not-allowed
```

#### Dropdown / Select
```
Same as text input plus:
- Right arrow icon
- Dropdown icon changes on open/close
- Menu appears below with same width
- Menu has higher z-index
- Menu items hover with blue background
```

---

### 10. CARDS

#### Standard Card
```
Background: linear-gradient(135deg, #1A1F2E, #141824)
Border: 1px solid rgba(71, 161, 255, 0.15)
Border Radius: 16px
Padding: 24px
Box Shadow: 0 4px 16px rgba(0, 0, 0, 0.1)

Hover (if interactive):
  border-color: rgba(71, 161, 255, 0.3)
  transform: translateY(-2px)
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2)
```

#### Main Swap Card (Elevated)
```
Max Width: 480px
Border Radius: 24px
Padding: 32px
Box Shadow: 0 20px 60px rgba(0, 0, 0, 0.4)
(Other properties same as standard card)
```

---

### 11. MODALS

#### Backdrop
```
Background: rgba(0, 0, 0, 0.7) or rgba(10, 14, 39, 0.8)
Position: Fixed, full viewport
Z-index: 999
Backdrop-filter: blur(4px) (optional, performance intensive)
Transition: opacity 300ms ease
```

#### Modal Content
```
Position: Fixed, centered
Max Width: 90vw
Max Height: 90vh
Background: linear-gradient(135deg, #1A1F2E, #141824)
Border: 1px solid rgba(71, 161, 255, 0.2)
Border Radius: 24px
Padding: 32px
Box Shadow: 0 20px 60px rgba(0, 0, 0, 0.5)
Z-index: 1000
Overflow: Auto (if content is long)

Animation (Open):
  opacity: 0 → 1
  transform: scale(0.95) → scale(1)
  duration: 300ms
  
Animation (Close):
  opacity: 1 → 0
  transform: scale(1) → scale(0.95)
  duration: 200ms
```

---

### 12. LOADING STATES

#### Spinner
```
Type: Circle with rotating arc
Size: 20px (small), 32px (medium), 48px (large)
Color: #47A1FF
Animation: Continuous rotation, 1s duration
Usage: Buttons, content loading
```

#### Skeleton
```
Background: Linear gradient animation
  from: rgba(255,255,255,0.05)
  to: rgba(255,255,255,0.1)
  back to: rgba(255,255,255,0.05)
  
Animation: 1.5s ease-in-out infinite
Border Radius: Match element being loaded
Usage: Cards, text blocks, images while loading
```

#### Progress Bar
```
Background: rgba(255,255,255,0.1)
Fill: Blue gradient
Height: 4px
Border Radius: 2px
Animation: Increase width 0 → 100%
Usage: Transaction progress, file uploads
```

---

### 13. BADGES & PILLS

#### Pill Badge
```
Background: rgba(71, 161, 255, 0.15)
Color: #47A1FF
Font: Bold, 12px
Padding: 6px 12px
Border Radius: 9999px (fully rounded)
Border: 1px solid rgba(71, 161, 255, 0.3)
```

#### Status Badges
```
Success:
  background: rgba(38, 217, 98, 0.15)
  color: #26D962
  
Error:
  background: rgba(242, 90, 103, 0.15)
  color: #F25A67
  
Warning:
  background: rgba(255, 214, 65, 0.15)
  color: #FFD641
  
Info:
  background: rgba(71, 161, 255, 0.15)
  color: #47A1FF
```

---

### 14. RESPONSIVE BREAKPOINTS

```
Mobile Small:  320px - 480px
Mobile:        481px - 767px
Tablet:        768px - 1024px
Desktop:       1025px - 1440px
Large Desktop: 1441px+

Use min-width media queries (mobile-first approach)
```

---

### 15. ACCESSIBILITY

#### Focus States
```
All interactive elements must have visible focus:
- Outline: 2px solid #47A1FF
- Outline Offset: 2px
- Or custom focus style with high contrast
```

#### Color Contrast
```
Minimum Ratios (WCAG AA):
- Normal text: 4.5:1
- Large text: 3:1
- UI elements: 3:1

All text must meet these ratios against backgrounds
```

#### Keyboard Navigation
```
All actions must be accessible via keyboard:
- Tab: Move forward
- Shift+Tab: Move backward
- Enter/Space: Activate
- Escape: Close modals
- Arrow keys: Navigate lists/options
```

#### Screen Readers
```
- All images have alt text
- Buttons have descriptive labels
- Form inputs have labels (visible or aria-label)
- Dynamic content changes announced (aria-live regions)
- Proper heading hierarchy (h1, h2, h3...)
```

---

## Technical Stack Recommendations

### Frontend Framework
```
Recommended: React 18+ with TypeScript
Alternative: Next.js 14+ (if SSR needed)

Reasoning:
- Most Web3 libraries have React bindings
- TypeScript adds type safety for contract interactions
- Large ecosystem and community support
```

### Styling
```
Recommended: Tailwind CSS or Styled Components

Tailwind Approach:
- Fast development
- Consistent design tokens
- Smaller bundle with PurgeCSS
- Custom config for design system

Styled Components Approach:
- Component-scoped styles
- Dynamic styling based on props
- No class name conflicts
```

### Web3 Integration
```
Wallet Connection:
- RainbowKit (recommended)
- Web3Modal
- ConnectKit

Blockchain Interaction:
- Wagmi (hooks for Ethereum)
- ethers.js or viem (lower level)

Multi-chain:
- Wagmi supports multi-chain out of box
- Custom hooks for chain-specific logic
```

### State Management
```
Global State:
- Zustand (lightweight, recommended)
- Redux Toolkit (if complex state)
- Jotai (atomic state management)

Server State (API/Blockchain):
- TanStack Query (React Query)
- SWR

Reasoning: Separate server/global state for clarity
```

### Charting (Revenue Dashboard)
```
Recommended: Recharts or ApexCharts

Recharts:
- Native React components
- Responsive by default
- Good documentation

ApexCharts:
- More chart types
- Better animations
- Mature library
```

### Routing
```
If SPA: React Router v6
If Next.js: Built-in App Router
```

### Animation
```
Recommended: Framer Motion

Features:
- Declarative animations
- Gesture support
- Layout animations
- Excellent React integration

Alternative: React Spring (physics-based)
```

### Form Handling
```
Recommended: React Hook Form

Features:
- Minimal re-renders
- Built-in validation
- Works with Zod for schema validation
- Small bundle size
```

### Token/Network Icons
```
Source: TrustWallet Assets (GitHub)
Fallback: Generic icon for unknown tokens
Format: SVG (preferred) or PNG
```

### Testing
```
Unit Tests: Vitest (faster than Jest)
Integration Tests: React Testing Library
E2E Tests: Playwright or Cypress
```

### Build Tool
```
Vite (modern, fast)
OR
Next.js built-in (if using Next)
```

### API Calls
```
HTTP Client: Axios or native fetch
WebSocket: For real-time price updates
```

### Error Tracking
```
Sentry (recommended)
Captures errors, user context, breadcrumbs
```

### Analytics
```
Privacy-focused:
- Plausible
- Fathom

Traditional:
- Google Analytics 4 (with consent management)
```

---

## Implementation Priority

### Phase 1: MVP (Essential Features)
**Timeline: 4-6 weeks**

1. **Marketing Landing Page**
   - Hero section
   - Stats section
   - "Introducing DecaFlow" cards
   - "What do we do?" tabs
   - Footer
   - Responsive design
   
2. **Basic Swap Interface**
   - Wallet connection (MetaMask, WalletConnect)
   - Token selection modal
   - Amount inputs (FROM/TO)
   - Network selection
   - Swap button
   - Basic transaction flow
   
3. **Essential Modals**
   - Wallet connection
   - Token selection
   - Swap confirmation
   - Transaction status
   
4. **Settings (Basic)**
   - Slippage tolerance
   - Theme toggle (light/dark)

---

### Phase 2: Enhanced Features
**Timeline: 3-4 weeks**

1. **Advanced Swap Features**
   - Smart routing display
   - Price impact warnings
   - Gas estimation
   - Transaction history panel
   - Recent swaps persistence
   
2. **Complete Settings**
   - Language selector
   - Refund configuration
   - Transaction speed options
   - RPC configuration
   
3. **Network/Bridge Integration**
   - CCTP for USDC
   - CCIP integration
   - Socket aggregator (if applicable)
   - Cross-chain swap flow
   
4. **Marketing Site Enhancements**
   - Protocol integration sections (Arbitrum, bridges)
   - Intra-chain swaps section
   - Animated elements
   - Newsletter signup

---

### Phase 3: Advanced Features
**Timeline: 3-4 weeks**

1. **Revenue Dashboard**
   - Stats cards (volume, transactions)
   - Revenue chart
   - Revenue calculator
   - Distribution history table
   - Claim mechanism
   
2. **Privacy Swap**
   - Privacy mode toggle
   - Private RPC option
   - CoW intents integration
   - Flashbots integration (if on Ethereum)
   
3. **Additional Features**
   - Token listing form
   - Support/documentation pages
   - Telegram bot integration (if applicable)
   
4. **Performance Optimization**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Bundle size optimization

---

### Phase 4: Polish & Launch Prep
**Timeline: 2-3 weeks**

1. **Testing & QA**
   - Cross-browser testing
   - Mobile device testing
   - Transaction testing on testnets
   - Security audit preparation
   
2. **Accessibility**
   - Keyboard navigation
   - Screen reader testing
   - ARIA attributes
   - Focus management
   
3. **SEO & Meta**
   - Meta tags
   - Open Graph images
   - Sitemap
   - Robots.txt
   
4. **Documentation**
   - User guides
   - Developer docs
   - API documentation
   - Deployment guides
   
5. **Monitoring Setup**
   - Error tracking (Sentry)
   - Analytics
   - Performance monitoring
   - Uptime monitoring

---

## Key Differences to Implement

### 1. Branding Changes
```
ChainSwap → DecaFlow
- Update all logos
- Change all instances of "ChainSwap" to "DecaFlow"
- Update social media links
- Change contract addresses
- Update domain references
```

### 2. Protocol Messaging
```
From: "Powered by Chainlink CCIP"
To: "Powered by Arbitrum"

From: "CHAINSWAP Powered by ChainLink CCIP" (badge)
To: "DECAFLOW Powered by Arbitrum" (badge)

From: "Cross Chain SECURED WITH CHAINLINK"
To: "Cross Chain SECURED WITH Arbitrum"
```

### 3. Content Updates
```
All content referencing Chainlink's security model should be 
adapted to highlight:
- Arbitrum's Layer 2 security
- Arbitrum's speed and low fees
- Arbitrum's ecosystem and partnerships
- Bridge security measures used by DecaFlow
```

### 4. Network Emphasis
```
Arbitrum should be:
- Featured first in network lists
- Shown as "Recommended" in network selector
- Used as default network on first load (if no wallet)
- Highlighted with special styling/badge
```

### 5. Color Adjustments (Optional)
```
If Arbitrum branding is important:
- Consider incorporating Arbitrum's blue shades
- Maintain consistency with Arbitrum's visual identity
- Use Arbitrum logo colors as accent colors

However, the ChainSwap color scheme is flexible and can 
work for any brand, so this is optional.
```

---

## Design Asset Requirements

### Logos
```
DecaFlow Logo:
- Transparent PNG (for light backgrounds)
- Transparent PNG (for dark backgrounds)
- SVG (scalable, preferred)
- Sizes: 32px, 64px, 128px, 256px, 512px
- Favicon: 16px, 32px, 64px
```

### Social Media Graphics
```
- Open Graph image (1200x630px)
- Twitter Card image (1200x600px)
- App icon (512x512px, for PWA)
```

### Blockchain Icons
```
Required networks:
- Arbitrum (primary)
- Ethereum
- Polygon
- Avalanche
- Binance Smart Chain
- Optimism
- Base

Format: SVG or PNG (transparent)
Size: 32px minimum
```

### Illustrations
```
Needed for landing page:
- Integration Challenges (abstract network)
- DecaFlow Solution (bridge/shield)
- Simplified Transactions (flow diagram)
- CCIP section replacement (Arbitrum visual)
- CCTP section replacement (bridge visual)
- Intra-chain swaps (floating blockchain logos)

Style: 3D isometric, consistent with ChainSwap's style
Colors: Blue gradient theme matching design system
```

### Background Elements
```
- Hero background (video or animated gradient)
- Particle system (animated dots/orbs)
- Grid overlay (subtle lines)
```

---

## Performance Targets

### Load Times
```
First Contentful Paint (FCP): < 1.5s
Largest Contentful Paint (LCP): < 2.5s
Time to Interactive (TTI): < 3.5s
Total Blocking Time (TBT): < 300ms
Cumulative Layout Shift (CLS): < 0.1
```

### Bundle Size
```
Initial JS Bundle: < 200KB (gzipped)
CSS: < 50KB (gzipped)
Total Page Weight: < 1MB (first load)
```

### Optimization Strategies
```
- Code splitting by route
- Lazy load modals
- Lazy load charts (revenue dashboard)
- Optimize images (WebP format)
- Defer non-critical JS
- Preload critical fonts
- Use CDN for assets
- Implement service worker for PWA
```

---

## Security Considerations

### Smart Contract Interaction
```
- Always validate user inputs
- Show transaction details before confirmation
- Implement maximum slippage protection
- Warn users of high price impact
- Display estimated gas clearly
- Show all fees before transaction
- Implement transaction deadline
```

### Wallet Connection
```
- Only request necessary permissions
- Detect wallet changes (account/network)
- Handle wallet disconnections gracefully
- Clear sensitive data on disconnect
- Validate connected network matches expected
```

### API Security
```
- Never expose private keys client-side
- Use HTTPS for all API calls
- Implement rate limiting
- Sanitize all user inputs
- Validate all data from blockchain
- Handle errors without exposing internals
```

### Content Security
```
- Implement CSP headers
- Sanitize user-generated content
- Prevent XSS attacks
- Use HTTPS only
- Implement CORS properly
```

---

## Testing Checklist

### Functional Testing
```
✓ Wallet connection (all supported wallets)
✓ Network switching
✓ Token selection and search
✓ Amount input validation
✓ Swap execution (same chain)
✓ Swap execution (cross chain)
✓ Transaction history
✓ Settings persistence
✓ Theme switching
✓ Language switching
✓ Revenue calculator
✓ Revenue claiming
✓ All links functional
✓ All modals open/close
✓ All forms validate correctly
```

### UI/UX Testing
```
✓ Responsive design (all breakpoints)
✓ Touch interactions (mobile)
✓ Hover states
✓ Loading states
✓ Error states
✓ Empty states
✓ Success states
✓ Animations smooth (60fps)
✓ No layout shift on load
✓ Readable text (contrast)
✓ All icons display correctly
```

### Browser Testing
```
✓ Chrome/Edge (latest 2 versions)
✓ Firefox (latest 2 versions)
✓ Safari (latest 2 versions)
✓ Mobile Safari (iOS)
✓ Mobile Chrome (Android)
```

### Wallet Testing
```
✓ MetaMask (desktop + mobile)
✓ WalletConnect (various wallets)
✓ Coinbase Wallet
✓ Ledger (hardware wallet)
✓ Trust Wallet (mobile)
```

### Network Testing
```
✓ Arbitrum (primary network)
✓ Ethereum Mainnet
✓ Polygon
✓ Other supported networks
✓ Network switching during transaction
✓ Network disconnection handling
```

---

## Deployment Checklist

### Pre-Deployment
```
✓ Environment variables configured
✓ API keys secured
✓ Smart contract addresses verified
✓ RPC endpoints configured and tested
✓ Analytics configured
✓ Error tracking configured
✓ Performance monitoring set up
```

### Domain & Hosting
```
✓ Domain purchased and configured
✓ SSL certificate installed
✓ CDN configured
✓ Hosting platform selected (Vercel, Netlify, etc.)
✓ Deployment pipeline configured
✓ Environment-specific configs set
```

### SEO & Social
```
✓ Meta tags implemented
✓ Open Graph tags
✓ Twitter Cards
✓ Sitemap generated
✓ Robots.txt configured
✓ Favicon set
✓ PWA manifest (if applicable)
```

### Legal & Compliance
```
✓ Terms of Service page
✓ Privacy Policy page
✓ Cookie consent (if required)
✓ Geo-blocking (if required)
✓ Disclaimer notices
✓ Age verification (if required)
```

### Post-Deployment
```
✓ Smoke tests on production
✓ All external links verified
✓ Forms working in production
✓ Analytics receiving data
✓ Error tracking receiving data
✓ Performance metrics within targets
✓ Social media preview working
✓ Monitor first 24-48 hours closely
```

---

## Maintenance & Updates

### Regular Tasks
```
Weekly:
- Monitor error logs
- Check analytics for issues
- Review user feedback
- Test critical paths

Monthly:
- Update dependencies (patch versions)
- Review and optimize performance
- Check and update token list
- Review and update gas estimates

Quarterly:
- Major dependency updates (minor/major versions)
- Comprehensive security review
- Accessibility audit
- UX improvements based on data
```

### Content Updates
```
Keep Updated:
- Token list (new popular tokens)
- Network list (new supported chains)
- Partner logos (if partnerships change)
- Stats (if manually updated)
- Blog posts/announcements (if applicable)
- Documentation
```

---

## Contact & Support

### Support Channels to Implement
```
1. Email: support@decaflow.app
2. Telegram: @DecaFlowSupport
3. Discord: DecaFlow Official
4. Twitter/X: @DecaFlowDeFi
5. Documentation: docs.decaflow.app
6. GitHub: (for developer issues)
```

### Support Features in App
```
- "Support" link in navigation
- Bug report form (Google Forms or Typeform)
- FAQ section
- Live chat widget (optional, Intercom/Crisp)
- Status page (for downtime updates)
```

---

## Final Notes for Developers

### Code Quality Standards
```
- Use TypeScript strictly (no 'any' types)
- Follow consistent naming conventions
- Document complex logic with comments
- Write unit tests for critical functions
- Keep components small and focused
- Use custom hooks for reusable logic
- Implement proper error boundaries
- Log errors but don't expose details to users
```

### Git Workflow
```
- Main branch: Production-ready code
- Develop branch: Integration branch
- Feature branches: feature/[name]
- Bug fix branches: fix/[name]
- Use conventional commits
- Require PR reviews before merging
- Run tests in CI/CD pipeline
```

### Documentation Requirements
```
For each major component:
- Purpose and functionality
- Props/API documentation
- Usage examples
- Known issues or limitations

For each feature:
- User-facing documentation
- Technical implementation details
- Integration points
- Testing approach
```

### Code Review Focus Areas
```
- Security vulnerabilities
- Performance implications
- Accessibility compliance
- Mobile responsiveness
- Error handling
- Loading states
- Edge cases
- TypeScript typing
- Code duplication
```

---

## Conclusion

This specification document provides a complete blueprint for replicating ChainSwap's UI/UX for DecaFlow. The key is to maintain pixel-perfect accuracy in:

1. **Visual Design**: Colors, typography, spacing, shadows
2. **Layout**: Component positioning, responsive behavior
3. **Interactions**: Hover effects, animations, transitions
4. **User Flows**: Wallet connection, swaps, settings
5. **Content Structure**: Sections, messaging, information hierarchy

**The only differences should be:**
- Branding (ChainSwap → DecaFlow)
- Protocol messaging (Chainlink → Arbitrum)
- Contract addresses and network configurations

Everything else should replicate ChainSwap exactly as analyzed.

---

**Document Version:** 1.0  
**Last Updated:** November 19, 2024  
**Prepared For:** DecaFlow Development Team  
**Reference Site:** https://www.chainswap.tech  
**Target Site:** https://decaflow.vercel.app  

---