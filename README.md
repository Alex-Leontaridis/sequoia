# ChatGPT Message Logger - Simple Backend

A simple backend that intercepts ChatGPT requests and logs user messages for analysis and monitoring.

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

1. Load the `chrome-extension` folder as an unpacked extension in Chrome
2. Open [https://chat.openai.com](https://chat.openai.com) in your browser
3. Start chatting - your messages will be automatically logged!
4. Look for blue notifications showing message logging

## How It Works

### Backend Components

1. **`message_logger_service.py`** - Simple Flask service that logs messages
2. **`chrome-extension/src/content.js`** - Content script that intercepts fetch requests to ChatGPT
3. **`chrome-extension/src/background.js`** - Background script that manages the extension
4. **`start_simple_backend.py`** - Startup script that handles dependencies and service management
5. **`test_simple_backend.py`** - Test suite for the message logger service

### Request Flow

1. You type a message in ChatGPT
2. Chrome extension intercepts the fetch request
3. Extracts the user message from the request body
4. Sends message to logger service (localhost:8002)
5. Logger service stores the message with timestamp and URL
6. Shows logging confirmation via notification
7. Original request continues to ChatGPT unchanged

### Example

**Message sent to ChatGPT:**
```
I am really interested in learning more about Python programming and would like to know the best practices
```

**Logged in service:**
```json
{
  "timestamp": "2024-01-15T10:30:45.123456",
  "message": "I am really interested in learning more about Python programming and would like to know the best practices",
  "url": "https://chat.openai.com/c/abc123",
  "length": 108
}
```

## API Endpoints

### POST /log-message
Log a message with metadata.

**Request:**
```json
{
  "message": "Your message to log",
  "url": "https://chat.openai.com/c/abc123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Message logged successfully",
  "timestamp": "2024-01-15T10:30:45.123456",
  "message_length": 108
}
```

### GET /messages
Get all logged messages and statistics.

**Response:**
```json
{
  "stats": {
    "total_messages": 42,
    "messages": [...],
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
  "service": "ChatGPT Message Logger",
  "total_messages": 42
}
```

### GET /
Service information.

**Response:**
```json
{
  "service": "ChatGPT Message Logger",
  "version": "1.0.0"
}
```

## Chrome Extension

The Chrome extension consists of:

- **Content Script** (`src/content.js`): Intercepts ChatGPT API calls and logs messages
- **Background Script** (`src/background.js`): Manages extension state and service communication
- **Popup UI** (`pages/popup/`): Extension popup interface
- **Options Page** (`pages/options/`): Extension settings

### Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension will be installed and active

## Development

### Running Tests

```bash
# Test the message logger service
python3 test_simple_backend.py

# Test the Chrome extension (if you have Node.js installed)
cd chrome-extension
npm test
```

### Service Management

```bash
# Start the service
python3 start_simple_backend.py

# Stop the service
Ctrl+C

# Check service health
curl http://localhost:8002/health

# View logged messages
curl http://localhost:8002/messages
```

## Configuration

The service runs on `http://localhost:8002` by default. You can modify the port in `message_logger_service.py` if needed.

## Troubleshooting

### Service Won't Start
- Check if port 8002 is available
- Ensure all dependencies are installed: `pip3 install -r requirements.txt`
- Check the service logs for error messages

### Extension Not Working
- Ensure the service is running on `http://localhost:8002`
- Check browser console for error messages
- Verify the extension is loaded in Chrome extensions page
- Check that you're on a ChatGPT page (chat.openai.com)

### Messages Not Being Logged
- Check if the service is running: `curl http://localhost:8002/health`
- Look for notifications in the browser
- Check browser console for network errors
- Verify the content script is injected on ChatGPT pages

## License

This project is open source and available under the MIT License.