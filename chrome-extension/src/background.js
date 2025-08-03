// Background service worker for Sequoia AI Message Logger Extension

const LOGGER_SERVICE_URL = 'http://localhost:8002';
console.log("🔧 Sequoia AI Message Logger Extension: Background script loaded!");

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
        
        if (isChatGPT || isClaude) {
            const serviceName = isChatGPT ? 'ChatGPT' : 'Claude AI';
            console.log(`${serviceName} page detected, ensuring content script is active`);
            
            // Inject content script if not already injected
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['src/content.js']
            }).catch(error => {
                // Script might already be injected, which is fine
                console.log('Content script injection result:', error);
            });
        }
    }
});

console.log('Sequoia AI Message Logger Extension background script loaded'); 