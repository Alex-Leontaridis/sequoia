// Debug script for daily limit functionality
// Run this in the browser console on an AI service page

console.log('🔍 Daily Limit Debug Tool');

// Function to check current daily limit status
async function checkDailyLimitStatus() {
    try {
        const result = await chrome.storage.local.get(['dailyLimit', 'dailyMessageCount', 'lastResetDate']);
        
        const dailyLimit = result.dailyLimit || 0;
        const dailyMessageCount = result.dailyMessageCount || 0;
        const lastResetDate = result.lastResetDate || 'Not set';
        const currentDate = new Date().toDateString();
        
        console.log('📊 Current Daily Limit Status:');
        console.log(`   Daily Limit: ${dailyLimit} (0 = no limit)`);
        console.log(`   ALL Messages Sent Today: ${dailyMessageCount} (compressed + uncompressed)`);
        console.log(`   Last Reset Date: ${lastResetDate}`);
        console.log(`   Current Date: ${currentDate}`);
        console.log(`   Is New Day: ${lastResetDate !== currentDate ? 'Yes' : 'No'}`);
        
        if (dailyLimit > 0) {
            const remaining = dailyLimit - dailyMessageCount;
            console.log(`   Remaining Messages: ${remaining > 0 ? remaining : 0}`);
            console.log(`   Limit Exceeded: ${dailyMessageCount >= dailyLimit ? 'Yes' : 'No'}`);
        } else {
            console.log(`   Status: No limit set`);
        }
        
        return result;
    } catch (error) {
        console.error('❌ Error checking daily limit status:', error);
        return null;
    }
}

// Function to set daily limit for testing
async function setDailyLimitForTesting(limit) {
    try {
        await chrome.storage.local.set({
            dailyLimit: limit,
            dailyMessageCount: 0,
            lastResetDate: new Date().toDateString()
        });
        console.log(`✅ Daily limit set to ${limit} messages`);
        await checkDailyLimitStatus();
    } catch (error) {
        console.error('❌ Error setting daily limit:', error);
    }
}

// Function to reset daily count
async function resetDailyCount() {
    try {
        await chrome.storage.local.set({
            dailyMessageCount: 0,
            lastResetDate: new Date().toDateString()
        });
        console.log('✅ Daily count reset to 0');
        await checkDailyLimitStatus();
    } catch (error) {
        console.error('❌ Error resetting daily count:', error);
    }
}

// Function to simulate sending a message
async function simulateMessage() {
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
            console.log('📅 Daily count reset for new day');
        }
        
        // Check if limit is exceeded
        if (dailyLimit > 0 && dailyMessageCount >= dailyLimit) {
            console.log('🚫 Message would be blocked - daily limit exceeded');
            return false;
        }
        
        // Increment count
        if (dailyLimit > 0) {
            dailyMessageCount++;
            await chrome.storage.local.set({
                dailyMessageCount: dailyMessageCount,
                lastResetDate: currentDate
            });
            console.log(`✅ Message allowed, count incremented to ${dailyMessageCount}/${dailyLimit}`);
        } else {
            console.log('✅ Message allowed (no limit set)');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error simulating message:', error);
        return false;
    }
}

// Export functions for use in console
window.checkDailyLimitStatus = checkDailyLimitStatus;
window.setDailyLimitForTesting = setDailyLimitForTesting;
window.resetDailyCount = resetDailyCount;
window.simulateMessage = simulateMessage;

console.log('💡 Available commands:');
console.log('   checkDailyLimitStatus() - Check current status');
console.log('   setDailyLimitForTesting(limit) - Set daily limit for testing');
console.log('   resetDailyCount() - Reset daily count to 0');
console.log('   simulateMessage() - Simulate sending a message');

// Auto-check status on load
checkDailyLimitStatus(); 