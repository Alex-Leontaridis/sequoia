// Test script to verify extension-backend integration
// This simulates the extension's communication with the backend

const COMPRESSION_SERVICE_URL = 'http://localhost:8002';

async function testBackendIntegration() {
    console.log('🧪 Testing ChatGPT Compressor Backend Integration');
    console.log('=' .repeat(50));
    
    // Test 1: Health Check
    console.log('\n1. Testing Health Check...');
    try {
        const healthResponse = await fetch(`${COMPRESSION_SERVICE_URL}/health`);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health check passed');
            console.log(`   Status: ${healthData.status}`);
            console.log(`   Library loaded: ${healthData.library_loaded}`);
        } else {
            console.log('❌ Health check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Health check error:', error.message);
        return false;
    }
    
    // Test 2: Compression
    console.log('\n2. Testing Text Compression...');
    const testTexts = [
        "Could you please help me understand more about this topic and provide a really very detailed explanation?",
        "I would like to know more about artificial intelligence and machine learning concepts.",
        "Would you mind explaining the basics of quantum computing in a simple way?"
    ];
    
    for (let i = 0; i < testTexts.length; i++) {
        const text = testTexts[i];
        console.log(`\n   Test ${i + 1}: "${text.substring(0, 50)}..."`);
        
        try {
            const response = await fetch(`${COMPRESSION_SERVICE_URL}/compress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(`   ✅ Compressed: ${result.compression_ratio}% reduction`);
                console.log(`   Original: ${result.original_tokens} tokens`);
                console.log(`   Compressed: ${result.compressed_tokens} tokens`);
                console.log(`   Method: ${result.method}`);
            } else {
                console.log(`   ❌ Compression failed: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.log(`   ❌ Compression error: ${error.message}`);
            return false;
        }
    }
    
    // Test 3: Service Info
    console.log('\n3. Testing Service Info...');
    try {
        const infoResponse = await fetch(`${COMPRESSION_SERVICE_URL}/`);
        if (infoResponse.ok) {
            const infoData = await infoResponse.json();
            console.log('✅ Service info retrieved');
            console.log(`   Service: ${infoData.service}`);
            console.log(`   Version: ${infoData.version}`);
        } else {
            console.log('❌ Service info failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Service info error:', error.message);
        return false;
    }
    
    console.log('\n🎉 All tests passed! Backend integration is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Load the Chrome extension in chrome://extensions/');
    console.log('2. Go to https://chat.openai.com');
    console.log('3. Start chatting - messages will be automatically compressed!');
    
    return true;
}

// Run the test
testBackendIntegration().catch(error => {
    console.error('❌ Test failed with error:', error);
}); 