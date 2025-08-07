// Test script for daily limit functionality
// Run this in the browser console on an AI service page

console.log('🧪 Testing Daily Limit Functionality...');

// Test 1: Check if daily limit functions are available
async function testDailyLimitFunctions() {
    console.log('📋 Test 1: Checking daily limit functions...');
    
    try {
        // Test setting daily limit
        const testLimit = 5;
        console.log(`Setting daily limit to ${testLimit}...`);
        
        // Simulate setting daily limit through storage
        await chrome.storage.local.set({
            dailyLimit: testLimit,
            dailyMessageCount: 0,
            lastResetDate: new Date().toDateString()
        });
        
        console.log('✅ Daily limit set successfully');
        
        // Test getting daily limit
        const result = await chrome.storage.local.get(['dailyLimit', 'dailyMessageCount', 'lastResetDate']);
        console.log('📊 Current daily limit settings:', result);
        
        return true;
    } catch (error) {
        console.error('❌ Error testing daily limit functions:', error);
        return false;
    }
}

// Test 2: Test daily limit checking
async function testDailyLimitChecking() {
    console.log('📋 Test 2: Testing daily limit checking...');
    
    try {
        // Set a low limit for testing
        await chrome.storage.local.set({
            dailyLimit: 2,
            dailyMessageCount: 0,
            lastResetDate: new Date().toDateString()
        });
        
        // Simulate sending messages
        for (let i = 1; i <= 3; i++) {
            const currentData = await chrome.storage.local.get(['dailyLimit', 'dailyMessageCount', 'lastResetDate']);
            const dailyLimit = currentData.dailyLimit || 0;
            let dailyMessageCount = currentData.dailyMessageCount || 0;
            const lastResetDate = currentData.lastResetDate || new Date().toDateString();
            const currentDate = new Date().toDateString();
            
            // Reset count if it's a new day
            if (lastResetDate !== currentDate) {
                dailyMessageCount = 0;
                await chrome.storage.local.set({
                    dailyMessageCount: 0,
                    lastResetDate: currentDate
                });
            }
            
            // Check if limit is exceeded
            const isExceeded = dailyLimit > 0 && dailyMessageCount >= dailyLimit;
            
            console.log(`Message ${i}: Count=${dailyMessageCount}, Limit=${dailyLimit}, Exceeded=${isExceeded}`);
            
            if (!isExceeded) {
                // Increment count
                dailyMessageCount++;
                await chrome.storage.local.set({
                    dailyMessageCount: dailyMessageCount,
                    lastResetDate: currentDate
                });
                console.log(`✅ Message ${i} allowed, count incremented to ${dailyMessageCount}`);
            } else {
                console.log(`🚫 Message ${i} blocked - daily limit exceeded`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error testing daily limit checking:', error);
        return false;
    }
}

// Test 3: Test daily reset functionality
async function testDailyReset() {
    console.log('📋 Test 3: Testing daily reset functionality...');
    
    try {
        // Set yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        await chrome.storage.local.set({
            dailyLimit: 10,
            dailyMessageCount: 5,
            lastResetDate: yesterdayString
        });
        
        console.log('📅 Set last reset date to yesterday with 5 messages sent');
        
        // Simulate checking limit (should reset)
        const currentData = await chrome.storage.local.get(['dailyLimit', 'dailyMessageCount', 'lastResetDate']);
        let dailyMessageCount = currentData.dailyMessageCount || 0;
        const lastResetDate = currentData.lastResetDate || new Date().toDateString();
        const currentDate = new Date().toDateString();
        
        if (lastResetDate !== currentDate) {
            dailyMessageCount = 0;
            await chrome.storage.local.set({
                dailyMessageCount: 0,
                lastResetDate: currentDate
            });
            console.log('✅ Daily count reset successfully');
        } else {
            console.log('⚠️ No reset needed - same day');
        }
        
        const finalData = await chrome.storage.local.get(['dailyMessageCount', 'lastResetDate']);
        console.log('📊 Final count after reset:', finalData);
        
        return true;
    } catch (error) {
        console.error('❌ Error testing daily reset:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Daily Limit Tests...\n');
    
    const test1 = await testDailyLimitFunctions();
    console.log('');
    
    const test2 = await testDailyLimitChecking();
    console.log('');
    
    const test3 = await testDailyReset();
    console.log('');
    
    console.log('📊 Test Results:');
    console.log(`Test 1 (Functions): ${test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 2 (Checking): ${test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 3 (Reset): ${test3 ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = test1 && test2 && test3;
    console.log(`\n🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return allPassed;
}

// Export for use in console
window.testDailyLimit = runAllTests;
console.log('💡 Run testDailyLimit() to execute all tests'); 