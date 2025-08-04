# Gemini Integration for Sequoia AI Message Compressor

This document describes the integration of Google Gemini (formerly Bard) support into the Sequoia AI Message Compressor extension.

## Overview

The Sequoia extension now supports automatic message compression for three major AI services:
- **ChatGPT** (OpenAI)
- **Claude AI** (Anthropic) 
- **Gemini** (Google)

## Gemini Request Structure

Gemini uses a complex nested JSON structure for its API requests:

```
f.req=[null,"[[\"user_message\",0,null,null,null,null,0],[\"en\"],...]"]
```

The structure consists of:
1. Form-encoded data with `f.req` parameter
2. URL-encoded JSON array where the first element is `null`
3. Second element contains the actual message data as a JSON string
4. Message data is nested: `messageData[0][0]` contains the user's message

## Implementation Details

### Message Extraction

The `extractGeminiUserMessage()` function:
1. Parses form-encoded request body
2. Extracts `f.req` parameter
3. Decodes URL encoding
4. Parses JSON to get the main array
5. Extracts the second element (message data string)
6. Parses the nested JSON string
7. Extracts user message from `messageData[0][0]`

### Message Update

The `updateGeminiMessageContent()` function:
1. Updates the message in the nested structure
2. Re-encodes the modified messageData back to JSON string
3. Updates the main parsedReq array
4. Re-encodes the entire request
5. Returns updated form-encoded body

### Endpoint Detection

Gemini endpoints are detected by checking for:
- `gemini.google.com`
- `bard.google.com`

## Testing

Run the test suite to verify Gemini integration:

```bash
node test_gemini_integration.js
```

This tests:
- ✅ Endpoint detection
- ✅ Message extraction
- ✅ Message update/compression
- ✅ Request body reconstruction

## Usage

1. Load the extension in Chrome
2. Navigate to [gemini.google.com](https://gemini.google.com)
3. Start typing messages
4. The extension will automatically compress your prompts before sending
5. Check the browser console for compression statistics

## Compression Results

The extension provides detailed compression feedback:
- Character count reduction
- Token count reduction (if available)
- Compression ratio percentages
- Original vs compressed text comparison

## Technical Notes

- Gemini requests use `application/x-www-form-urlencoded` content type
- The request body contains complex nested JSON structures
- Message extraction requires double JSON parsing
- Request reconstruction maintains the exact format expected by Gemini

## Troubleshooting

If compression isn't working:
1. Check browser console for error messages
2. Verify the extension is loaded on gemini.google.com
3. Ensure the compression service is running (localhost:8002)
4. Check that the request structure hasn't changed

## Future Enhancements

Potential improvements:
- Support for Gemini's streaming responses
- Better error handling for malformed requests
- Compression statistics dashboard
- Custom compression rules for Gemini-specific content 