# ChatGPT Message Compressor - Chrome Extension

A Chrome extension that automatically compresses your ChatGPT messages to reduce token usage and save costs.

## Features

- 🚀 **Automatic Compression**: Intercepts ChatGPT API calls and compresses user messages
- 📊 **Real-time Stats**: Shows compression ratios and token savings
- 🎯 **Smart Compression**: Uses advanced AI-powered compression algorithms
- 🔧 **Easy Setup**: Simple installation and configuration
- 📈 **Performance Monitoring**: Track your compression statistics over time

## Architecture

This extension consists of two main components:

1. **Chrome Extension** (Frontend)
   - Content script that intercepts ChatGPT API calls
   - Background script that manages the compression service
   - Popup UI for settings and statistics
   - Service worker for background processing

2. **Python Backend Service** (Backend)
   - Flask API server running on localhost:8002
   - Advanced compression algorithms
   - Token counting and optimization
   - Health monitoring and statistics

## Quick Start

### 1. Start the Backend Service

```bash
# Navigate to the extension directory
cd chrome-extension

# Start the backend service
python3 start_backend.py
```

This will:
- Install required Python dependencies
- Start the compression service on http://localhost:8002
- Show setup instructions

### 2. Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### 3. Test the Extension

1. Go to https://chat.openai.com
2. Start chatting normally
3. Look for green notifications showing compression stats
4. Check the browser console for detailed logs

## Manual Backend Setup

If the automatic startup doesn't work, you can set up the backend manually:

### Install Dependencies

```bash
# Navigate to the parent directory (where the backend files are)
cd ..

# Install Python dependencies
pip3 install -r requirements.txt
```

### Start the Service

```bash
# Start the compression service
python3 improved_compression_service.py
```

The service will run on http://localhost:8002

## Extension Components

### Content Script (`src/content.js`)
- Intercepts fetch requests to ChatGPT API endpoints
- Extracts user messages from request bodies
- Sends messages to background script for compression
- Shows compression notifications
- Updates requests with compressed messages

### Background Script (`src/background.js`)
- Manages communication with the compression service
- Handles service health monitoring
- Tracks compression statistics
- Provides API for content script and popup

### Popup UI (`pages/popup/`)
- Shows service status and statistics
- Provides settings and configuration
- Displays compression history

## API Endpoints

The backend service provides these endpoints:

- `GET /` - Service information
- `GET /health` - Health check
- `POST /compress` - Compress text
- `GET /stats` - Service statistics

## Configuration

### Service URL
The extension connects to the compression service at `http://localhost:8002`. You can modify this in:
- `src/background.js` - `COMPRESSION_SERVICE_URL`
- `src/content.js` - `COMPRESSION_SERVICE_URL`

### Permissions
The extension requires these permissions:
- `activeTab` - Access to current tab
- `storage` - Store settings and statistics
- `scripting` - Inject content scripts
- `host_permissions` - Access to ChatGPT and localhost

## Troubleshooting

### Service Not Starting
1. Check if port 8002 is available
2. Ensure Python dependencies are installed
3. Check the console for error messages

### Extension Not Working
1. Verify the backend service is running
2. Check browser console for errors
3. Ensure the extension is loaded correctly
4. Check if you're on a ChatGPT page

### Compression Not Working
1. Check if the service is healthy: http://localhost:8002/health
2. Look for compression notifications
3. Check browser console for detailed logs
4. Verify the message is long enough to compress (>10 characters)

## Development

### Building the Extension
The extension uses webpack for building. To build:

```bash
npm install
npm run build
```

### Testing
Run the test suite:

```bash
python3 test_compression.py
```

### Debugging
- Check browser console for extension logs
- Monitor the backend service logs
- Use Chrome DevTools for extension debugging

## File Structure

```
chrome-extension/
├── src/
│   ├── background.js          # Background service worker
│   ├── content.js             # Content script for ChatGPT pages
│   ├── injected.js            # Injected script
│   ├── utils/
│   │   └── api.js             # API utilities
│   └── components/            # React components
├── pages/
│   ├── popup/                 # Extension popup
│   └── options/               # Options page
├── assets/                    # Icons and images
├── manifest.json              # Extension manifest
├── start_backend.py           # Backend startup script
└── README.md                  # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues:
1. Check the troubleshooting section
2. Look at the browser console for error messages
3. Verify the backend service is running
4. Create an issue with detailed information 