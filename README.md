# Scraps Optimizer Chrome Extension

A Chrome extension that analyzes Hack Club Scraps shop and refinery pages to provide optimal spending recommendations with advanced probability calculations.

## Features

### Core Functionality
- **Shop Analysis**: Parses shop items (name, cost, chance percentage, images) and calculates cost-per-percentage efficiency
- **Refinery Analysis**: Extracts upgrade offers (bonus percentage, scrap cost) and determines optimal upgrade strategies
- **Auto-Popup Overlay**: Appears automatically on shop and refinery pages with draggable, resizable interface
- **Target Probability Calculator**: Allows users to set target success probability and calculates optimal upgrade/roll strategy

### Advanced Algorithms
- **Refinery Decision Algorithm**: Uses success-per-scrap scoring with amortization support to determine optimal upgrades
- **Target Probability Optimization**: Finds mathematically optimal target probability that minimizes expected total scraps
- **Binomial Distribution Calculations**: Accurate probability calculations using `1 - (1 - p_k)^n` formula

### User Interface
- **Dark/Light Theme**: Automatically detects browser theme preference, manual toggle available
- **Minimalistic Design**: Clean interface with gradient text, bordered badges, and proper color theming
- **Smart Overlay Behavior**: 
  - Fades to 30% opacity when hovering over overlapped buttons
  - Becomes fully invisible when hovering over previously clicked buttons
  - Remembers position across page reloads
- **Search Functionality**: Filter items by name in the overlay

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. Navigate to `https://scraps.hackclub.com/shop` or `https://scraps.hackclub.com/refinery`

## Usage

### First Time Setup
If no data is available, the extension will display: "Please visit Shop and Refinery and reload the pages and wait a few seconds."

### Shop Page
1. Extension auto-populates after 2 seconds
2. Click on any item to see target probability analysis
3. Use the slider to set desired success probability (defaults to mathematically optimal value)
4. View optimal upgrade strategy and expected costs

### Refinery Page
1. Extension shows available upgrades
2. Provides cost-per-bonus analysis
3. Integrates with shop analysis for comprehensive optimization

### Extension Popup
- **Theme Toggle**: Switch between dark/light modes
- **Pop-out Button**: Show overlay on shop/refinery pages

## File Structure

```
├── manifest.json              # Extension configuration
├── icons/                     # Extension icons (16x16, 48x48, 128x128)
├── popup.html                 # Extension popup interface
├── popup.js                   # Popup functionality and theme management
├── content_shop.js            # Shop page data extraction
├── content_refinery.js        # Refinery page data extraction
├── overlay.js                 # Auto-popup overlay with UI and interactions
├── refinery_decision.js       # Core optimization algorithm
├── target_probability.js      # Target probability calculations
└── optimal_target.js          # Optimal target probability finder
```

## Technical Details

### Data Storage
- Uses `chrome.storage.local` for persistence
- Stores shop items, refinery offers, wallet count, theme preference, and overlay position

### Algorithms

#### Refinery Decision Algorithm
```javascript
// Calculates optimal upgrades using success-per-scrap scoring
amort_factor = 1 + expected_future_rolls
effective_upgrade_cost = upgrade_cost / amort_factor
score_k = p_k / total_effective_cost_for_single_roll
```

#### Target Probability Calculation
```javascript
// Finds minimum scrap cost to reach target probability
n = ceil(ln(1 - target) / ln(1 - p_k))
total_scraps = upgrade_scraps + roll_scraps
```

### Browser Compatibility
- Chrome Manifest V3
- Supports both Chromium-based browsers
- Responsive to system theme changes

## Permissions

- `storage`: Save user preferences and cached data
- `host_permissions`: Access to `https://scraps.hackclub.com/*`

## Version History

- **v1.0.1**: Added comprehensive optimization features, target probability calculator, and smart overlay behavior
- **v1.0.0**: Initial release with basic shop and refinery analysis

## Contributing

This extension uses minimal, efficient code following these principles:
- Absolute minimal implementations
- No verbose or unnecessary code
- Direct solutions to specific problems
- Clean, readable structure

## License

Open source - feel free to modify and distribute.
