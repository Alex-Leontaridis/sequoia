# ChatGPT Message Compressor - Basic Backend

A simple backend that intercepts ChatGPT requests and compresses user messages using the [prompt_compressor](https://github.com/metawake/prompt_compressor) library to reduce token usage.

## Quick Start

### 1. Setup

```bash
# Install Python dependencies
pip3 install -r requirements.txt

# Clone and install the prompt_compressor library
git clone https://github.com/metawake/prompt_compressor.git
cd prompt_compressor
pip3 install -e .
cd ..
```

This will:
- Install Flask, Flask-CORS, and other dependencies
- Clone the prompt_compressor library from GitHub
- Install the prompt_compressor library

### 2. Start the Compression Service

```bash
python3 improved_compression_service.py
```

You should see:
```
✓ prompt_compressor library loaded successfully
Starting ChatGPT Compression Service on http://localhost:8002
Library available: True
```

### 3. Test the Backend

```bash
python3 test_compression.py
```

This will test the compression service and show example compressions.

### 4. Use with ChatGPT

1. Open [https://chatgpt.com](https://chatgpt.com) in your browser
2. Open browser console (F12)
3. Copy and paste the entire contents of `chatgpt_interceptor.js` into the console
4. Press Enter to run the script
5. Start chatting - your messages will be automatically compressed!

## How It Works

### Backend Components

1. **`improved_compression_service.py`** - Advanced Flask service that compresses text using the prompt_compressor library
2. **`chatgpt_interceptor.js`** - Browser script that intercepts fetch requests to ChatGPT
3. **`start_service.py`** - Startup script that handles dependencies and service management
4. **`test_compression.py`** - Comprehensive test suite for the compression service

### Request Flow

1. You type a message in ChatGPT
2. Browser script intercepts the fetch request
3. Extracts the user message from the request body
4. Sends message to compression service (localhost:8002)
5. Compression service compresses the message using prompt_compressor
6. Browser script updates the request with compressed message
7. Modified request is sent to ChatGPT
8. Shows compression stats via notification

### Example

**Original message:**
```
I am really interested in learning more about Python programming and would like to know the best practices
```

**Compressed message:**
```
I'm interested in learning about Python programming and want to know the best practices
```

**Result:** 15% token reduction

## API Endpoints

### POST /compress
Compress a text message.

**Request:**
```json
{
  "text": "Your message to compress"
}
```

**Response:**
```json
{
  "original_text": "I am really interested in learning more about...",
  "compressed_text": "I'm interested in learning about...",
  "compression_ratio": 15.5,
  "method": "library"
}
```

### GET /health
Check service health and library availability.

**Response:**
```json
{
  "status": "healthy",
  "service": "chatgpt_compressor", 
  "library_available": true
}
```

## Browser Script Usage

### Option 1: Console (Quick Test)
1. Open ChatGPT in browser
2. Open console (F12)
3. Paste contents of `chatgpt_interceptor.js`
4. Press Enter

### Option 2: Userscript (Permanent)
1. Install Tampermonkey browser extension
2. Create new script
3. Paste contents of `chatgpt_interceptor.js`
4. Save and enable

### Option 3: Bookmarklet
Create a bookmark with this JavaScript code:
```javascript
javascript:(function(){var script=document.createElement('script');script.src='data:text/javascript,'+encodeURIComponent('/* paste chatgpt_interceptor.js content here */');document.head.appendChild(script);})();
```

## Configuration

### Enable/Disable Debug Logging
In `chatgpt_interceptor.js`, change:
```javascript
const DEBUG = false; // Set to false to disable logging
```

### Change Service Port
In `improved_compression_service.py`, change:
```python
app.run(host='0.0.0.0', port=8002)  # Change port here
```

Don't forget to update the URL in `chatgpt_interceptor.js`:
```javascript
const COMPRESSION_SERVICE_URL = 'http://localhost:8002/compress';
```

## Troubleshooting

### Service Won't Start
- Check if port 8002 is already in use
- Make sure Flask is installed: `pip3 install flask flask-cors`
- Check if prompt_compressor library is installed properly

### Browser Script Not Working
- Check browser console for errors
- Verify the compression service is running (visit http://localhost:8002/health)
- Make sure you're on chatgpt.com when running the script

### No Compression Happening
- Check if messages are long enough (minimum 10 characters)
- Look for green notifications after sending messages
- Check browser console for compression logs

### Library Not Available
If you see `library_available: false`, run:
```bash
cd prompt_compressor
pip3 install -e .
```

## Files

- `improved_compression_service.py` - Advanced compression service with multiple compression methods
- `chatgpt_interceptor.js` - Browser interceptor script  
- `start_service.py` - Startup and service management script
- `test_compression.py` - Comprehensive test suite
- `requirements.txt` - Python dependencies

## Dependencies

- Python 3.6+
- Flask
- Flask-CORS
- [prompt_compressor](https://github.com/metawake/prompt_compressor) library

## License

MIT License - see the prompt_compressor library for its licensing terms.