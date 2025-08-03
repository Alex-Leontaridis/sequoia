// Content script for ChatGPT Message Logger Extension with Spanish modification
// Bridge between page world and extension context to avoid CSP issues

// Prevent multiple executions
if (window.chatgptLoggerExtensionLoaded) {
    console.log('🔧 ChatGPT Message Logger Extension: Already loaded, skipping...');
} else {
    window.chatgptLoggerExtensionLoaded = true;
    
    // Extension context (isolated world) - bridge to background script
window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data?.type !== 'LOG_MESSAGE_REQUEST') return;

    // Check if extension context is still valid
    try {
        if (!chrome.runtime || !chrome.runtime.id) {
            console.log('🔧 ChatGPT Message Logger Extension: Context invalidated, skipping...');
            window.postMessage({
                type: 'LOG_MESSAGE_RESPONSE',
                id: event.data.id,
                result: { error: 'Extension context invalidated' }
            }, '*');
            return;
        }

        // Forward to background script
        chrome.runtime.sendMessage(
            { action: 'logMessage', message: event.data.message, url: event.data.url },
            (response) => {
                // Check for errors
                if (chrome.runtime.lastError) {
                    console.log('🔧 ChatGPT Message Logger Extension: Runtime error:', chrome.runtime.lastError);
                    window.postMessage({
                        type: 'LOG_MESSAGE_RESPONSE',
                        id: event.data.id,
                        result: { error: chrome.runtime.lastError.message }
                    }, '*');
                    return;
                }

                // Send response back to page world
                window.postMessage({
                    type: 'LOG_MESSAGE_RESPONSE',
                    id: event.data.id,
                    result: response
                }, '*');
            }
        );
    } catch (error) {
        console.log('🔧 ChatGPT Message Logger Extension: Caught extension error:', error.message);
        window.postMessage({
            type: 'LOG_MESSAGE_RESPONSE',
            id: event.data.id,
            result: { error: 'Extension context error: ' + error.message }
        }, '*');
    }
});

    // Check service health via background script
    try {
        if (chrome.runtime && chrome.runtime.id) {
            chrome.runtime.sendMessage({ action: 'checkServiceHealth' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('🔧 ChatGPT Message Logger Extension: Health check failed:', chrome.runtime.lastError);
                    return;
                }
                if (response && response.status === 'healthy') {
                    console.log('[ChatGPT Logger] Message logger service is running ✓');
                    console.log('[ChatGPT Logger] Total messages logged:', response.total_messages);
                } else {
                    console.error('[ChatGPT Logger] Service status:', response?.status || 'unknown');
                }
            });
        }
    } catch (error) {
        console.log('🔧 ChatGPT Message Logger Extension: Health check error:', error.message);
    }

    // Inject the main interceptor script into page world using a separate file
    // Check if already injected to prevent duplicates
    try {
        if (chrome.runtime && chrome.runtime.id && !document.querySelector('script[data-chatgpt-logger-injected]')) {
            const scriptElement = document.createElement('script');
            scriptElement.src = chrome.runtime.getURL('dist/injected.js');
            scriptElement.setAttribute('data-chatgpt-logger-injected', 'true');
            
            scriptElement.onload = function() {
                console.log('🔧 ChatGPT Message Logger Extension: Injected script loaded successfully');
                // Don't remove the script element to keep the data attribute
            };
            
            scriptElement.onerror = function() {
                console.error('🔧 ChatGPT Message Logger Extension: Failed to load injected script');
                this.remove();
            };

            // Inject the script
            (document.head || document.documentElement).appendChild(scriptElement);
        } else if (document.querySelector('script[data-chatgpt-logger-injected]')) {
            console.log('🔧 ChatGPT Message Logger Extension: Injected script already present');
        }
    } catch (error) {
        console.log('🔧 ChatGPT Message Logger Extension: Script injection error:', error.message);
    }

    console.log('🔧 ChatGPT Message Logger Extension: Content script bridge loaded!');
} 