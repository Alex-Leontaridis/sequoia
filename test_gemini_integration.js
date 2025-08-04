#!/usr/bin/env node

/**
 * Test script for Gemini integration
 * Tests the message extraction and compression functionality for Gemini requests
 */

// Mock the Gemini request structure based on the provided fetch request
const mockGeminiRequest = {
    url: "https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250730.05_p1&f.sid=-5705133509655435553&hl=en&_reqid=2759517&rt=c",
    method: "POST",
    body: "f.req=%5Bnull%2C%22%5B%5B%5C%22how%20are%20you%20man%5C%22%2C0%2Cnull%2Cnull%2Cnull%2Cnull%2C0%5D%2C%5B%5C%22en%5C%22%5D%2C%5B%5C%22c_6354e74658f36e13%5C%22%2C%5C%22r_3021f5fd8a3786ae%5C%22%2C%5C%22rc_50c262903e66d74c%5C%22%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5C%22%5C%22%5D%2C%5C%22!vL-lv-fNAAbs-qk5zPpC4BTK0YFyYD87ADQBEArZ1LdFK1QNGFMVZw3QE1NVZ9NlK1NmihL1OZZk_F7SQT_aahz0vwh2DrSneQq_Xb4iAgAAAUVSAAAABmgBB34AQW4dpPLeCpKJD0DHeXe43y0pxvfOxOp6BEQhYl8oh5DlXOdTs_CYRoFP3llxjxezeljyanlUfJAJUdHcf8v5_LAbmQOqZTRU0xVVKPc86l5dr6FbJQ41-38oUQo0hye3GG-1403OmvcgC7rAAK999A0Dk-j2SIviEEIzhbd-2Ywsggd7j-sXoLejWbOVmslghQHA-xZhSJLxSFVqDKy8owiVaSV4KPGzRe7cn7rkn8vWt26isReLB7xCvxpyYHMsyjrpS0-0VjjSTB5q8e-gqtBh0v10Binpg-cQopheKomfIFXtMOHnmDPytAI6YX70O_510oKwbfIc6Lp3CkuJsvZpbk6i65t6YToDBecEfnRJ1cSJDyTvecK0HT7b5fdAiYJm4bTkghCiV57dQbcNLM4ZbaF1vwDZOD6AW_p_bNwVB2mw_uJLWkrGhfrWqxS752zNXPo9nDjl5vuHGGtQLJUnELNJipiMQUsIUGW_yWnBmCF3V7Fo2GoKjrmOcPpdUwpRi7Kpj69_AkabTSL0wvty2t50oVMkdynfXn1MRLeB024sC9-ai7yF6ahZbO1m3ERbuimL7fRrNSpkmPAY31CvCbYP7jrCl6ncbmU7DOfMrUCJg6Nkr8jlpOJD2hPvzINhjZg-3QNOJIUoPdNWi0KYmZMfhhGdTTRttS25UMqcweak6jMV5LANjX57rq7xhYLC175NA_PeVlc6HMGru3Zb85t1tbPjEQRjKrVIo-s9Y8wi_6iYf1GgNLRJhEazstjImiQckJNcrp0iV7JA2oTh4g1Q4ZzRG11A0vYeCaYtRbaHBmEkYVH6HUJxEMxVcnfxHqXQk3YaCOwIQ_xjKm54i-uVXx7d1r86FjFnew1iX9DDTcLKK-3z0mGUxNp1CLdFzCg8D11vEKjs3K7lvR8xHhEo9-BI8Cq1CfBvAkaAbCJktwQuC4bS0u_yF2j9vhM7YzzzrxQNY2w8RsvCuOYC0nrpGrMTrRhwFhoZvKbPjLwJ3ZCPTxSI4gR4yyx8XzlO427BqWcnPWdzN2AjEFqP-CGcP4pB65cX7kckuyktzm91PRCRJ9NtLMUW25ROZr10bSOLfRyx1z_WylvfeR0AXxplSeXKHSLqreLk8LU3lW0cWy6ugMPmAL8kbXACjbIwK8ITMS_uZXwma2chcDUUkfgI4MxoFWlrnD4ah2wTPer8mMa4x9SUNgPb2_Uy1L31-4_77U24y0wXOgU3-__6r_rW0Vb6PoLm_zKdSXitcZ9TBmcVrljTd6SXiReNUQv_OD8Xj_ndWbOJzfWNMJ4yyv2RPHPj1F_6DrCcH1Qw9veo9UzLLDZiJMxOEXg%5C%22%2C%5C%22829d61712a4a77a9b9caaa69603562b4%5C%22%2Cnull%2C%5B1%5D%2C1%2Cnull%2Cnull%2C1%2C0%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B13%5D%5D%2C0%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C1%2Cnull%2Cnull%2C%5B4%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B1%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C0%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%5D%22%5D&at=AJoiUyNX7zuWx_AG6hqdZQae9S9J%3A1754227914481&"
};

