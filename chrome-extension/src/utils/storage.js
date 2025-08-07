// Storage utility functions for Sequoia extension

// Constants for environmental impact calculations
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

// Daily limit ranges
const DAILY_LIMIT_RANGES = {
  MIN: 10,     // Minimum 10 messages per day
  MAX: 100,    // Maximum 100 messages per day
  DEFAULT: 0   // 0 means no limit
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

/**
 * Initialize storage with default values if not already set
 */
export async function initializeStorage() {
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
      updates[STORAGE_KEYS.DAILY_LIMIT] = DAILY_LIMIT_RANGES.DEFAULT;
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

    return {
      co2Saved: result[STORAGE_KEYS.CO2_SAVED] || 0,
      waterSaved: result[STORAGE_KEYS.WATER_SAVED] || 0,
      isPaused: result[STORAGE_KEYS.IS_PAUSED] || false,
      welcomeCompleted: result[STORAGE_KEYS.WELCOME_COMPLETED] || false,
      weeklyWaterGoal: result[STORAGE_KEYS.WEEKLY_WATER_GOAL] || WEEKLY_GOAL_RANGES.WATER.DEFAULT,
      weeklyCo2Goal: result[STORAGE_KEYS.WEEKLY_CO2_GOAL] || WEEKLY_GOAL_RANGES.CO2.DEFAULT,
      dailyLimit: result[STORAGE_KEYS.DAILY_LIMIT] || DAILY_LIMIT_RANGES.DEFAULT,
      dailyMessageCount: result[STORAGE_KEYS.DAILY_MESSAGE_COUNT] || 0,
      lastResetDate: result[STORAGE_KEYS.LAST_RESET_DATE] || new Date().toDateString()
    };
  } catch (error) {
    console.error('🔧 Sequoia: Error initializing storage:', error);
    return {
      co2Saved: 0,
      waterSaved: 0,
      isPaused: false,
      welcomeCompleted: false,
      weeklyWaterGoal: WEEKLY_GOAL_RANGES.WATER.DEFAULT,
      weeklyCo2Goal: WEEKLY_GOAL_RANGES.CO2.DEFAULT,
      dailyLimit: DAILY_LIMIT_RANGES.DEFAULT,
      dailyMessageCount: 0,
      lastResetDate: new Date().toDateString()
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

/**
 * Check if welcome screens have been completed
 */
export async function isWelcomeCompleted() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.WELCOME_COMPLETED]);
    return result[STORAGE_KEYS.WELCOME_COMPLETED] || false;
  } catch (error) {
    console.error('🔧 Sequoia: Error checking welcome completion:', error);
    return false;
  }
}

/**
 * Mark welcome screens as completed
 */
export async function markWelcomeCompleted() {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.WELCOME_COMPLETED]: true });
    console.log('🔧 Sequoia: Welcome screens marked as completed');
  } catch (error) {
    console.error('🔧 Sequoia: Error marking welcome as completed:', error);
  }
}

/**
 * Get weekly goals
 */
export async function getWeeklyGoals() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.WEEKLY_WATER_GOAL,
      STORAGE_KEYS.WEEKLY_CO2_GOAL
    ]);

    return {
      waterGoal: result[STORAGE_KEYS.WEEKLY_WATER_GOAL] || WEEKLY_GOAL_RANGES.WATER.DEFAULT,
      co2Goal: result[STORAGE_KEYS.WEEKLY_CO2_GOAL] || WEEKLY_GOAL_RANGES.CO2.DEFAULT
    };
  } catch (error) {
    console.error('🔧 Sequoia: Error getting weekly goals:', error);
    return {
      waterGoal: WEEKLY_GOAL_RANGES.WATER.DEFAULT,
      co2Goal: WEEKLY_GOAL_RANGES.CO2.DEFAULT
    };
  }
}

/**
 * Set weekly goals
 */
export async function setWeeklyGoals(waterGoal, co2Goal) {
  try {
    // Validate and clamp values to ranges
    const clampedWaterGoal = Math.max(
      WEEKLY_GOAL_RANGES.WATER.MIN,
      Math.min(WEEKLY_GOAL_RANGES.WATER.MAX, waterGoal)
    );
    
    const clampedCo2Goal = Math.max(
      WEEKLY_GOAL_RANGES.CO2.MIN,
      Math.min(WEEKLY_GOAL_RANGES.CO2.MAX, co2Goal)
    );

    await chrome.storage.local.set({
      [STORAGE_KEYS.WEEKLY_WATER_GOAL]: clampedWaterGoal,
      [STORAGE_KEYS.WEEKLY_CO2_GOAL]: clampedCo2Goal
    });

    console.log(`🔧 Sequoia: Weekly goals updated - Water: ${clampedWaterGoal}L, CO2: ${clampedCo2Goal}kg`);
    
    return {
      waterGoal: clampedWaterGoal,
      co2Goal: clampedCo2Goal
    };
  } catch (error) {
    console.error('🔧 Sequoia: Error setting weekly goals:', error);
  }
}

