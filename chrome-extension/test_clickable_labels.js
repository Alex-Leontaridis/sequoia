// Test script for clickable label functionality
// Run this in the browser console to test the clickable labels

console.log('🧪 Testing Clickable Label Functionality...');

// Test the goal ranges
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

// Test conversion functions (same as in the component)
function goalToSliderPercentage(value, type) {
  const ranges = type === 'water' ? WEEKLY_GOAL_RANGES.WATER : WEEKLY_GOAL_RANGES.CO2;
  return ((value - ranges.MIN) / (ranges.MAX - ranges.MIN)) * 100;
}

function sliderPercentageToGoal(percentage, type) {
  const ranges = type === 'water' ? WEEKLY_GOAL_RANGES.WATER : WEEKLY_GOAL_RANGES.CO2;
  return ranges.MIN + (percentage / 100) * (ranges.MAX - ranges.MIN);
}

// Simulate label click functionality
function simulateLabelClick(sliderType, value) {
  console.log(`\n🎯 Simulating click on ${sliderType} label: ${value}${sliderType === 'water' ? 'L' : 'kg'}`);
  
  // Convert the value to slider percentage
  const percentage = goalToSliderPercentage(value, sliderType);
  
  // Convert back to verify accuracy
  const convertedValue = sliderPercentageToGoal(percentage, sliderType);
  
  console.log(`📊 Results:`);
  console.log(`  - Clicked value: ${value}${sliderType === 'water' ? 'L' : 'kg'}`);
  console.log(`  - Slider percentage: ${percentage.toFixed(1)}%`);
  console.log(`  - Converted back: ${convertedValue.toFixed(1)}${sliderType === 'water' ? 'L' : 'kg'}`);
  console.log(`  - Accuracy: ${Math.abs(value - convertedValue) < 0.1 ? '✅ Perfect' : '❌ Error'}`);
  
  return { percentage, convertedValue };
}

// Test all clickable labels
console.log('📋 Testing All Clickable Labels:');

// Water labels
console.log('\n💧 Water Labels:');
simulateLabelClick('water', WEEKLY_GOAL_RANGES.WATER.MIN);    // 3L
simulateLabelClick('water', WEEKLY_GOAL_RANGES.WATER.DEFAULT); // 10L
simulateLabelClick('water', WEEKLY_GOAL_RANGES.WATER.MAX);    // 40L

// CO2 labels
console.log('\n🌱 CO2 Labels:');
simulateLabelClick('co2', WEEKLY_GOAL_RANGES.CO2.MIN);    // 0.4kg
simulateLabelClick('co2', WEEKLY_GOAL_RANGES.CO2.DEFAULT); // 1kg
simulateLabelClick('co2', WEEKLY_GOAL_RANGES.CO2.MAX);    // 5kg

// Test some intermediate values
console.log('\n🎯 Testing Intermediate Values:');
simulateLabelClick('water', 15); // 15L
simulateLabelClick('water', 25); // 25L
simulateLabelClick('co2', 2.5);  // 2.5kg
simulateLabelClick('co2', 3.8);  // 3.8kg

console.log('\n✅ Clickable Label Test Complete!');
console.log('\n📝 Instructions:');
console.log('- Click on any label (3L, 10L, 40L for water or 0.4kg, 1kg, 5kg for CO2)');
console.log('- The slider should jump to exactly that value');
console.log('- The tooltip should show the exact value');
console.log('- The goal should be saved automatically'); 