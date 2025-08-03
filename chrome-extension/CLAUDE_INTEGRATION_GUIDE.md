# Claude AI Integration Guide

## Overview
The Sequoia extension now supports both ChatGPT and Claude AI. It automatically detects and compresses messages for both services.

## What Was Updated

### 1. Manifest.json Changes
- Added Claude AI domains to `host_permissions`: `https://claude.ai/*`, `https://*.claude.ai/*`
- Added Claude AI domains to `content_scripts` matches
- Updated extension name and description to reflect multi-service support

### 2. Injected Script Updates (src/injected.js)
- **New Claude Endpoints Detection**: Added `CLAUDE_ENDPOINTS` array to detect Claude API calls
- **Claude Message Extraction**: New `extractClaudeUserMessage()` function that handles Claude's prompt structure
- **Claude Message Updates**: New `updateClaudeMessageContent()` function that updates the `prompt` field
- **Unified Processing**: Updated main fetch interceptor to handle both ChatGPT and Claude requests

### 3. Content Script Updates (src/content.js)
- Updated naming from "ChatGPT Logger" to "Sequoia AI Logger" 
- Updated injection markers to be service-agnostic

### 4. Background Script Updates (src/background.js)
- Added Claude AI URL detection in tab listener
- Updated console messages to reflect multi-service support

## How It Works with Claude AI

### Request Structure Differences
**ChatGPT** uses:
```json
{
  "messages": [
    {
      "role": "user", 
      "content": "Your message here"
    }
  ]
}
```

**Claude AI** uses:
```json
{
  "prompt": "Your message here",
  "parent_message_uuid": "...",
  "timezone": "...",
  // ... other fields
}
```

### Detection Logic
- The extension detects Claude AI requests by looking for URLs containing `claude.ai/api`
- For Claude, it extracts the `prompt` field directly
- For Claude, it updates the `prompt` field with the compressed content

## Testing the Claude Integration

### Prerequisites
1. Build the extension: `npm run build`
2. Load the extension in Chrome as an unpacked extension from the `dist/` folder
3. Ensure the compression backend service is running at `http://localhost:8002`

### Test Steps
1. **Navigate to Claude AI**: Go to https://claude.ai
2. **Open Developer Tools**: Press F12 and go to Console tab
3. **Send a message**: Type a long message (>100 characters) in Claude's input field
4. **Look for logs**: You should see console logs like:
   ```
   🔧 Sequoia AI Message Logger Extension: Page interceptor loaded!
   [AI Message Logger] Intercepted Claude AI API call: https://claude.ai/api/organizations/.../completion
   [AI Message Logger] Found Claude AI user message: Your long message here...
   [AI Message Logger] 🔄 Getting compressed version of message...
   🗜️ PROMPT COMPRESSION RESULTS
   ```

### Expected Behavior
- ✅ Extension loads on Claude AI pages
- ✅ Fetch requests to Claude's completion API are intercepted
- ✅ User prompts are extracted from the `prompt` field
- ✅ Compressed prompts are injected back into the `prompt` field
- ✅ Compression statistics are logged to console
- ✅ Success notification appears in top-right corner

### Debugging
If the extension isn't working on Claude:
1. Check the Console for any error messages
2. Verify the extension is loaded: Look for "Sequoia AI Message Logger Extension: Page interceptor loaded!"
3. Check Network tab to see if Claude API calls are being made
4. Verify the compression service is running by checking `http://localhost:8002/health`

## API Endpoint Patterns
The extension monitors these patterns:

**ChatGPT:**
- `backend-api`
- `api.openai.com`
- `chatgpt.com/api`
- `chat.openai.com/api`

**Claude AI:**
- `claude.ai/api`

## Supported Request Types
- **ChatGPT**: POST requests to URLs containing `conversation` or `chat`
- **Claude AI**: POST requests to URLs containing `completion`