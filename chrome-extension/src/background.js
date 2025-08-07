// Background service worker for Sequoia AI Message Logger Extension

const LOGGER_SERVICE_URL = 'http://localhost:8002';
console.log("🔧 Sequoia AI Message Logger Extension: Background script loaded!");

// Environmental impact constants
const ENVIRONMENTAL_IMPACT = {
  WATER_PER_TOKEN: 0.5, // 0.5 mL of water saved per token
  CO2_PER_TOKEN: 0.04   // 0.04g of CO2 saved per token
};

// Weekly goal ranges
const WEEKLY_GOAL_RANGES = {
  WATER: {
    MIN: 3,    // 3L per week
    MAX: 40,   // 40L per week
    DEFAULT: 10 // 10L per week
  },
  CO2: {
    MIN: 0.4,  // 0.4kg per week
    MAX: 5,    // 5kg per week
    DEFAULT: 1 // 1kg per week
  }
};

// Storage keys
const STORAGE_KEYS = {
  CO2_SAVED: 'co2Saved',
  WATER_SAVED: 'waterSaved',
  IS_PAUSED: 'isPaused',
  WELCOME_COMPLETED: 'welcomeCompleted',
  WEEKLY_WATER_GOAL: 'weeklyWaterGoal',
  WEEKLY_CO2_GOAL: 'weeklyCo2Goal',
  DAILY_LIMIT: 'dailyLimit',
  DAILY_MESSAGE_COUNT: 'dailyMessageCount',
  LAST_RESET_DATE: 'lastResetDate'
};

// Initialize storage with default values
async function initializeStorage() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.CO2_SAVED,
      STORAGE_KEYS.WATER_SAVED,
      STORAGE_KEYS.IS_PAUSED,
      STORAGE_KEYS.WELCOME_COMPLETED,
      STORAGE_KEYS.WEEKLY_WATER_GOAL,
      STORAGE_KEYS.WEEKLY_CO2_GOAL,
      STORAGE_KEYS.DAILY_LIMIT,
      STORAGE_KEYS.DAILY_MESSAGE_COUNT,
      STORAGE_KEYS.LAST_RESET_DATE
    ]);

    // Set default values if they don't exist
    const updates = {};
    
    if (result[STORAGE_KEYS.CO2_SAVED] === undefined) {
      updates[STORAGE_KEYS.CO2_SAVED] = 0;
    }
    
    if (result[STORAGE_KEYS.WATER_SAVED] === undefined) {
      updates[STORAGE_KEYS.WATER_SAVED] = 0;
    }
    
    if (result[STORAGE_KEYS.IS_PAUSED] === undefined) {
      updates[STORAGE_KEYS.IS_PAUSED] = false;
    }
    
    if (result[STORAGE_KEYS.WELCOME_COMPLETED] === undefined) {
      updates[STORAGE_KEYS.WELCOME_COMPLETED] = false;
    }

    if (result[STORAGE_KEYS.WEEKLY_WATER_GOAL] === undefined) {
      updates[STORAGE_KEYS.WEEKLY_WATER_GOAL] = WEEKLY_GOAL_RANGES.WATER.DEFAULT;
    }

    if (result[STORAGE_KEYS.WEEKLY_CO2_GOAL] === undefined) {
      updates[STORAGE_KEYS.WEEKLY_CO2_GOAL] = WEEKLY_GOAL_RANGES.CO2.DEFAULT;
    }

    if (result[STORAGE_KEYS.DAILY_LIMIT] === undefined) {
      updates[STORAGE_KEYS.DAILY_LIMIT] = 0; // Default to no limit
    }

    if (result[STORAGE_KEYS.DAILY_MESSAGE_COUNT] === undefined) {
      updates[STORAGE_KEYS.DAILY_MESSAGE_COUNT] = 0;
    }

    if (result[STORAGE_KEYS.LAST_RESET_DATE] === undefined) {
      updates[STORAGE_KEYS.LAST_RESET_DATE] = new Date().toDateString();
    }

    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
      console.log('🔧 Sequoia: Storage initialized with default values:', updates);
    }
  } catch (error) {
    console.error('🔧 Sequoia: Error initializing storage:', error);
  }
}