// Extract the functions from the injected script for testing
function isGeminiEndpoint(url) {
    const GEMINI_ENDPOINTS = [
        'gemini.google.com',
        'bard.google.com'
    ];
    return GEMINI_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

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
                    if (parsedReq && Array.isArray(parsedReq) && parsedReq.length > 1) {
                        // The actual message data is in the second element (index 1) as a string
                        const messageDataString = parsedReq[1];
                        if (typeof messageDataString === 'string') {
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
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing Gemini request data:', parseError);
                }
            }
        }
        
        return null;
    } catch (e) {
        console.error('Error extracting Gemini user message:', e);
        return null;
    }
}

function updateGeminiMessageContent(userMessageData, newContent) {
    try {
        // Update the message in the parsed request structure
        if (userMessageData.parsedReq && Array.isArray(userMessageData.parsedReq) && 
            userMessageData.parsedReq.length > 1 && userMessageData.messageData) {
            
            // Update the message in the nested messageData
            const firstMessageArray = userMessageData.messageData[0];
            if (Array.isArray(firstMessageArray) && firstMessageArray.length > 0) {
                firstMessageArray[0] = newContent;
                
                // Update the parsedReq with the modified messageData
                userMessageData.parsedReq[1] = JSON.stringify(userMessageData.messageData);
                
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
        return null;
    } catch (e) {
        console.error('Error updating Gemini message content:', e);
        return null;
    }
}

// Test functions
function testGeminiEndpointDetection() {
    console.log('\n🧪 Testing Gemini endpoint detection...');
    
    const testUrls = [
        'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate',
        'https://bard.google.com/chat',
        'https://chat.openai.com/api/conversation',
        'https://claude.ai/api/messages'
    ];
    
    testUrls.forEach(url => {
        const isGemini = isGeminiEndpoint(url);
        console.log(`${isGemini ? '✅' : '❌'} ${url} -> ${isGemini ? 'Gemini' : 'Not Gemini'}`);
    });
}

function testGeminiMessageExtraction() {
    console.log('\n🧪 Testing Gemini message extraction...');
    
    const userMessageData = extractGeminiUserMessage(mockGeminiRequest.body);
    
    if (userMessageData) {
        console.log('✅ Successfully extracted Gemini message:');
        console.log(`   Type: ${userMessageData.type}`);
        console.log(`   Original Content: "${userMessageData.originalContent}"`);
        console.log(`   Message Index: ${userMessageData.messageIndex}`);
    } else {
        console.log('❌ Failed to extract Gemini message');
    }
    
    return userMessageData;
}

function testGeminiMessageUpdate(userMessageData) {
    console.log('\n🧪 Testing Gemini message update...');
    
    if (!userMessageData) {
        console.log('❌ No user message data to test with');
        return;
    }
    
    const originalContent = userMessageData.originalContent;
    const compressedContent = "how r u man"; // Simulated compressed version
    
    console.log(`   Original: "${originalContent}"`);
    console.log(`   Compressed: "${compressedContent}"`);
    
    const updatedBody = updateGeminiMessageContent(userMessageData, compressedContent);
    
    if (updatedBody) {
        console.log('✅ Successfully updated Gemini message');
        console.log(`   Updated body length: ${updatedBody.length} characters`);
        
        // Verify the update worked by extracting again
        const newUserMessageData = extractGeminiUserMessage(updatedBody);
        if (newUserMessageData && newUserMessageData.originalContent === compressedContent) {
            console.log('✅ Verification successful - message was properly updated');
        } else {
            console.log('❌ Verification failed - message was not properly updated');
        }
    } else {
        console.log('❌ Failed to update Gemini message');
    }
}

function testCompressionService() {
    console.log('\n🧪 Testing compression service integration...');
    
    // This would normally call the actual compression service
    // For testing, we'll simulate the compression
    const originalMessage = "how are you man";
    const compressedMessage = "how r u man";
    
    console.log(`   Original: "${originalMessage}" (${originalMessage.length} chars)`);
    console.log(`   Compressed: "${compressedMessage}" (${compressedMessage.length} chars)`);
    console.log(`   Compression ratio: ${((1 - compressedMessage.length / originalMessage.length) * 100).toFixed(1)}%`);
}

// Run all tests
function runTests() {
    console.log('🚀 Starting Gemini Integration Tests\n');
    
    testGeminiEndpointDetection();
    const userMessageData = testGeminiMessageExtraction();
    testGeminiMessageUpdate(userMessageData);
    testCompressionService();
    
    console.log('\n✅ All Gemini integration tests completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests();
}

module.exports = {
    isGeminiEndpoint,
    extractGeminiUserMessage,
    updateGeminiMessageContent,
    testGeminiEndpointDetection,
    testGeminiMessageExtraction,
    testGeminiMessageUpdate,
    testCompressionService,
    runTests
}; 