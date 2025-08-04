# Environmental Impact Tracking - Sequoia Extension

## Overview

The Sequoia extension now includes comprehensive environmental impact tracking that monitors CO2 and water savings based on token compression. Every time a message is compressed, the extension calculates and stores the environmental impact savings.

## Features

### 🌱 Environmental Impact Calculation
- **CO2 Savings**: 0.04g saved per token compressed
- **Water Savings**: 0.5mL saved per token compressed
- **Real-time Updates**: Progress bars update immediately when compression occurs
- **Persistent Storage**: Values persist across browser sessions

### 📊 Progress Tracking
- Visual progress bars showing CO2 and water savings
- Percentage-based progress indicators
- Formatted display (e.g., "1.2g CO2 Saved", "15.0mL Water Saved")

### 💾 Persistent Storage
- Values are stored in Chrome's local storage
- Automatically initialized to 0 on first install
- Survives browser restarts and extension updates

## Technical Implementation

### Storage Structure
```javascript
// Storage keys used by the extension
const STORAGE_KEYS = {
  CO2_SAVED: 'co2Saved',      // Total CO2 saved in grams
  WATER_SAVED: 'waterSaved',  // Total water saved in milliliters
  IS_PAUSED: 'isPaused'       // Compression pause state
};
```

### Environmental Impact Constants
```javascript
const ENVIRONMENTAL_IMPACT = {
  WATER_PER_TOKEN: 0.5, // 0.5 mL of water saved per token
  CO2_PER_TOKEN: 0.04   // 0.04g of CO2 saved per token
};
```

### File Structure
```
chrome-extension/src/
├── utils/
│   └── storage.js          # Storage utility functions
├── components/
│   └── Main.jsx           # Updated UI with real-time progress bars
├── background.js          # Updated to track savings on compression
└── content.js            # Bridge to background script
```

## How It Works

### 1. Initialization
When the extension loads:
- Storage is initialized with default values (0 for savings)
- Progress bars are updated with current values
- Storage change listeners are set up for real-time updates

### 2. Compression Tracking
When a message is compressed:
- Background script receives compression results
- Tokens saved are calculated: `original_tokens - compressed_tokens`
- Environmental impact is calculated:
  - CO2: `tokens_saved × 0.04g`
  - Water: `tokens_saved × 0.5mL`
- Values are stored in Chrome's local storage

### 3. UI Updates
- Progress bars update in real-time via storage change listeners
- Values are formatted for display (e.g., "1.2g", "15.0mL")
- Progress percentages are calculated for visual feedback

## Usage

### For Users
1. Install the extension
2. Navigate to a supported AI service (ChatGPT, Claude, Gemini, Grok)
3. Start chatting normally
4. Watch the progress bars update as messages are compressed
5. Values persist when you close and reopen Chrome

### For Developers
1. The storage utilities are available in `src/utils/storage.js`
2. Use `getSavings()` to retrieve current values
3. Use `updateSavings(tokensSaved)` to add new savings
4. Use `formatSavings(co2, water)` to format values for display

## Testing

### Manual Testing
1. Load the extension in Chrome
2. Send a message on a supported AI service
3. Check the extension popup for updated progress bars
4. Close and reopen Chrome to verify persistence

### Automated Testing
Run the test script to simulate compression:
```bash
node test_storage.js
```

This will:
- Send a test message to the compression service
- Calculate expected savings
- Provide verification steps

## Example Output

After compressing a message with 30 tokens saved:
```
📊 Original tokens: 40
📊 Compressed tokens: 10
📊 Tokens saved: 30
📊 Token compression ratio: 75%
🌱 Expected CO2 saved: 1.20g
💧 Expected water saved: 15.00mL
```

## Progress Bar Scaling

The progress bars use the following scaling:
- **CO2 Progress**: Scales to 100g maximum (100% = 100g saved)
- **Water Progress**: Scales to 1000mL maximum (100% = 1000mL saved)

This provides meaningful visual feedback while accommodating realistic usage patterns.

## Future Enhancements

Potential improvements:
- Export savings data
- Share achievements on social media
- Compare with real-world equivalents (e.g., "equivalent to planting X trees")
- Historical tracking and trends
- Goal setting and achievements

## Troubleshooting

### Values Not Updating
1. Check browser console for errors
2. Verify the backend service is running
3. Ensure compression is not paused
4. Check storage permissions

### Values Reset to Zero
1. Check if storage was cleared
2. Verify extension was not reinstalled
3. Check for storage quota issues

### Progress Bars Not Showing
1. Verify the extension popup is loading correctly
2. Check for JavaScript errors in the popup
3. Ensure the storage utilities are properly imported 