// Session management utility for tracking loading screen state

class SessionManager {
  static SESSION_KEY = 'sequoia_loading_shown';
  
  /**
   * Check if this is the first time opening the extension in this browser session
   * @returns {Promise<boolean>} True if loading screen should be shown
   */
  static async isFirstTimeInSession() {
    try {
      const result = await chrome.storage.session.get([this.SESSION_KEY]);
      return !result[this.SESSION_KEY];
    } catch (error) {
      console.error('Error checking session state:', error);
      return true; // Default to showing loading screen if error
    }
  }
  
  /**
   * Mark that the loading screen has been shown for this session
   */
  static async markLoadingShown() {
    try {
      await chrome.storage.session.set({
        [this.SESSION_KEY]: true
      });
    } catch (error) {
      console.error('Error marking loading as shown:', error);
    }
  }
  
  /**
   * Reset the session state (useful for testing)
   */
  static async resetSession() {
    try {
      await chrome.storage.session.remove([this.SESSION_KEY]);
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  }
}

export default SessionManager; 