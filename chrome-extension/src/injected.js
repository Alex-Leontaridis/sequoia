// Injected script that runs in the page world to intercept ChatGPT, Claude AI, and Gemini messages
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
        'claude.ai/api',
        'claude.ai/sentry',
        'claude.ai/organizations',
        'claude.ai/messages',
        'claude.ai/conversations'
    ];
    
    const GEMINI_ENDPOINTS = [
        'gemini.google.com',
        'bard.google.com'
    ];
    
    const GROK_ENDPOINTS = [
        'grok.com/rest/app-chat',
        'grok.com/api',
        'grok.com/rest'
    ];
    
    function log(...args) {
        if (DEBUG) {
            try {
            console.log('[AI Message Logger]', ...args);
            } catch (e) {
                // Fallback for CSP-restricted environments
                console.log('[AI Message Logger]', args.map(arg => 
                    typeof arg === 'string' ? arg : JSON.stringify(arg)
                ).join(' '));
            }
        }
    }
    
    function error(...args) {
        try {
        console.error('[AI Message Logger]', ...args);
        } catch (e) {
            // Fallback for CSP-restricted environments
            console.error('[AI Message Logger]', args.map(arg => 
                typeof arg === 'string' ? arg : JSON.stringify(arg)
            ).join(' '));
        }
    }
    
    // Check if URL is a ChatGPT API endpoint
    function isChatGPTEndpoint(url) {
        // Handle both absolute and relative URLs
        const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
        return CHATGPT_ENDPOINTS.some(endpoint => fullUrl.includes(endpoint));
    }
    
    // Check if URL is a Claude AI API endpoint
    function isClaudeEndpoint(url) {
        // Handle both absolute and relative URLs
        const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
        return CLAUDE_ENDPOINTS.some(endpoint => fullUrl.includes(endpoint));
    }
    
    // Check if URL is a Gemini API endpoint
    function isGeminiEndpoint(url) {
        // Handle both absolute and relative URLs
        const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
        return GEMINI_ENDPOINTS.some(endpoint => fullUrl.includes(endpoint));
    }
    
    // Check if URL is a Grok API endpoint
    function isGrokEndpoint(url) {
        // Handle both absolute and relative URLs
        const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
        return GROK_ENDPOINTS.some(endpoint => fullUrl.includes(endpoint));
    }
    
    // Check if URL is any supported AI service endpoint
    function isAIServiceEndpoint(url) {
        return isChatGPTEndpoint(url) || isClaudeEndpoint(url) || isGeminiEndpoint(url) || isGrokEndpoint(url);
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
            // Handle Claude's prompt structure - multiple possible formats
            if (bodyData.prompt && typeof bodyData.prompt === 'string' && bodyData.prompt.length > 10) {
                return {
                    type: 'claude',
                    originalContent: bodyData.prompt,
                    bodyData: bodyData
                };
            }
            
            // Handle Claude's message structure
            if (bodyData.messages && Array.isArray(bodyData.messages)) {
                // Find the last user message
                for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                    const message = bodyData.messages[i];
                    
                    // Check if this is a user message
                    if (message.role === 'user' || message.type === 'user') {
                        let content = null;
                        
                        if (typeof message.content === 'string') {
                            content = message.content;
                        } else if (message.content?.text) {
                            content = message.content.text;
                        } else if (message.content?.parts && Array.isArray(message.content.parts)) {
                            content = message.content.parts.join(' ');
                        }
                        
                        if (content && content.length > 10) {
                            return {
                                type: 'claude',
                                originalContent: content,
                                bodyData: bodyData,
                                message: message,
                                messageIndex: i
                            };
                        }
                    }
                }
            }
            
            // Handle Claude's input structure
            if (bodyData.input && typeof bodyData.input === 'string' && bodyData.input.length > 10) {
                return {
                    type: 'claude',
                    originalContent: bodyData.input,
                    bodyData: bodyData
                };
            }
            
            // Handle Claude's text structure
            if (bodyData.text && typeof bodyData.text === 'string' && bodyData.text.length > 10) {
                return {
                    type: 'claude',
                    originalContent: bodyData.text,
                    bodyData: bodyData
                };
            }
            
            return null;
        } catch (e) {
            error('Error extracting Claude user message:', e);
            return null;
        }
    }
    
    // Find user message in Gemini's request body
    function extractGeminiUserMessage(bodyData) {
        try {
            // Handle Gemini's form-encoded request structure
            if (typeof bodyData === 'string') {
                // Parse the form-encoded data
                const params = new URLSearchParams(bodyData);
                const fReq = params.get('f.req');
                
                if (fReq) {
                    try {
                        // Decode the URL-encoded JSON
                        const decodedReq = decodeURIComponent(fReq);
                        const parsedReq = JSON.parse(decodedReq);
                        
                        // Extract the user message from the parsed structure
                        // The structure is: [null, "[[\"message\",0,null,null,null,null,0],[\"en\"],...]"]
                        if (parsedReq && Array.isArray(parsedReq) && parsedReq.length >= 2) {
                            // The message data is in the second element (index 1) as a string
                            const messageDataString = parsedReq[1];
                            
                            if (typeof messageDataString === 'string') {
                                try {
                                    // Parse the nested JSON string
                                    const messageData = JSON.parse(messageDataString);
                                    
                                    if (Array.isArray(messageData) && messageData.length > 0) {
                                        const firstMessageArray = messageData[0];
                                        if (Array.isArray(firstMessageArray) && firstMessageArray.length > 0) {
                                            const userMessage = firstMessageArray[0];
                                            
                                            if (typeof userMessage === 'string' && userMessage.length > 10) {
                                                return {
                                                    type: 'gemini',
                                                    originalContent: userMessage,
                                                    bodyData: bodyData,
                                                    parsedReq: parsedReq,
                                                    messageData: messageData,
                                                    messageIndex: 0
                                                };
                                            }
                                        }
                                    }
                                } catch (parseError) {
                                    error('Error parsing Gemini message data string:', parseError);
                                }
                            }
                        }
                    } catch (parseError) {
                        error('Error parsing Gemini request data:', parseError);
                    }
                }
            }
            
            return null;
        } catch (e) {
            error('Error extracting Gemini user message:', e);
            return null;
        }
    }
    
    // Find user message in Grok's request body
    function extractGrokUserMessage(bodyData) {
        try {
            // Handle Grok's request structure
            if (bodyData.message && typeof bodyData.message === 'string' && bodyData.message.length > 10) {
                return {
                    type: 'grok',
                    originalContent: bodyData.message,
                    bodyData: bodyData
                };
            }
            
            return null;
        } catch (e) {
            error('Error extracting Grok user message:', e);
            return null;
        }
    }
    
    // Extract user message from any supported AI service request
    function extractUserMessage(bodyData, url) {
        if (isChatGPTEndpoint(url)) {
            return extractChatGPTUserMessage(bodyData);
        } else if (isClaudeEndpoint(url)) {
            return extractClaudeUserMessage(bodyData);
        } else if (isGeminiEndpoint(url)) {
            return extractGeminiUserMessage(bodyData);
        } else if (isGrokEndpoint(url)) {
            return extractGrokUserMessage(bodyData);
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
    function updateClaudeMessageContent(userMessageData, newContent) {
        try {
            // Update based on the structure we found
            if (userMessageData.bodyData.prompt) {
                userMessageData.bodyData.prompt = newContent;
                return true;
            } else if (userMessageData.message) {
                // Update the message content
                if (typeof userMessageData.message.content === 'string') {
                    userMessageData.message.content = newContent;
                } else if (userMessageData.message.content?.text) {
                    userMessageData.message.content.text = newContent;
                } else if (userMessageData.message.content?.parts && Array.isArray(userMessageData.message.content.parts)) {
                    userMessageData.message.content.parts = [newContent];
                }
                return true;
            } else if (userMessageData.bodyData.input) {
                userMessageData.bodyData.input = newContent;
                return true;
            } else if (userMessageData.bodyData.text) {
                userMessageData.bodyData.text = newContent;
            return true;
            }
            
            return false;
        } catch (e) {
            error('Error updating Claude message content:', e);
            return false;
        }
    }
    
    // Update message content in Gemini request body
    function updateGeminiMessageContent(userMessageData, newContent) {
        try {
            // Update the message in the parsed request structure
            if (userMessageData.parsedReq && Array.isArray(userMessageData.parsedReq) && 
                userMessageData.parsedReq.length > 0 && userMessageData.messageData) {
                
                // Check if the first element exists and is an array with at least 2 elements
                if (userMessageData.parsedReq[0] && Array.isArray(userMessageData.parsedReq[0]) && 
                    userMessageData.parsedReq[0].length >= 2) {
                    
                    // Update the message in the nested messageData
                    const firstMessageArray = userMessageData.messageData[0];
                    if (Array.isArray(firstMessageArray) && firstMessageArray.length > 0) {
                        firstMessageArray[0] = newContent;
                        
                        // Update the parsedReq with the modified messageData
                        // The structure is: [["MkEWBc", "[[[message, null, null, 0]]]", null, "generic"]]
                        userMessageData.parsedReq[0][1] = JSON.stringify(userMessageData.messageData);
                    
                        // Re-encode the request body
                        const updatedReq = JSON.stringify(userMessageData.parsedReq);
                        const encodedReq = encodeURIComponent(updatedReq);
                        
                        // Update the form-encoded body
                        const params = new URLSearchParams(userMessageData.bodyData);
                        params.set('f.req', encodedReq);
                        
                        // Return the updated form-encoded string
                        return params.toString();
                    }
                }
            }
            return null;
        } catch (e) {
            error('Error updating Gemini message content:', e);
            return null;
        }
    }
    
    // Update message content in Grok request body
    function updateGrokMessageContent(userMessageData, newContent) {
        try {
            // Update the message field in Grok's request structure
            if (userMessageData.bodyData.message) {
                userMessageData.bodyData.message = newContent;
                return true;
            }
            return false;
        } catch (e) {
            error('Error updating Grok message content:', e);
            return false;
        }
    }
    
    // Update message content based on service type
    function updateMessageContent(userMessageData, newContent) {
        if (userMessageData.type === 'chatgpt') {
            return updateChatGPTMessageContent(userMessageData.message, newContent);
        } else if (userMessageData.type === 'claude') {
            return updateClaudeMessageContent(userMessageData, newContent);
        } else if (userMessageData.type === 'gemini') {
            return updateGeminiMessageContent(userMessageData, newContent);
        } else if (userMessageData.type === 'grok') {
            return updateGrokMessageContent(userMessageData, newContent);
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
                    
                    // Check for daily limit exceeded
                    if (result && result.isExceeded) {
                        console.warn('🌳 Daily limit exceeded:', result.dailyLimit, 'messages per day');
                        console.log('🌳 Daily limit response:', result);
                        showDailyLimitNotification();
                        resolve(result);
                        return;
                    }
                    
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
    
    // Helper function to check daily limit via content script
    async function checkDailyLimit() {
        return new Promise((resolve) => {
            const id = crypto.randomUUID();
            
            function responseHandler(event) {
                if (event.source === window && 
                    event.data?.type === 'DAILY_LIMIT_CHECK_RESPONSE' && 
                    event.data.id === id) {
                    window.removeEventListener('message', responseHandler);
                    resolve(event.data.result);
                }
            }
            
            window.addEventListener('message', responseHandler);
            
            window.postMessage({
                type: 'DAILY_LIMIT_CHECK_REQUEST',
                id: id
            }, '*');
            
            // Timeout after 2 seconds
            setTimeout(() => {
                window.removeEventListener('message', responseHandler);
                log('⏰ Daily limit check timed out');
                resolve({ dailyLimit: 0, dailyMessageCount: 0, isExceeded: false });
            }, 2000);
        });
    }

    // Helper function to increment daily message count via content script
    async function incrementDailyMessageCount() {
        return new Promise((resolve) => {
            const id = crypto.randomUUID();
            
            function responseHandler(event) {
                if (event.source === window && 
                    event.data?.type === 'INCREMENT_DAILY_COUNT_RESPONSE' && 
                    event.data.id === id) {
                    window.removeEventListener('message', responseHandler);
                    resolve(event.data.result);
                }
            }
            
            window.addEventListener('message', responseHandler);
            
            window.postMessage({
                type: 'INCREMENT_DAILY_COUNT_REQUEST',
                id: id
            }, '*');
            
            // Timeout after 2 seconds
            setTimeout(() => {
                window.removeEventListener('message', responseHandler);
                log('⏰ Increment daily count timed out');
                resolve(0);
            }, 2000);
        });
    }

    // Show daily limit exceeded notification
    function showDailyLimitNotification() {
        const notification = document.createElement('div');
        
        // Set colors for daily limit notification
        const iconColor = '#FF9800';
        const borderColor = '#FEF3C7';
        const title = 'Tree says: Take a break';
        const description = 'Using AI consciously helps reduce digital emissions. You\'ve used up today\'s prompts.';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FDF8F5;
            color: #374151;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid ${borderColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            max-width: 320px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;
        
        // Create header with icon and close button
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
        `;
        
        // Create icon
        const icon = document.createElement('div');
        icon.style.cssText = `
            width: 24px;
            height: 24px;
            background: ${iconColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            flex-shrink: 0;
        `;
        icon.textContent = '🌳';
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #6B7280;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        `;
        closeButton.textContent = '×';
        closeButton.onmouseover = () => {
            closeButton.style.backgroundColor = '#F3F4F6';
        };
        closeButton.onmouseout = () => {
            closeButton.style.backgroundColor = 'transparent';
        };
        closeButton.onclick = () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        };
        
        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
        `;
        
        // Create title
        const titleElement = document.createElement('div');
        titleElement.style.cssText = `
            font-weight: 600;
            font-size: 16px;
            color: #111827;
            line-height: 1.4;
        `;
        titleElement.textContent = title;
        
        // Create description
        const descriptionElement = document.createElement('div');
        descriptionElement.style.cssText = `
            font-size: 14px;
            color: #6B7280;
            line-height: 1.5;
        `;
        descriptionElement.textContent = description;
        
        // Assemble the notification
        content.appendChild(titleElement);
        content.appendChild(descriptionElement);
        
        header.appendChild(icon);
        header.appendChild(content);
        header.appendChild(closeButton);
        
        notification.appendChild(header);
        document.body.appendChild(notification);
        
        // Remove after 10 seconds (longer for this important notification)
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }

    // Show pause/resume notification
    function showPauseNotification(paused) {
        const notification = document.createElement('div');
        
        // Set colors based on pause state
        const iconColor = paused ? '#EF4444' : '#66A865';
        const borderColor = paused ? '#FEE2E2' : '#D1FAE5';
        const title = paused ? 'Sequoia is on Pause' : 'Sequoia is Compressing';
        const description = paused 
            ? 'Using AI consciously helps reduce digital emissions. You\'ve used up today\'s prompts.'
            : 'Your messages will be automatically compressed to reduce digital emissions and improve efficiency.';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FDF8F5;
            color: #374151;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid ${borderColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            max-width: 320px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;
        
        // Create header with icon and close button
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
        `;
        
        // Create icon
        const icon = document.createElement('div');
        icon.style.cssText = `
            width: 24px;
            height: 24px;
            background: ${iconColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            flex-shrink: 0;
        `;
        icon.textContent = paused ? '!' : '✓';
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #6B7280;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        `;
        closeButton.textContent = '×';
        closeButton.onmouseover = () => {
            closeButton.style.backgroundColor = '#F3F4F6';
        };
        closeButton.onmouseout = () => {
            closeButton.style.backgroundColor = 'transparent';
        };
        closeButton.onclick = () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        };
        
        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
        `;
        
        // Create title
        const titleElement = document.createElement('div');
        titleElement.style.cssText = `
            font-weight: 600;
            font-size: 16px;
            color: #111827;
            line-height: 1.4;
        `;
        titleElement.textContent = title;
        
        // Create description
        const descriptionElement = document.createElement('div');
        descriptionElement.style.cssText = `
            font-size: 14px;
            color: #6B7280;
            line-height: 1.5;
        `;
        descriptionElement.textContent = description;
        
        // Assemble the notification
        content.appendChild(titleElement);
        content.appendChild(descriptionElement);
        
        header.appendChild(icon);
        header.appendChild(content);
        header.appendChild(closeButton);
        
        notification.appendChild(header);
        document.body.appendChild(notification);
        
        // Remove after 8 seconds (longer for this important notification)
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 8000);
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
        
        // Create title element
        const title = document.createElement('div');
        title.style.cssText = 'font-weight: 600; margin-bottom: 4px;';
        title.textContent = 'Message Compressed!';
        
        // Create description element
        const description = document.createElement('div');
        description.style.cssText = 'font-size: 12px; opacity: 0.9;';
        description.textContent = `Sent compressed version\nLength: ${original.length} → ${modified.length} chars`;
        
        // Append elements safely
        notification.appendChild(title);
        notification.appendChild(description);
        
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

    // Store original fetch and XMLHttpRequest
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    // Intercept fetch requests
    window.fetch = async function(url, options = {}) {
        try {
            // Debug: Log all fetch requests to see what's happening
            if (typeof url === 'string') {
                log(`🔍 Fetch request to: ${url}`);
                log(`🔍 Request method: ${options.method || 'GET'}`);
                log(`🔍 Has body: ${!!options.body}`);
            }
            
            // Check if this is an AI service API call
            if (typeof url === 'string' && isAIServiceEndpoint(url)) {
                let serviceName = 'Unknown AI Service';
                if (isChatGPTEndpoint(url)) serviceName = 'ChatGPT';
                else if (isClaudeEndpoint(url)) serviceName = 'Claude AI';
                else if (isGeminiEndpoint(url)) serviceName = 'Gemini';
                else if (isGrokEndpoint(url)) serviceName = 'Grok';
                
                log(`🎯 Intercepted ${serviceName} API call:`, url);
                
                // Only process POST requests with body
                if (options.method === 'POST' && options.body) {
                    // For Claude, be more permissive since it might use different endpoint patterns
                    const isClaudeRequest = isClaudeEndpoint(url);
                    const isChatGPTRequest = isChatGPTEndpoint(url);
                    const isGeminiRequest = isGeminiEndpoint(url);
                    const isGrokRequest = isGrokEndpoint(url);
                    
                    // Check if this looks like a message/completion request
                    const isMessageRequest = url.includes('conversation') || 
                                           url.includes('chat') || 
                                           url.includes('completion') || 
                                           url.includes('StreamGenerate') || 
                                           url.includes('assistant.lamda') ||
                                           url.includes('messages') ||
                                           url.includes('api') ||
                                           url.includes('responses') ||
                                           isClaudeRequest || // Be more permissive for Claude
                                           isGeminiRequest || // Be more permissive for Gemini
                                           isGrokRequest; // Be more permissive for Grok
                    
                    log(`🔍 Message request check: ${isMessageRequest} (URL: ${url})`);
                    log(`🔍 isClaudeRequest: ${isClaudeRequest}, isGeminiRequest: ${isGeminiRequest}, isGrokRequest: ${isGrokRequest}`);
                    
                    if (!isMessageRequest) {
                        log('❌ Not a message request, skipping');
                        return originalFetch.call(this, url, options);
                    }
                    
                    log('✅ This is a message request, proceeding...');
                    
                    let bodyData;
                    
                    try {
                        // Handle different content types
                        if (typeof options.body === 'string') {
                            // For Gemini, the body is form-encoded
                            if (isGeminiEndpoint(url)) {
                                bodyData = options.body;
                            } else {
                        bodyData = JSON.parse(options.body);
                            }
                        } else {
                            bodyData = options.body;
                        }
                    } catch (e) {
                        log('Could not parse request body');
                        return originalFetch.call(this, url, options);
                    }
                    
                    // Extract user message
                    const userMessageData = extractUserMessage(bodyData, url);
                    if (!userMessageData) {
                        log('No user message found or too short');
                        return originalFetch.call(this, url, options);
                    }
                    
                    log(`Found ${serviceName} user message:`, userMessageData.originalContent.substring(0, 100) + '...');
                    
                    // Check daily limit FIRST (before checking if paused)
                    try {
                        const limitCheck = await checkDailyLimit();
                        const dailyLimit = limitCheck.dailyLimit || 0;
                        const dailyMessageCount = limitCheck.dailyMessageCount || 0;
                        const isExceeded = limitCheck.isExceeded || false;

                        // Check if limit is exceeded
                        log(`🔧 Checking daily limit - Count: ${dailyMessageCount}, Limit: ${dailyLimit}`);
                        if (isExceeded) {
                            log(`🚫 Daily limit exceeded! Count: ${dailyMessageCount}, Limit: ${dailyLimit}`);
                            showDailyLimitNotification();
                            return originalFetch.call(this, url, options); // Send original message without compression
                        }

                        // Increment the count for ALL messages (compressed or not)
                        if (dailyLimit > 0) {
                            await incrementDailyMessageCount();
                            log(`🔧 Daily message count incremented (ALL messages counted)`);
                        }
                    } catch (error) {
                        log('❌ Error checking daily limit:', error);
                        // Continue with compression if there's an error
                    }

                    // Check if compression is paused
                    if (isPaused) {
                        log('⏸️ Compression is paused, sending original message');
                        return originalFetch.call(this, url, options);
                    }
                    
                    // Get compressed message from backend
                    log('🔄 Getting compressed version of message...');
                    const compressedContent = await getCompressedMessage(userMessageData.originalContent);
                    
                    // Update the message in the request body with compressed version
                    const updateResult = updateMessageContent(userMessageData, compressedContent);
                    
                    if (updateResult && compressedContent !== userMessageData.originalContent) {
                        // Update the request body
                        if (isGeminiEndpoint(url)) {
                            // For Gemini, updateResult is the new form-encoded string
                            options.body = updateResult;
                        } else {
                        options.body = JSON.stringify(bodyData);
                        }
                        
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
    
    // Intercept XMLHttpRequest
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        // Store the method and URL for later use
        this._sequoiaMethod = method;
        this._sequoiaUrl = url;
        return originalXHROpen.call(this, method, url, ...args);
    };
    
         XMLHttpRequest.prototype.send = async function(data) {
        const url = this._sequoiaUrl;
        const method = this._sequoiaMethod;
        
        // Debug: Log all XMLHttpRequest requests
        if (typeof url === 'string') {
            log(`🔍 XMLHttpRequest to: ${url}`);
            log(`🔍 Request method: ${method}`);
            log(`🔍 Has data: ${!!data}`);
        }
        
                    // Check if this is an AI service API call
            if (typeof url === 'string' && isAIServiceEndpoint(url)) {
                let serviceName = 'Unknown AI Service';
                if (isChatGPTEndpoint(url)) serviceName = 'ChatGPT';
                else if (isClaudeEndpoint(url)) serviceName = 'Claude AI';
                else if (isGeminiEndpoint(url)) serviceName = 'Gemini';
                else if (isGrokEndpoint(url)) serviceName = 'Grok';
                
                log(`🎯 Intercepted ${serviceName} XMLHttpRequest:`, url);
            
            // Only process POST requests with data
            if (method === 'POST' && data) {
                // For Claude, be more permissive since it might use different endpoint patterns
                const isClaudeRequest = isClaudeEndpoint(url);
                const isChatGPTRequest = isChatGPTEndpoint(url);
                const isGeminiRequest = isGeminiEndpoint(url);
                const isGrokRequest = isGrokEndpoint(url);
                
                // Check if this looks like a message/completion request
                const isMessageRequest = url.includes('conversation') || 
                                       url.includes('chat') || 
                                       url.includes('completion') || 
                                       url.includes('StreamGenerate') || 
                                       url.includes('assistant.lamda') ||
                                       url.includes('messages') ||
                                       url.includes('api') ||
                                       url.includes('responses') ||
                                       isClaudeRequest || // Be more permissive for Claude
                                       isGeminiRequest || // Be more permissive for Gemini
                                       isGrokRequest; // Be more permissive for Grok
                
                log(`🔍 XMLHttpRequest message check: ${isMessageRequest} (URL: ${url})`);
                log(`🔍 isClaudeRequest: ${isClaudeRequest}, isGeminiRequest: ${isGeminiRequest}, isGrokRequest: ${isGrokRequest}`);
                
                                 if (isMessageRequest) {
                     log('✅ This is a message XMLHttpRequest, proceeding...');
                     
                     // Process the request similar to fetch
                     let bodyData;
                     try {
                         bodyData = typeof data === 'string' ? data : JSON.stringify(data);
                     } catch (error) {
                         log('Could not parse request body');
                         return originalXHRSend.call(this, data);
                     }
                     
                     // Extract user message
                     const userMessage = extractUserMessage(bodyData, url);
                     if (!userMessage) {
                         log('No user message found or too short');
                         return originalXHRSend.call(this, data);
                     }
                     
                     log(`Found ${serviceName} user message:`, userMessage.originalContent.substring(0, 100) + '...');
                     
                     // Check daily limit FIRST (before checking if paused)
                     try {
                         const limitCheck = await checkDailyLimit();
                         const dailyLimit = limitCheck.dailyLimit || 0;
                         const dailyMessageCount = limitCheck.dailyMessageCount || 0;
                         const isExceeded = limitCheck.isExceeded || false;

                         // Check if limit is exceeded
                         log(`🔧 Checking daily limit - Count: ${dailyMessageCount}, Limit: ${dailyLimit}`);
                         if (isExceeded) {
                             log(`🚫 Daily limit exceeded! Count: ${dailyMessageCount}, Limit: ${dailyLimit}`);
                             showDailyLimitNotification();
                             return originalXHRSend.call(this, data); // Send original message without compression
                         }

                         // Increment the count for ALL messages (compressed or not)
                         if (dailyLimit > 0) {
                             await incrementDailyMessageCount();
                             log(`🔧 Daily message count incremented (ALL messages counted)`);
                         }
                     } catch (error) {
                         log('❌ Error checking daily limit:', error);
                         // Continue with compression if there's an error
                     }

                     // Check if compression is paused
                     if (isPaused) {
                         log('⏸️ Compression is paused, sending original message');
                         return originalXHRSend.call(this, data);
                     }
                     
                     // Get compressed version
                     log('🔄 Getting compressed version of message...');
                     const compressedContent = await getCompressedMessage(userMessage.originalContent);
                     
                     // Update message content
                     const updatedBody = updateMessageContent(userMessage, compressedContent);
                     if (updatedBody && compressedContent !== userMessage.originalContent) {
                         // Update the data with compressed content
                         data = updatedBody;
                         showModificationResult(userMessage.originalContent, compressedContent);
                         log(`${serviceName} message compressed and sent successfully`);
                         log('Original:', userMessage.originalContent);
                         log('Compressed:', compressedContent);
                         log('✅ Compression completed - check console group above');
                     } else {
                         log('No compression needed or failed to update message');
                     }
                 }
            }
        }
        
        return originalXHRSend.call(this, data);
    };
    
    log('AI Message Modifier loaded - will compress messages for ChatGPT, Claude AI, Gemini, and Grok');
    
})();