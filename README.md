# Sequoia - AI Message Compression Extension

A Chrome extension that automatically compresses messages for ChatGPT, Claude AI, Gemini, and Grok AI to improve efficiency and reduce token usage.

## Quick Start

### 1. Setup

```bash
# Install Python dependencies
pip3 install -r requirements.txt
```

This will install Flask, Flask-CORS, and other dependencies needed for the message logger service.

### 2. Start the Message Logger Service

```bash
python3 start_simple_backend.py
```

Or start the service directly:

```bash
python3 message_logger_service.py
```

You should see:
```
🚀 Starting ChatGPT Message Logger Service...
📡 Service will run on http://localhost:8002
```

### 3. Test the Backend

```bash
python3 test_simple_backend.py
```

This will test the message logger service and verify it's working correctly.

### 4. Use with Chrome Extension

1. Build the extension: `cd chrome-extension && npm run build`
2. Load the `chrome-extension/dist` folder as an unpacked extension in Chrome
3. Open any supported AI service:
   - [ChatGPT](https://chat.openai.com)
   - [Claude AI](https://claude.ai)
   - [Gemini](https://gemini.google.com)
   - [Grok AI](https://grok.com)
4. Start chatting - your messages will be automatically compressed!
5. Look for green notifications showing compression results

## How It Works

### Backend Components

1. **`message_logger_service.py`** - Flask service that compresses messages using AI
2. **`chrome-extension/src/content.js`** - Content script that intercepts fetch requests to AI services
3. **`chrome-extension/src/background.js`** - Background script that manages the extension
4. **`start_simple_backend.py`** - Startup script that handles dependencies and service management
5. **`test_simple_backend.py`** - Test suite for the compression service

### Request Flow

1. You type a message in any supported AI service (ChatGPT, Claude, Gemini, or Grok)
2. Chrome extension intercepts the fetch request
3. Extracts the user message from the request body
4. Sends message to compression service (localhost:8002)
5. Compression service returns a compressed version of the message
6. Extension replaces the original message with the compressed version
7. Shows compression results via notification
8. Modified request continues to the AI service

### Example

**Original message sent to AI service:**
```
I am really interested in learning more about Python programming and would like to know the best practices for writing clean, maintainable code that follows industry standards
```

**Compressed message sent to AI service:**
```
I want to learn Python programming best practices for clean, maintainable code
```

**Compression results:**
```json
{
  "original_length": 156,
  "compressed_length": 78,
  "compression_ratio": "50%",
  "original_tokens": 45,
  "compressed_tokens": 22,
  "token_compression_ratio": "51%"
}
```

## API Endpoints

### POST /log-message
Compress a message using AI.

**Request:**
```json
{
  "message": "Your message to compress",
  "url": "https://chat.openai.com/c/abc123"
}
```

**Response:**
```json
{
  "compression": {
    "success": true,
    "original": "Your original message here",
    "compressed": "Compressed version of your message",
    "original_length": 156,
    "compressed_length": 78,
    "compression_ratio": "50%",
    "original_tokens": 45,
    "compressed_tokens": 22,
    "token_compression_ratio": "51%",
    "method": "AI compression"
  }
}
```

### GET /messages
Get all compressed messages and statistics.

**Response:**
```json
{
  "stats": {
    "total_messages": 42,
    "total_compression_savings": "2.3MB",
    "average_compression_ratio": "45%",
    "start_time": "2024-01-15T09:00:00.000000"
  },
  "recent_messages": [...]
}
```

### GET /health
Check service health.

**Response:**
```json
{
  "status": "healthy",
  "service": "Sequoia AI Message Compression",
  "total_messages": 42,
  "compression_enabled": true
}
```

### GET /
Service information.

**Response:**
```json
{
  "service": "Sequoia AI Message Compression",
  "version": "1.0.0",
  "supported_services": ["ChatGPT", "Claude AI", "Gemini", "Grok AI"]
}
```

## Chrome Extension

The Chrome extension consists of:

- **Content Script** (`src/content.js`): Intercepts AI service API calls and compresses messages
- **Background Script** (`src/background.js`): Manages extension state and service communication
- **Popup UI** (`pages/popup/`): Extension popup interface with compression stats
- **Options Page** (`pages/options/`): Extension settings and configuration
- **Injected Script** (`src/injected.js`): Core logic for intercepting and modifying requests

### Supported AI Services

- **ChatGPT** (chat.openai.com, chatgpt.com)
- **Claude AI** (claude.ai)
- **Gemini** (gemini.google.com, bard.google.com)
- **Grok AI** (grok.com)

### Installation

1. Build the extension: `cd chrome-extension && npm run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `chrome-extension/dist` folder
6. The extension will be installed and active

## Development

### Running Tests

```bash
# Test the compression service
python3 test_simple_backend.py

# Test Grok integration
node test_grok_integration.js

# Test the Chrome extension (if you have Node.js installed)
cd chrome-extension
npm test
```

### Service Management

```bash
# Start the compression service
python3 start_simple_backend.py

# Stop the service
Ctrl+C

# Check service health
curl http://localhost:8002/health

# View compression statistics
curl http://localhost:8002/messages
```

## Configuration

The compression service runs on `http://localhost:8002` by default. You can modify the port in `message_logger_service.py` if needed.

## Integration Guides

For detailed information about each AI service integration:

- [Claude AI Integration Guide](chrome-extension/CLAUDE_INTEGRATION_GUIDE.md)
- [Grok AI Integration Guide](chrome-extension/GROK_INTEGRATION_GUIDE.md)

## Troubleshooting

### Service Won't Start
- Check if port 8002 is available
- Ensure all dependencies are installed: `pip3 install -r requirements.txt`
- Check the service logs for error messages

### Extension Not Working
- Ensure the compression service is running on `http://localhost:8002`
- Check browser console for error messages
- Verify the extension is loaded in Chrome extensions page
- Check that you're on a supported AI service page (ChatGPT, Claude, Gemini, or Grok)

### Messages Not Being Compressed
- Check if the compression service is running: `curl http://localhost:8002/health`
- Look for compression notifications in the browser
- Check browser console for network errors
- Verify the content script is injected on supported AI service pages

## License

This project is open source and available under the MIT License.