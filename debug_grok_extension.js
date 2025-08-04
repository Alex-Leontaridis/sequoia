// Debug script to troubleshoot Grok extension issues
console.log('🔍 Debugging Grok Extension Issues...');

// Check if we're on a Grok page
const isGrokPage = window.location.hostname.includes('grok.com');
console.log('📍 Current page:', window.location.href);
console.log('🎯 Is Grok page:', isGrokPage);

// Check if extension is loaded
const extensionLoaded = window.aiMessageLoggerInjectedLoaded;
console.log('🔧 Extension loaded:', extensionLoaded);

// Check if fetch is intercepted
const originalFetch = window.fetch;
const isFetchIntercepted = originalFetch.toString().includes('aiMessageLoggerInjectedLoaded');
console.log('🔄 Fetch intercepted:', isFetchIntercepted);

// Test Grok endpoint detection
function testGrokEndpoints() {
    const testUrls = [
        'https://grok.com/rest/app-chat/conversations/new',
        'https://grok.com/rest/app-chat/conversations/123/responses',
        'https://grok.com/api/test',
        'https://grok.com/rest/test'
    ];
    
    console.log('🧪 Testing Grok endpoint detection:');
    testUrls.forEach(url => {
        const isGrokEndpoint = url.includes('grok.com/rest/app-chat') || 
                              url.includes('grok.com/api') || 
                              url.includes('grok.com/rest');
        console.log(`  ${url}: ${isGrokEndpoint ? '✅' : '❌'}`);
    });
}

// Test message extraction
function testMessageExtraction() {
    const testMessage = {
        message: "This is a test message for Grok integration debugging",
        modelName: "grok-3",
        temporary: false
    };
    
    console.log('🧪 Testing message extraction:');
    console.log('  Test message:', testMessage);
    
    if (testMessage.message && typeof testMessage.message === 'string' && testMessage.message.length > 10) {
        console.log('  ✅ Message extraction would work');
        console.log('  📏 Message length:', testMessage.message.length);
    } else {
        console.log('  ❌ Message extraction would fail');
    }
}

// Run tests
testGrokEndpoints();
testMessageExtraction();

// Check for any console errors
console.log('🔍 Checking for console errors...');
const originalError = console.error;
console.error = function(...args) {
    console.log('❌ Console error detected:', ...args);
    originalError.apply(console, args);
};

// Monitor network requests
console.log('🌐 Monitoring network requests...');
const originalFetch2 = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('grok.com')) {
        console.log('🎯 Grok API call detected:', url);
        console.log('  Method:', args[1]?.method || 'GET');
        console.log('  Has body:', !!args[1]?.body);
    }
    return originalFetch2.apply(this, args);
};

console.log('📋 Debug Summary:');
console.log('1. Extension loaded:', extensionLoaded ? '✅' : '❌');
console.log('2. Fetch intercepted:', isFetchIntercepted ? '✅' : '❌');
console.log('3. On Grok page:', isGrokPage ? '✅' : '❌');

if (!extensionLoaded) {
    console.log('🚨 ISSUE: Extension not loaded!');
    console.log('   - Check if extension is installed in Chrome');
    console.log('   - Check if extension is enabled');
    console.log('   - Check if content script is injected');
    console.log('   - Try refreshing the page');
}

if (!isFetchIntercepted) {
    console.log('🚨 ISSUE: Fetch not intercepted!');
    console.log('   - Extension may not be properly injected');
    console.log('   - Check browser console for errors');
}

console.log('🔧 Next steps:');
console.log('1. Check Chrome extensions page (chrome://extensions/)');
console.log('2. Ensure extension is enabled and loaded');
console.log('3. Check for any error messages in extension details');
console.log('4. Try reloading the extension');
console.log('5. Check if compression service is running: curl http://localhost:8002/health'); 