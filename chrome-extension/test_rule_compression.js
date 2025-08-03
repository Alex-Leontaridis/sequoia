// Test rule-based compression (without advanced library)
const testText = "I would like to ask you a very important question that I have been thinking about for quite some time now. It is something that has been on my mind and I would really appreciate if you could help me understand it better. The question is quite complex and I want to make sure I explain it properly so you can give me the best possible answer.";

async function testRuleCompression() {
    try {
        console.log('🧪 Testing rule-based compression...');
        console.log('Original text:', testText);
        console.log('Original length:', testText.length);
        
        const response = await fetch('http://localhost:8002/compress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: testText })
        });
        
        const result = await response.json();
        
        console.log('\n📊 Compression Results:');
        console.log('Method used:', result.method);
        console.log('Compressed text:', result.compressed_text);
        console.log('Compressed length:', result.compressed_text.length);
        console.log('Compression ratio:', result.compression_ratio + '%');
        console.log('Tokens saved:', result.tokens_saved);
        
        if (result.compression_ratio > 0) {
            console.log('✅ Rule-based compression is working!');
        } else {
            console.log('ℹ️ Text was already optimal (no compression needed)');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testRuleCompression(); 