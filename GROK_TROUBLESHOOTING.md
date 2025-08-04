# Grok Integration Troubleshooting Guide

## Issue: Extension Not Showing Up on Grok

If you're not seeing any console messages from the Sequoia extension when visiting https://grok.com, follow these troubleshooting steps:

## 🔧 Step-by-Step Troubleshooting

### 1. Verify Extension Installation

1. **Check if extension is installed:**
   - Go to `chrome://extensions/`
   - Look for "Sequoia" extension
   - Ensure it's **enabled** (toggle should be blue)

2. **Check extension details:**
   - Click "Details" on the Sequoia extension
   - Look for any error messages in the "Errors" section
   - If there are errors, click "Reload" and try again

### 2. Verify Extension Build

1. **Ensure latest build is loaded:**
   ```bash
   cd chrome-extension
   npm run build
   ```

2. **Load the correct folder:**
   - In `chrome://extensions/`, click "Load unpacked"
   - Select the `chrome-extension/dist` folder (not the `src` folder)
   - Make sure you're loading the `dist` folder, not the root folder

### 3. Test Extension Loading

1. **Open Grok in a new tab:**
   - Go to https://grok.com
   - Open Developer Tools (F12)
   - Go to Console tab

2. **Run the test script:**
   - Copy and paste this into the console:
   ```javascript
   // Test script to verify extension loading on Grok
   console.log('🧪 Testing Extension Loading on Grok...');
   
   // Test 1: Check if we're on a Grok page
   const isGrokPage = window.location.hostname.includes('grok.com');
   console.log('📍 Current page:', window.location.href);
   console.log('🎯 Is Grok page:', isGrokPage);
   
   // Test 2: Check if content script is loaded
   const contentScriptLoaded = window.sequoiaExtensionLoaded;
   console.log('🔧 Content script loaded:', contentScriptLoaded);
   
   // Test 3: Check if injected script is loaded
   const injectedScriptLoaded = window.aiMessageLoggerInjectedLoaded;
   console.log('🔧 Injected script loaded:', injectedScriptLoaded);
   
   // Test 4: Check if fetch is intercepted
   const originalFetch = window.fetch;
   const isFetchIntercepted = originalFetch.toString().includes('aiMessageLoggerInjectedLoaded');
   console.log('🔄 Fetch intercepted:', isFetchIntercepted);
   
   // Test 5: Check for any script tags with our extension
   const extensionScripts = document.querySelectorAll('script[data-sequoia-logger-injected]');
   console.log('📜 Extension script tags found:', extensionScripts.length);
   
   // Summary
   console.log('\n📊 Extension Loading Summary:');
   console.log('1. On Grok page:', isGrokPage ? '✅' : '❌');
   console.log('2. Content script loaded:', contentScriptLoaded ? '✅' : '❌');
   console.log('3. Injected script loaded:', injectedScriptLoaded ? '✅' : '❌');
   console.log('4. Fetch intercepted:', isFetchIntercepted ? '✅' : '❌');
   console.log('5. Script tags found:', extensionScripts.length);
   ```

### 4. Check Compression Service

1. **Verify service is running:**
   ```bash
   curl http://localhost:8002/health
   ```
   Should return: `{"status":"healthy","service":"Sequoia AI Message Compression"}`

2. **Start service if needed:**
   ```bash
   python3 start_simple_backend.py
   ```

### 5. Common Issues and Solutions

#### Issue: "Content script loaded: false"
**Solution:**
- Extension not properly installed
- Wrong folder loaded (should be `dist/`, not `src/`)
- Extension disabled
- Try reloading the extension

#### Issue: "Injected script loaded: false"
**Solution:**
- Content script not injecting properly
- CSP (Content Security Policy) blocking injection
- Try refreshing the page
- Check for JavaScript errors in console

#### Issue: "Fetch intercepted: false"
**Solution:**
- Injected script not working
- Grok might use different request methods
- Check for JavaScript errors

#### Issue: No console messages at all
**Solution:**
- Extension not installed
- Extension disabled
- Wrong folder loaded
- Check `chrome://extensions/` for errors

### 6. Manual Extension Reload

1. **Go to `chrome://extensions/`**
2. **Find "Sequoia" extension**
3. **Click "Reload" button**
4. **Refresh Grok page**
5. **Check console again**

### 7. Verify Manifest Permissions

The extension should have these permissions in `manifest.json`:

```json
{
  "host_permissions": [
    "https://grok.com/*",
    "https://*.grok.com/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "https://grok.com/*",
        "https://*.grok.com/*"
      ],
      "js": ["dist/content.js"],
      "run_at": "document_start"
    }
  ]
}
```

### 8. Test with Other AI Services

To verify the extension works in general:

1. **Test on ChatGPT:** https://chat.openai.com
2. **Test on Claude:** https://claude.ai
3. **Test on Gemini:** https://gemini.google.com

If it works on other services but not Grok, the issue is Grok-specific.

### 9. Debug Network Requests

1. **Open Developer Tools**
2. **Go to Network tab**
3. **Send a message on Grok**
4. **Look for requests to:**
   - `grok.com/rest/app-chat/conversations/new`
   - `grok.com/rest/app-chat/conversations/*/responses`

### 10. Final Verification

After following all steps, you should see:

```
🔧 Sequoia AI Message Logger Extension: Content script bridge loaded!
🔧 Sequoia AI Message Logger Extension: Injected script loaded successfully
🔧 Sequoia AI Message Logger Extension: Page interceptor loaded!
```

## 🚨 Still Not Working?

If none of the above steps work:

1. **Check browser console for errors**
2. **Try a different browser (Firefox, Edge)**
3. **Check if Grok has changed their API endpoints**
4. **Verify the extension works on other AI services**
5. **Contact support with console logs**

## 📋 Quick Checklist

- [ ] Extension installed and enabled
- [ ] Loading `chrome-extension/dist` folder
- [ ] Latest build (`npm run build`)
- [ ] Compression service running (`curl http://localhost:8002/health`)
- [ ] On https://grok.com
- [ ] Developer Tools open (F12)
- [ ] Console tab selected
- [ ] Page refreshed after extension reload 