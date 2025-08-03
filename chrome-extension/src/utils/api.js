// API utilities for communication between content script and background script

class CompressionAPI {
    static async checkServiceHealth() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'checkServiceHealth'
            });
            return response;
        } catch (error) {
            console.error('Error checking service health:', error);
            return { status: 'error', error: error.message };
        }
    }

    static async compressText(text) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'compressText',
                text: text
            });
            return response;
        } catch (error) {
            console.error('Error compressing text:', error);
            return { error: error.message };
        }
    }

    static async getStats() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getStats'
            });
            return response;
        } catch (error) {
            console.error('Error getting stats:', error);
            return { error: error.message };
        }
    }

    static async getServiceStatus() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getServiceStatus'
            });
            return response;
        } catch (error) {
            console.error('Error getting service status:', error);
            return { status: 'error', error: error.message };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompressionAPI;
} else {
    window.CompressionAPI = CompressionAPI;
} 