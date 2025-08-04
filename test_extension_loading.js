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

// Test 6: Check for any console messages from our extension
console.log('🔍 Looking for extension console messages...');
const originalLog = console.log;
let extensionMessages = [];
console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('Sequoia') || message.includes('AI Message Logger')) {
        extensionMessages.push(message);
    }
    originalLog.apply(console, args);
};

// Wait a bit and then check for messages
setTimeout(() => {
    console.log = originalLog; // Restore original console.log
    
    console.log('📋 Extension messages found:', extensionMessages.length);
    extensionMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg}`);
    });
    
    // Summary
    console.log('\n📊 Extension Loading Summary:');
    console.log('1. On Grok page:', isGrokPage ? '✅' : '❌');
    console.log('2. Content script loaded:', contentScriptLoaded ? '✅' : '❌');
    console.log('3. Injected script loaded:', injectedScriptLoaded ? '✅' : '❌');
    console.log('4. Fetch intercepted:', isFetchIntercepted ? '✅' : '❌');
    console.log('5. Script tags found:', extensionScripts.length);
    console.log('6. Extension messages:', extensionMessages.length);
    
    if (!contentScriptLoaded) {
        console.log('\n🚨 ISSUE: Content script not loaded!');
        console.log('   - Check if extension is installed in Chrome');
        console.log('   - Check if extension is enabled');
        console.log('   - Check manifest.json content_scripts matches');
        console.log('   - Try reloading the extension');
    }
    
    if (!injectedScriptLoaded) {
        console.log('\n🚨 ISSUE: Injected script not loaded!');
        console.log('   - Content script may not be injecting properly');
        console.log('   - Check for CSP (Content Security Policy) issues');
        console.log('   - Check web_accessible_resources in manifest.json');
        console.log('   - Try refreshing the page');
    }
    
    if (!isFetchIntercepted) {
        console.log('\n🚨 ISSUE: Fetch not intercepted!');
        console.log('   - Injected script may not be working properly');
        console.log('   - Check for JavaScript errors in console');
        console.log('   - Check if Grok uses different request methods');
    }
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Go to chrome://extensions/');
    console.log('2. Find "Sequoia" extension');
    console.log('3. Click "Details"');
    console.log('4. Check "Errors" section');
    console.log('5. Try "Reload" button');
    console.log('6. Refresh Grok page');
    
}, 2000); 