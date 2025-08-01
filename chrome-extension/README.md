# ChatGPT Compressor Chrome Extension

A Chrome extension that compresses ChatGPT messages to reduce token usage.

## Development

### Setup
```bash
npm install
```

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Load Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## Structure

- `src/` - Source code
  - `background.js` - Service worker
  - `content.js` - Content script
  - `injected.js` - Injected script
  - `pages/` - Extension pages (popup, options)
  - `components/` - React components
  - `utils/` - Utility functions
- `public/` - Static assets
- `dist/` - Built extension 