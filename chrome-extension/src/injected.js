// Injected script that runs in the page world to intercept ChatGPT and Claude AI messages
(function() {
    'use strict';
    
    // Prevent multiple executions
    if (window.aiMessageLoggerInjectedLoaded) {
        console.log("🔧 Sequoia AI Message Logger Extension: Page interceptor already loaded, skipping...");
        return;
    }
    window.aiMessageLoggerInjectedLoaded = true;
    
    console.log("🔧 Sequoia AI Message Logger Extension: Page interceptor loaded!");
    
    // Track pause state
    let isPaused = false;
    
    const DEBUG = true;
    
    // AI service API endpoints to monitor
    const CHATGPT_ENDPOINTS = [
        'backend-api',
        'api.openai.com',
        'chatgpt.com/api',
        'chat.openai.com/api'
    ];
    
    const CLAUDE_ENDPOINTS = [
        'claude.ai/api'
    ];
    
    function log(...args) {
        if (DEBUG) {
            console.log('[AI Message Logger]', ...args);
        }
    }
    
    function error(...args) {
        console.error('[AI Message Logger]', ...args);
    }
    
    // Check if URL is a ChatGPT API endpoint
    function isChatGPTEndpoint(url) {
        return CHATGPT_ENDPOINTS.some(endpoint => url.includes(endpoint));
    }
    
    // Check if URL is a Claude AI API endpoint
    function isClaudeEndpoint(url) {
        return CLAUDE_ENDPOINTS.some(endpoint => url.includes(endpoint));
    }
    
    // Check if URL is any supported AI service endpoint
    function isAIServiceEndpoint(url) {
        return isChatGPTEndpoint(url) || isClaudeEndpoint(url);
    }
    
    // Find user messages in request body for ChatGPT
    function extractChatGPTUserMessage(bodyData) {
        try {
            // Handle ChatGPT's message structure
            if (bodyData.messages && Array.isArray(bodyData.messages)) {
                // Find the last user message
                for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                    const message = bodyData.messages[i];
                    
                    // Check if this is a user message
                    if (message.author?.role === 'user' || message.role === 'user') {
                        // Extract content based on structure
                        let content = null;
                        
                        if (typeof message.content === 'string') {
                            content = message.content;
                        } else if (message.content?.parts && Array.isArray(message.content.parts)) {
                            content = message.content.parts.join(' ');
                        } else if (message.content?.content_type === 'text' && message.content?.parts) {
                            content = message.content.parts.join(' ');
                        }
                        
                        if (content && content.length > 10) {
                            return {
                                type: 'chatgpt',
                                messageIndex: i,
                                originalContent: content,
                                message: message
                            };
                        }
                    }
                }
            }
            
            return null;
        } catch (e) {
            error('Error extracting ChatGPT user message:', e);
            return null;
        }
    }
    
    // Find user prompt in Claude's request body
    function extractClaudeUserMessage(bodyData) {
        try {
            // Handle Claude's prompt structure
            if (bodyData.prompt && typeof bodyData.prompt === 'string' && bodyData.prompt.length > 10) {
                return {
                    type: 'claude',
                    originalContent: bodyData.prompt,
                    bodyData: bodyData
                };
            }
            
            return null;
        } catch (e) {
            error('Error extracting Claude user message:', e);
            return null;
        }
    }
    
    // Extract user message from either ChatGPT or Claude request
    function extractUserMessage(bodyData, url) {
        if (isChatGPTEndpoint(url)) {
            return extractChatGPTUserMessage(bodyData);
        } else if (isClaudeEndpoint(url)) {
            return extractClaudeUserMessage(bodyData);
        }
        return null;
    }
    
    // Update message content in ChatGPT request body
    function updateChatGPTMessageContent(message, newContent) {
        try {
            if (typeof message.content === 'string') {
                message.content = newContent;
            } else if (message.content?.parts && Array.isArray(message.content.parts)) {
                message.content.parts = [newContent];
            } else if (message.content?.content_type === 'text' && message.content?.parts) {
                message.content.parts = [newContent];
            }
            return true;
        } catch (e) {
            error('Error updating ChatGPT message content:', e);
            return false;
        }
    }
    
    // Update prompt content in Claude request body
    function updateClaudeMessageContent(bodyData, newContent) {
        try {
            bodyData.prompt = newContent;
            return true;
        } catch (e) {
            error('Error updating Claude message content:', e);
            return false;
        }
    }
    
    // Update message content based on service type
    function updateMessageContent(userMessageData, newContent) {
        if (userMessageData.type === 'chatgpt') {
            return updateChatGPTMessageContent(userMessageData.message, newContent);
        } else if (userMessageData.type === 'claude') {
            return updateClaudeMessageContent(userMessageData.bodyData, newContent);
        }
        return false;
    }
    
    // Get compressed message from backend
    async function getCompressedMessage(originalMessage) {
        try {
            // Send message to backend for compression
            const response = await logMessage(originalMessage, window.location.href);
            
            if (response && response.error) {
                log('⚠️ Extension error:', response.error);
                return originalMessage;
            }
            
            if (response && response.compression && response.compression.success) {
                log('✅ Message compressed successfully');
                return response.compression.compressed;
            } else {
                log('⚠️ Compression failed or not available, using original message');
                return originalMessage;
            }
        } catch (error) {
            error('Failed to get compressed message:', error);
            return originalMessage;
        }
    }
    
    // Log message via bridge to extension
    async function logMessage(message, url) {
        return new Promise((resolve) => {
            const id = crypto.randomUUID();
            
            function responseHandler(event) {
                if (event.source === window && 
                    event.data?.type === 'LOG_MESSAGE_RESPONSE' && 
                    event.data.id === id) {
                    window.removeEventListener('message', responseHandler);
                    
                    // Log compression results to browser console
                    const result = event.data.result;
                    if (result && result.compression) {
                        const comp = result.compression;
                        
                        console.group('🗜️ PROMPT COMPRESSION RESULTS');
                        console.log('%c📏 Original Length:', 'color: #3b82f6; font-weight: bold', comp.original_length, 'characters');
                        console.log('%c📦 Compressed Length:', 'color: #10b981; font-weight: bold', comp.compressed_length, 'characters');
                        console.log('%c📊 Character Compression:', 'color: #f59e0b; font-weight: bold', comp.compression_ratio + '%');
                        
                        // Show token information if available
                        if (comp.original_tokens !== undefined) {
                            console.log('%c🪙 Original Tokens:', 'color: #06b6d4; font-weight: bold', comp.original_tokens);
                            console.log('%c🪙 Compressed Tokens:', 'color: #0891b2; font-weight: bold', comp.compressed_tokens);
                            console.log('%c🪙 Token Compression:', 'color: #0e7490; font-weight: bold', (comp.token_compression_ratio || 0) + '%');
                            const tiktoken_status = comp.tiktoken_available ? '✅ tiktoken' : '⚠️ estimated';
                            console.log('%c🔧 Token Counter:', 'color: #64748b; font-weight: bold', tiktoken_status);
                        }
                        
                        console.log('%c🔧 Method:', 'color: #8b5cf6; font-weight: bold', comp.method);
                        console.log('%c📝 Original Prompt:', 'color: #6b7280; font-weight: bold');
                        console.log('%c' + comp.original, 'color: #374151; background: #f3f4f6; padding: 8px; border-radius: 4px; display: block; margin: 4px 0;');
                        console.log('%c🗜️ Compressed Prompt:', 'color: #059669; font-weight: bold');
                        console.log('%c' + comp.compressed, 'color: #064e3b; background: #d1fae5; padding: 8px; border-radius: 4px; display: block; margin: 4px 0;');
                        
                        if (comp.success === false) {
                            console.warn('%c⚠️ Compression Failed:', 'color: #dc2626; font-weight: bold', comp.error);
                        }
                        console.groupEnd();
                        
                        // Also show a simple summary
                        const tokenInfo = comp.original_tokens !== undefined ? 
                            ` | ${comp.original_tokens} → ${comp.compressed_tokens} tokens (${comp.token_compression_ratio || 0}%)` : '';
                        log(`🗜️ Compressed prompt: ${comp.compression_ratio}% chars${tokenInfo}`);
                    }
                    
                    resolve(result);
                }
            }
            
            window.addEventListener('message', responseHandler);
            
            window.postMessage({
                type: 'LOG_MESSAGE_REQUEST',
                id: id,
                message: message,
                url: url
            }, '*');
            
            // Timeout after 3 seconds (shorter timeout for better UX)
            setTimeout(() => {
                window.removeEventListener('message', responseHandler);
                log('⏰ Compression request timed out');
                resolve({ error: 'Timeout waiting for compression response' });
            }, 3000);
        });
    }
    
    // Show pause/resume notification
    function showPauseNotification(paused) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${paused ? '#EF4444' : '#10b981'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">
                ${paused ? '⏸️ Compression Paused' : '▶️ Compression Resumed'}
            </div>
            <div style="font-size: 12px; opacity: 0.9;">
                ${paused ? 'Messages will be sent without compression' : 'Messages will be compressed again'}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Show modification notification
    function showModificationResult(original, modified) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">Message Compressed!</div>
            <div style="font-size: 12px; opacity: 0.9;">
                Sent compressed version<br>
                Length: ${original.length} → ${modified.length} chars
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // Listen for pause state updates from content script
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (event.data?.type === 'PAUSE_STATE_UPDATE') {
            isPaused = event.data.isPaused;
            console.log('🔧 Sequoia AI Message Logger Extension: Pause state updated to:', isPaused);
            
            // Show pause/resume notification
            showPauseNotification(isPaused);
        }
    });

    // Store original fetch
    const originalFetch = window.fetch;
    
    // Intercept fetch requests
    window.fetch = async function(url, options = {}) {
        try {
            // Check if this is an AI service API call
            if (typeof url === 'string' && isAIServiceEndpoint(url)) {
                const serviceName = isChatGPTEndpoint(url) ? 'ChatGPT' : 'Claude AI';
                log(`Intercepted ${serviceName} API call:`, url);
                
                // Only process POST requests with body that contain conversations/completions
                if (options.method === 'POST' && options.body && 
                    (url.includes('conversation') || url.includes('chat') || url.includes('completion'))) {
                    
                    let bodyData;
                    
                    try {
                        bodyData = JSON.parse(options.body);
                    } catch (e) {
                        log('Could not parse request body as JSON');
                        return originalFetch.call(this, url, options);
                    }
                    
                    // Extract user message
                    const userMessageData = extractUserMessage(bodyData, url);
                    if (!userMessageData) {
                        log('No user message found or too short');
                        return originalFetch.call(this, url, options);
                    }
                    
                    log(`Found ${serviceName} user message:`, userMessageData.originalContent.substring(0, 100) + '...');
                    
                    // Check if compression is paused
                    if (isPaused) {
                        log('⏸️ Compression is paused, sending original message');
                        return originalFetch.call(this, url, options);
                    }
                    
                    // Get compressed message from backend
                    log('🔄 Getting compressed version of message...');
                    const compressedContent = await getCompressedMessage(userMessageData.originalContent);
                    
                    // Update the message in the request body with compressed version
                    const updateSuccess = updateMessageContent(userMessageData, compressedContent);
                    
                    if (updateSuccess && compressedContent !== userMessageData.originalContent) {
                        // Update the request body
                        options.body = JSON.stringify(bodyData);
                        
                        // Show notification
                        showModificationResult(userMessageData.originalContent, compressedContent);
                        
                        log(`${serviceName} message compressed and sent successfully`);
                        log('Original:', userMessageData.originalContent);
                        log('Compressed:', compressedContent);
                        
                        // Log the compression results
                        log('✅ Compression completed - check console group above');
                    } else {
                        log('No compression needed or failed to update message');
                    }
                }
            }
        } catch (err) {
            error('Error in fetch interceptor:', err);
        }
        
        // Call original fetch with potentially modified options
        return originalFetch.call(this, url, options);
    };
    
    log('AI Message Modifier loaded - will compress messages for ChatGPT and Claude AI');
    
})();