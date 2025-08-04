#!/usr/bin/env node

/**
 * Debug script to analyze Claude request structure
 * This helps understand how Claude sends messages
 */

console.log('🔍 Claude Request Structure Debugger\n');

// Mock Claude request structures for testing
const mockClaudeRequests = [
    // Structure 1: Simple prompt
    {
        name: 'Simple Prompt Structure',
        url: 'https://claude.ai/api/messages',
        body: {
            prompt: 'Hello, how are you today? I would like to know more about your capabilities.'
        }
    },
    
    // Structure 2: Messages array
    {
        name: 'Messages Array Structure',
        url: 'https://claude.ai/api/conversations',
        body: {
            messages: [
                {
                    role: 'user',
                    content: 'Can you help me with a programming question?'
                }
            ]
        }
    },
    
    // Structure 3: Input field
    {
        name: 'Input Field Structure',
        url: 'https://claude.ai/api/chat',
        body: {
            input: 'What is the capital of France?'
        }
    },
    
    // Structure 4: Text field
    {
        name: 'Text Field Structure',
        url: 'https://claude.ai/api/completion',
        body: {
            text: 'Please explain quantum computing in simple terms.'
        }
    },
    
    // Structure 5: Complex message structure
    {
        name: 'Complex Message Structure',
        url: 'https://claude.ai/api/messages',
        body: {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: 'Write a short story about a robot.'
                    }
                }
            ]
        }
    }
];

// Test the extraction functions
function isClaudeEndpoint(url) {
    const CLAUDE_ENDPOINTS = [
        'claude.ai/api',
        'claude.ai/sentry',
        'claude.ai/organizations',
        'claude.ai/messages',
        'claude.ai/conversations'
    ];
    return CLAUDE_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

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
        console.error('Error extracting Claude user message:', e);
        return null;
    }
}

// Test each mock request
mockClaudeRequests.forEach((request, index) => {
    console.log(`\n${index + 1}. Testing ${request.name}`);
    console.log(`   URL: ${request.url}`);
    console.log(`   Endpoint detected: ${isClaudeEndpoint(request.url) ? '✅' : '❌'}`);
    
    const userMessage = extractClaudeUserMessage(request.body);
    
    if (userMessage) {
        console.log(`   ✅ Message extracted: "${userMessage.originalContent}"`);
        console.log(`   Type: ${userMessage.type}`);
        if (userMessage.messageIndex !== undefined) {
            console.log(`   Message Index: ${userMessage.messageIndex}`);
        }
    } else {
        console.log(`   ❌ No message extracted`);
        console.log(`   Body structure:`, JSON.stringify(request.body, null, 2));
    }
});

console.log('\n✅ Claude request structure analysis complete!');
console.log('\nTo debug real Claude requests:');
console.log('1. Open Claude in browser');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Network tab');
console.log('4. Send a message and look for POST requests to claude.ai');
console.log('5. Check the request body structure'); 