// Update savings based on tokens saved from compression
async function updateSavings(tokensSaved) {
  if (!tokensSaved || tokensSaved <= 0) {
    return;
  }

  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.CO2_SAVED,
      STORAGE_KEYS.WATER_SAVED
    ]);
    
    const currentCo2 = result[STORAGE_KEYS.CO2_SAVED] || 0;
    const currentWater = result[STORAGE_KEYS.WATER_SAVED] || 0;
    
    const co2Increase = tokensSaved * ENVIRONMENTAL_IMPACT.CO2_PER_TOKEN;
    const waterIncrease = tokensSaved * ENVIRONMENTAL_IMPACT.WATER_PER_TOKEN;
    
    const newCo2Saved = currentCo2 + co2Increase;
    const newWaterSaved = currentWater + waterIncrease;
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.CO2_SAVED]: newCo2Saved,
      [STORAGE_KEYS.WATER_SAVED]: newWaterSaved
    });

    console.log(`🔧 Sequoia: Updated savings - CO2: +${co2Increase.toFixed(2)}g (${newCo2Saved.toFixed(2)}g total), Water: +${waterIncrease.toFixed(2)}mL (${newWaterSaved.toFixed(2)}mL total)`);
  } catch (error) {
    console.error('🔧 Sequoia: Error updating savings:', error);
  }
}

// Check if daily limit is exceeded and reset count if it's a new day
async function checkDailyLimit() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.DAILY_LIMIT,
      STORAGE_KEYS.DAILY_MESSAGE_COUNT,
      STORAGE_KEYS.LAST_RESET_DATE
    ]);

    const dailyLimit = result[STORAGE_KEYS.DAILY_LIMIT] || 0;
    let dailyMessageCount = result[STORAGE_KEYS.DAILY_MESSAGE_COUNT] || 0;
    const lastResetDate = result[STORAGE_KEYS.LAST_RESET_DATE] || new Date().toDateString();
    const currentDate = new Date().toDateString();

    // Reset count if it's a new day
    if (lastResetDate !== currentDate) {
      dailyMessageCount = 0;
      await chrome.storage.local.set({
        [STORAGE_KEYS.DAILY_MESSAGE_COUNT]: 0,
        [STORAGE_KEYS.LAST_RESET_DATE]: currentDate
      });
      console.log('🔧 Sequoia: Daily message count reset for new day');
    }

    // Check if limit is exceeded (0 means no limit)
    const isExceeded = dailyLimit > 0 && dailyMessageCount >= dailyLimit;

    return {
      dailyLimit,
      dailyMessageCount,
      isExceeded,
      lastResetDate: currentDate
    };
  } catch (error) {
    console.error('🔧 Sequoia: Error checking daily limit:', error);
    return {
      dailyLimit: 0,
      dailyMessageCount: 0,
      isExceeded: false,
      lastResetDate: new Date().toDateString()
    };
  }
}

// Increment daily message count
async function incrementDailyMessageCount() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.DAILY_MESSAGE_COUNT,
      STORAGE_KEYS.LAST_RESET_DATE
    ]);

    let dailyMessageCount = result[STORAGE_KEYS.DAILY_MESSAGE_COUNT] || 0;
    const lastResetDate = result[STORAGE_KEYS.LAST_RESET_DATE] || new Date().toDateString();
    const currentDate = new Date().toDateString();

    // Reset count if it's a new day
    if (lastResetDate !== currentDate) {
      dailyMessageCount = 0;
    }

    // Increment count
    dailyMessageCount++;

    await chrome.storage.local.set({
      [STORAGE_KEYS.DAILY_MESSAGE_COUNT]: dailyMessageCount,
      [STORAGE_KEYS.LAST_RESET_DATE]: currentDate
    });

    console.log(`🔧 Sequoia: Daily message count incremented to: ${dailyMessageCount}`);
    
    return dailyMessageCount;
  } catch (error) {
    console.error('🔧 Sequoia: Error incrementing daily message count:', error);
    return 0;
  }
}

// Set daily limit
async function setDailyLimit(limit) {
  try {
    // Validate and clamp values to ranges
    const clampedLimit = Math.max(0, Math.min(100, limit));

    await chrome.storage.local.set({
      [STORAGE_KEYS.DAILY_LIMIT]: clampedLimit
    });

    console.log(`🔧 Sequoia: Daily limit updated to: ${clampedLimit}`);
    
    return clampedLimit;
  } catch (error) {
    console.error('🔧 Sequoia: Error setting daily limit:', error);
  }
}

// Initialize storage on startup
initializeStorage().then(() => {
    console.log("🔧 Sequoia: Storage initialized");
}).catch(error => {
    console.error("🔧 Sequoia: Failed to initialize storage:", error);
});

// Service management
class MessageLoggerServiceManager {
    constructor() {
        this.serviceStatus = 'unknown';
        this.lastCheck = 0;
        this.checkInterval = 30000; // Check every 30 seconds
        this.stats = {
            totalMessages: 0,
            lastMessageTime: null
        };
    }

