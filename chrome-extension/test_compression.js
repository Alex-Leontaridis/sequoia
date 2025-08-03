// Test script to verify compression service
const testText = "This is a very long test message that should be compressed by our service. It contains multiple sentences and should demonstrate the compression functionality. The goal is to reduce token usage while maintaining meaning.";

async function testCompression() {
    try {
        console.log('🧪 Testing compression service...');
        
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:8002/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test compression endpoint
        const compressionResponse = await fetch('http://localhost:8002/compress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: testText })
        });
        
        const compressionData = await compressionResponse.json();
        console.log('✅ Compression test:', compressionData);
        
        console.log('📊 Results:');
        console.log('  Original length:', testText.length);
        console.log('  Compressed length:', compressionData.compressed_text.length);
        console.log('  Compression ratio:', compressionData.compression_ratio);
        console.log('  Tokens saved:', compressionData.tokens_saved);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testCompression(); 