/**
 * Convert goal value to slider percentage
 */
export function goalToSliderPercentage(value, type) {
  const ranges = type === 'water' ? WEEKLY_GOAL_RANGES.WATER : WEEKLY_GOAL_RANGES.CO2;
  return ((value - ranges.MIN) / (ranges.MAX - ranges.MIN)) * 100;
}

/**
 * Convert slider percentage to goal value
 */
export function sliderPercentageToGoal(percentage, type) {
  const ranges = type === 'water' ? WEEKLY_GOAL_RANGES.WATER : WEEKLY_GOAL_RANGES.CO2;
  return ranges.MIN + (percentage / 100) * (ranges.MAX - ranges.MIN);
}

/**
 * Get daily limit settings
 */
export async function getDailyLimit() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.DAILY_LIMIT,
      STORAGE_KEYS.DAILY_MESSAGE_COUNT,
      STORAGE_KEYS.LAST_RESET_DATE
    ]);

    return {
      dailyLimit: result[STORAGE_KEYS.DAILY_LIMIT] || DAILY_LIMIT_RANGES.DEFAULT,
      dailyMessageCount: result[STORAGE_KEYS.DAILY_MESSAGE_COUNT] || 0,
      lastResetDate: result[STORAGE_KEYS.LAST_RESET_DATE] || new Date().toDateString()
    };
  } catch (error) {
    console.error('🔧 Sequoia: Error getting daily limit:', error);
    return {
      dailyLimit: DAILY_LIMIT_RANGES.DEFAULT,
      dailyMessageCount: 0,
      lastResetDate: new Date().toDateString()
    };
  }
}

/**
 * Set daily limit
 */
export async function setDailyLimit(limit) {
  try {
    // Validate and clamp values to ranges
    const clampedLimit = Math.max(
      DAILY_LIMIT_RANGES.MIN,
      Math.min(DAILY_LIMIT_RANGES.MAX, limit)
    );

    await chrome.storage.local.set({
      [STORAGE_KEYS.DAILY_LIMIT]: clampedLimit
    });

    console.log(`🔧 Sequoia: Daily limit updated to: ${clampedLimit}`);
    
    return clampedLimit;
  } catch (error) {
    console.error('🔧 Sequoia: Error setting daily limit:', error);
  }
}

/**
 * Check if daily limit is exceeded and reset count if it's a new day
 */
export async function checkDailyLimit() {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.DAILY_LIMIT,
      STORAGE_KEYS.DAILY_MESSAGE_COUNT,
      STORAGE_KEYS.LAST_RESET_DATE
    ]);

    const dailyLimit = result[STORAGE_KEYS.DAILY_LIMIT] || DAILY_LIMIT_RANGES.DEFAULT;
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
      dailyLimit: DAILY_LIMIT_RANGES.DEFAULT,
      dailyMessageCount: 0,
      isExceeded: false,
      lastResetDate: new Date().toDateString()
    };
  }
}

/**
 * Increment daily message count
 */
export async function incrementDailyMessageCount() {
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

/**
 * Convert daily limit value to slider percentage
 */
export function dailyLimitToSliderPercentage(value) {
  if (value === 0) return 0; // No limit
  return ((value - DAILY_LIMIT_RANGES.MIN) / (DAILY_LIMIT_RANGES.MAX - DAILY_LIMIT_RANGES.MIN)) * 100;
}

/**
 * Convert slider percentage to daily limit value
 */
export function sliderPercentageToDailyLimit(percentage) {
  if (percentage === 0) return 0; // No limit
  return Math.round(DAILY_LIMIT_RANGES.MIN + (percentage / 100) * (DAILY_LIMIT_RANGES.MAX - DAILY_LIMIT_RANGES.MIN));
}

export { ENVIRONMENTAL_IMPACT, STORAGE_KEYS, WEEKLY_GOAL_RANGES, DAILY_LIMIT_RANGES }; 