    async checkServiceHealth() {
        try {
            const response = await fetch(`${LOGGER_SERVICE_URL}/health`);
            if (response.ok) {
                const data = await response.json();
                this.serviceStatus = 'healthy';
                this.lastCheck = Date.now();
                this.stats.totalMessages = data.total_messages;
                return {
                    status: 'healthy',
                    total_messages: data.total_messages
                };
            } else {
                this.serviceStatus = 'error';
                return { status: 'error', error: `HTTP ${response.status}` };
            }
        } catch (error) {
            this.serviceStatus = 'unavailable';
            return { status: 'unavailable', error: error.message };
        }
    }

    async logMessage(message, url) {
        try {
            // Check daily limit before processing message
            const dailyLimitCheck = await checkDailyLimit();
            
            if (dailyLimitCheck.isExceeded) {
                console.log('🔧 Sequoia: Daily limit exceeded, blocking message');
                return {
                    error: 'Daily limit exceeded',
                    dailyLimit: dailyLimitCheck.dailyLimit,
                    dailyMessageCount: dailyLimitCheck.dailyMessageCount,
                    isExceeded: true
                };
            }

            const response = await fetch(`${LOGGER_SERVICE_URL}/log-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, url })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Update stats
            this.stats.totalMessages++;
            this.stats.lastMessageTime = new Date().toISOString();

            // Track environmental savings if compression was successful
            if (result && result.compression && result.compression.success) {
                const tokensSaved = result.compression.original_tokens - result.compression.compressed_tokens;
                if (tokensSaved > 0) {
                    try {
                        await updateSavings(tokensSaved);
                    } catch (error) {
                        console.error('🔧 Sequoia: Failed to update savings:', error);
                    }
                }
            }

            return result;
        } catch (error) {
            console.error('Message logger service error:', error);
            throw error;
        }
    }

    async getMessages() {
        try {
            const response = await fetch(`${LOGGER_SERVICE_URL}/messages`);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to get messages:', error);
            throw error;
        }
    }

    getStats() {
        return {
            ...this.stats,
            serviceStatus: this.serviceStatus,
            lastCheck: this.lastCheck
        };
    }

    async startPeriodicHealthCheck() {
        // Initial check
        await this.checkServiceHealth();
        
        // Set up periodic checking
        setInterval(async () => {
            await this.checkServiceHealth();
        }, this.checkInterval);
    }
}

// Initialize service manager
const serviceManager = new MessageLoggerServiceManager();

// Start periodic health checks
serviceManager.startPeriodicHealthCheck();

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let async = false;
    switch (request.action) {
        case 'checkServiceHealth':
            serviceManager.checkServiceHealth().then(sendResponse);
            return true; // Keep message channel open for async response

        case 'logMessage':
            async = true;
            serviceManager.logMessage(request.message, request.url).then(sendResponse).catch(error => {
                sendResponse({ error: error.message });
            });
            return true;

        case 'getMessages':
            async = true;
            serviceManager.getMessages().then(sendResponse).catch(error => {
                sendResponse({ error: error.message });
            });
            return true;

        case 'getStats':
            sendResponse(serviceManager.getStats());
            return false;

        case 'getServiceStatus':
            sendResponse({ status: serviceManager.serviceStatus });
            return false;

        case 'getDailyLimit':
            async = true;
            checkDailyLimit().then(sendResponse).catch(error => {
                sendResponse({ error: error.message });
            });
            return true;

        case 'setDailyLimit':
            async = true;
            setDailyLimit(request.limit).then(sendResponse).catch(error => {
                sendResponse({ error: error.message });
            });
            return true;
    }
});

// Extension installation/update handling
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Sequoia AI Message Logger Extension installed');
        
        // Open welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('pages/popup/popup.html')
        });
    } else if (details.reason === 'update') {
        console.log('Sequoia AI Message Logger Extension updated');
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Sequoia AI Message Logger Extension started');
    serviceManager.startPeriodicHealthCheck();
});

// Handle tab updates to inject content script on AI service pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if this is a supported AI service page
        const isChatGPT = tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com');
        const isClaude = tab.url.includes('claude.ai');
        const isGemini = tab.url.includes('gemini.google.com') || tab.url.includes('bard.google.com');
        const isGrok = tab.url.includes('grok.com');
        
        if (isChatGPT || isClaude || isGemini || isGrok) {
            let serviceName = 'Unknown AI Service';
            if (isChatGPT) serviceName = 'ChatGPT';
            else if (isClaude) serviceName = 'Claude AI';
            else if (isGemini) serviceName = 'Gemini';
            else if (isGrok) serviceName = 'Grok';
            console.log(`${serviceName} page detected, ensuring content script is active`);
            
            // Inject content script if not already injected
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['dist/content.js']
            }).catch(error => {
                // Script might already be injected, which is fine
                console.log('Content script injection result:', error);
            });
        }
    }
});

console.log('Sequoia AI Message Logger Extension background script loaded'); 