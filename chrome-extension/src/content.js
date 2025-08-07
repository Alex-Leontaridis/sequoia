// Content script for Sequoia AI Message Logger Extension
// Bridge between page world and extension context to avoid CSP issues

// Prevent multiple executions
if (window.sequoiaExtensionLoaded) {
    console.log('🔧 Sequoia AI Message Logger Extension: Already loaded, skipping...');
} else {
    window.sequoiaExtensionLoaded = true;
    
    // Extension context (isolated world) - bridge to background script
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        
        // Handle daily limit check request
        if (event.data?.type === 'DAILY_LIMIT_CHECK_REQUEST') {
            handleDailyLimitCheck(event.data.id);
            return;
        }
        
        // Handle increment daily count request
        if (event.data?.type === 'INCREMENT_DAILY_COUNT_REQUEST') {
            handleIncrementDailyCount(event.data.id);
            return;
        }
        
        if (event.data?.type !== 'LOG_MESSAGE_REQUEST') return;

        // Check if compression is paused
        try {
            chrome.storage.local.get(['isPaused'], (result) => {
                // Check if paused
                if (result.isPaused === true) {
                    // If paused, send back original message without compression
                    window.postMessage({
                        type: 'LOG_MESSAGE_RESPONSE',
                        id: event.data.id,
                        result: { 
                            error: 'Compression paused',
                            original: event.data.message,
                            compressed: event.data.message,
                            compression_ratio: 0,
                            method: 'paused'
                        }
                    }, '*');
                    return;
                }

                // Check if extension context is still valid with better error handling
                try {
                    // More robust context validation
                    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
                        console.log('🔧 Sequoia AI Message Logger Extension: Context invalidated, skipping...');
                        window.postMessage({
                            type: 'LOG_MESSAGE_RESPONSE',
                            id: event.data.id,
                            result: { error: 'Extension context invalidated' }
                        }, '*');
                        return;
                    }

                    // Forward to background script with timeout protection
                    const messageTimeout = setTimeout(() => {
                        console.log('🔧 Sequoia AI Message Logger Extension: Message timeout');
                        window.postMessage({
                            type: 'LOG_MESSAGE_RESPONSE',
                            id: event.data.id,
                            result: { error: 'Message timeout - extension may be reloading' }
                        }, '*');
                    }, 5000); // 5 second timeout

                    chrome.runtime.sendMessage(
                        { action: 'logMessage', message: event.data.message, url: event.data.url },
                        (response) => {
                            clearTimeout(messageTimeout);
                            
                            // Check for errors
                            if (chrome.runtime.lastError) {
                                console.log('🔧 Sequoia AI Message Logger Extension: Runtime error:', chrome.runtime.lastError);
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
                    console.log('🔧 Sequoia AI Message Logger Extension: Caught extension error:', error.message);
                    window.postMessage({
                        type: 'LOG_MESSAGE_RESPONSE',
                        id: event.data.id,
                        result: { error: 'Extension context error: ' + error.message }
                    }, '*');
                }
            });
        } catch (error) {
            console.log('🔧 Sequoia AI Message Logger Extension: Storage access error:', error.message);
            // If we can't access storage, assume not paused and try to proceed
            try {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                    chrome.runtime.sendMessage(
                        { action: 'logMessage', message: event.data.message, url: event.data.url },
                        (response) => {
                            window.postMessage({
                                type: 'LOG_MESSAGE_RESPONSE',
                                id: event.data.id,
                                result: response
                            }, '*');
                        }
                    );
                } else {
                    window.postMessage({
                        type: 'LOG_MESSAGE_RESPONSE',
                        id: event.data.id,
                        result: { error: 'Extension context invalidated' }
                    }, '*');
                }
            } catch (innerError) {
                window.postMessage({
                    type: 'LOG_MESSAGE_RESPONSE',
                    id: event.data.id,
                    result: { error: 'Storage access error: ' + error.message }
                }, '*');
            }
        }
    });

    // Listen for pause toggle messages from popup
    try {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.type === 'PAUSE_TOGGLE') {
                console.log('🔧 Sequoia AI Message Logger Extension: Pause state changed to:', request.isPaused);
                // Forward the pause state to the injected script
                window.postMessage({
                    type: 'PAUSE_STATE_UPDATE',
                    isPaused: request.isPaused
                }, '*');
                // Send response to acknowledge receipt
                sendResponse({ success: true });
            }
            return true; // Keep the message channel open for async response
        });
    } catch (error) {
        console.log('🔧 Sequoia AI Message Logger Extension: Message listener setup error:', error.message);
    }

    // Check service health via background script with better error handling
    const checkServiceHealth = () => {
        try {
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
                console.log('🔧 Sequoia AI Message Logger Extension: Cannot check service health - context invalid');
                return;
            }

            chrome.runtime.sendMessage({ action: 'checkServiceHealth' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('🔧 Sequoia AI Message Logger Extension: Health check failed:', chrome.runtime.lastError);
                    return;
                }
                if (response && response.status === 'healthy') {
                    console.log('[Sequoia AI Logger] Message logger service is running ✓');
                    console.log('[Sequoia AI Logger] Total messages logged:', response.total_messages);
                } else {
                    console.error('[Sequoia AI Logger] Service status:', response?.status || 'unknown');
                }
            });
        } catch (error) {
            console.log('🔧 Sequoia AI Message Logger Extension: Health check error:', error.message);
        }
    };

    // Initial health check with delay to allow extension to stabilize
    setTimeout(checkServiceHealth, 1000);

    // Load initial pause state and notify injected script
    try {
        chrome.storage.local.get(['isPaused'], (result) => {
            // Fix: Explicitly check if isPaused is undefined, null, or false
            // Default to false (not paused) if the value doesn't exist or is falsy
            const initialPauseState = result.isPaused === true ? true : false;
            console.log('🔧 Sequoia AI Message Logger Extension: Initial pause state:', initialPauseState);
            console.log('🔧 Sequoia AI Message Logger Extension: Raw storage result:', result);
            
            // Notify injected script of initial pause state after a delay
            setTimeout(() => {
                window.postMessage({
                    type: 'PAUSE_STATE_UPDATE',
                    isPaused: initialPauseState
                }, '*');
            }, 1000);
        });
    } catch (error) {
        console.log('🔧 Sequoia AI Message Logger Extension: Initial storage access error:', error.message);
        // Default to not paused if storage is unavailable
        setTimeout(() => {
            window.postMessage({
                type: 'PAUSE_STATE_UPDATE',
                isPaused: false
            }, '*');
        }, 1000);
    }

    // Inject the main interceptor script into page world using a separate file
    // Check if already injected to prevent duplicates
    const injectScript = () => {
        try {
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
                console.log('🔧 Sequoia AI Message Logger Extension: Cannot inject script - context invalid');
                return;
            }

            if (!document.querySelector('script[data-sequoia-logger-injected]')) {
                const scriptElement = document.createElement('script');
                scriptElement.src = chrome.runtime.getURL('dist/injected.js');
                scriptElement.setAttribute('data-sequoia-logger-injected', 'true');
                
                scriptElement.onload = function() {
                    console.log('🔧 Sequoia AI Message Logger Extension: Injected script loaded successfully');
                    // Don't remove the script element to keep the data attribute
                };
                
                scriptElement.onerror = function() {
                    console.error('🔧 Sequoia AI Message Logger Extension: Failed to load injected script');
                    this.remove();
                };

                // Inject the script
                (document.head || document.documentElement).appendChild(scriptElement);
            } else {
                console.log('🔧 Sequoia AI Message Logger Extension: Injected script already present');
            }
        } catch (error) {
            console.log('🔧 Sequoia AI Message Logger Extension: Script injection error:', error.message);
        }
    };

    // Inject script with delay to allow extension to stabilize
    setTimeout(injectScript, 500);

    // Handle daily limit check request
    async function handleDailyLimitCheck(id) {
        try {
            const result = await chrome.storage.local.get(['dailyLimit', 'dailyMessageCount', 'lastResetDate']);
            const dailyLimit = result.dailyLimit || 0;
            let dailyMessageCount = result.dailyMessageCount || 0;
            const lastResetDate = result.lastResetDate || new Date().toDateString();
            const currentDate = new Date().toDateString();

            // Reset count if it's a new day
            if (lastResetDate !== currentDate) {
                dailyMessageCount = 0;
                await chrome.storage.local.set({
                    dailyMessageCount: 0,
                    lastResetDate: currentDate
                });
                console.log('🔧 Sequoia: Daily message count reset for new day');
            }

            // Check if limit is exceeded (0 means no limit)
            const isExceeded = dailyLimit > 0 && dailyMessageCount >= dailyLimit;

            window.postMessage({
                type: 'DAILY_LIMIT_CHECK_RESPONSE',
                id: id,
                result: {
                    dailyLimit,
                    dailyMessageCount,
                    isExceeded,
                    lastResetDate: currentDate
                }
            }, '*');
        } catch (error) {
            console.error('🔧 Sequoia: Error handling daily limit check:', error);
            window.postMessage({
                type: 'DAILY_LIMIT_CHECK_RESPONSE',
                id: id,
                result: {
                    dailyLimit: 0,
                    dailyMessageCount: 0,
                    isExceeded: false,
                    lastResetDate: new Date().toDateString()
                }
            }, '*');
        }
    }

    // Handle increment daily count request
    async function handleIncrementDailyCount(id) {
        try {
            const result = await chrome.storage.local.get(['dailyMessageCount', 'lastResetDate']);
            let dailyMessageCount = result.dailyMessageCount || 0;
            const lastResetDate = result.lastResetDate || new Date().toDateString();
            const currentDate = new Date().toDateString();

            // Reset count if it's a new day
            if (lastResetDate !== currentDate) {
                dailyMessageCount = 0;
            }

            // Increment count
            dailyMessageCount++;

            await chrome.storage.local.set({
                dailyMessageCount: dailyMessageCount,
                lastResetDate: currentDate
            });

            console.log(`🔧 Sequoia: Daily message count incremented to ${dailyMessageCount}`);

            window.postMessage({
                type: 'INCREMENT_DAILY_COUNT_RESPONSE',
                id: id,
                result: dailyMessageCount
            }, '*');
        } catch (error) {
            console.error('🔧 Sequoia: Error handling increment daily count:', error);
            window.postMessage({
                type: 'INCREMENT_DAILY_COUNT_RESPONSE',
                id: id,
                result: 0
            }, '*');
        }
    }

    console.log('🔧 Sequoia AI Message Logger Extension: Content script bridge loaded!');
}
