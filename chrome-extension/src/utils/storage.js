// Storage utility functions for Sequoia extension

// Constants for environmental impact calculations
const ENVIRONMENTAL_IMPACT = {
  WATER_PER_TOKEN: 0.5, // 0.5 mL of water saved per token
  CO2_PER_TOKEN: 0.04   // 0.04g of CO2 saved per token
};

// Storage keys
const STORAGE_KEYS = {
  CO2_SAVED: 'co2Saved',
  WATER_SAVED: 'waterSaved',
  IS_PAUSED: 'isPaused'
};

/**
 * Initialize storage with default values if not already set
 */
export async function initializeStorage() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.CO2_SAVED,
      STORAGE_KEYS.WATER_SAVED,
      STORAGE_KEYS.IS_PAUSED
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

    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
      console.log('🔧 Sequoia: Storage initialized with default values:', updates);
    }

    return {
      co2Saved: result[STORAGE_KEYS.CO2_SAVED] || 0,
      waterSaved: result[STORAGE_KEYS.WATER_SAVED] || 0,
      isPaused: result[STORAGE_KEYS.IS_PAUSED] || false
    };
  } catch (error) {
    console.error('🔧 Sequoia: Error initializing storage:', error);
    return {
      co2Saved: 0,
      waterSaved: 0,
      isPaused: false
    };
  }
}

/**
 * Get current savings values
 */
export async function getSavings() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.CO2_SAVED,
      STORAGE_KEYS.WATER_SAVED
    ]);

    return {
      co2Saved: result[STORAGE_KEYS.CO2_SAVED] || 0,
      waterSaved: result[STORAGE_KEYS.WATER_SAVED] || 0
    };
  } catch (error) {
    console.error('🔧 Sequoia: Error getting savings:', error);
    return {
      co2Saved: 0,
      waterSaved: 0
    };
  }
}

/**
 * Update savings based on tokens saved from compression
 */
export async function updateSavings(tokensSaved) {
  if (!tokensSaved || tokensSaved <= 0) {
    return;
  }

  try {
    const currentSavings = await getSavings();
    
    const co2Increase = tokensSaved * ENVIRONMENTAL_IMPACT.CO2_PER_TOKEN;
    const waterIncrease = tokensSaved * ENVIRONMENTAL_IMPACT.WATER_PER_TOKEN;
    
    const newCo2Saved = currentSavings.co2Saved + co2Increase;
    const newWaterSaved = currentSavings.waterSaved + waterIncrease;
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.CO2_SAVED]: newCo2Saved,
      [STORAGE_KEYS.WATER_SAVED]: newWaterSaved
    });

    console.log(`🔧 Sequoia: Updated savings - CO2: +${co2Increase.toFixed(2)}g (${newCo2Saved.toFixed(2)}g total), Water: +${waterIncrease.toFixed(2)}mL (${newWaterSaved.toFixed(2)}mL total)`);
    
    return {
      co2Saved: newCo2Saved,
      waterSaved: newWaterSaved,
      co2Increase,
      waterIncrease
    };
  } catch (error) {
    console.error('🔧 Sequoia: Error updating savings:', error);
  }
}

/**
 * Reset savings to zero
 */
export async function resetSavings() {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.CO2_SAVED]: 0,
      [STORAGE_KEYS.WATER_SAVED]: 0
    });
    
    console.log('🔧 Sequoia: Savings reset to zero');
  } catch (error) {
    console.error('🔧 Sequoia: Error resetting savings:', error);
  }
}

/**
 * Get pause state
 */
export async function getPauseState() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.IS_PAUSED]);
    return result[STORAGE_KEYS.IS_PAUSED] || false;
  } catch (error) {
    console.error('🔧 Sequoia: Error getting pause state:', error);
    return false;
  }
}

/**
 * Set pause state
 */
export async function setPauseState(isPaused) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.IS_PAUSED]: isPaused });
    console.log(`🔧 Sequoia: Pause state set to: ${isPaused}`);
  } catch (error) {
    console.error('🔧 Sequoia: Error setting pause state:', error);
  }
}

/**
 * Format savings for display
 */
export function formatSavings(co2Saved, waterSaved) {
  return {
    co2Formatted: `${co2Saved.toFixed(1)}g`,
    waterFormatted: `${waterSaved.toFixed(1)}mL`,
    co2Percentage: Math.min(Math.round((co2Saved / 100) * 100), 100), // Scale to 100g max
    waterPercentage: Math.min(Math.round((waterSaved / 1000) * 100), 100) // Scale to 1000mL max
  };
}

export { ENVIRONMENTAL_IMPACT, STORAGE_KEYS }; 