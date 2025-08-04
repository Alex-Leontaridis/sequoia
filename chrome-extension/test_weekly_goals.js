// Test script for weekly goals functionality
// Run this in the browser console to test the weekly goals

console.log('🧪 Testing Weekly Goals Functionality...');

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

// Test conversion functions
function goalToSliderPercentage(value, type) {
  const ranges = type === 'water' ? WEEKLY_GOAL_RANGES.WATER : WEEKLY_GOAL_RANGES.CO2;
  return ((value - ranges.MIN) / (ranges.MAX - ranges.MIN)) * 100;
}

function sliderPercentageToGoal(percentage, type) {
  const ranges = type === 'water' ? WEEKLY_GOAL_RANGES.WATER : WEEKLY_GOAL_RANGES.CO2;
  return ranges.MIN + (percentage / 100) * (ranges.MAX - ranges.MIN);
}

// Test cases
console.log('📊 Testing Water Goals:');
console.log(`Min: ${WEEKLY_GOAL_RANGES.WATER.MIN}L (${goalToSliderPercentage(WEEKLY_GOAL_RANGES.WATER.MIN, 'water').toFixed(1)}%)`);
console.log(`Default: ${WEEKLY_GOAL_RANGES.WATER.DEFAULT}L (${goalToSliderPercentage(WEEKLY_GOAL_RANGES.WATER.DEFAULT, 'water').toFixed(1)}%)`);
console.log(`Max: ${WEEKLY_GOAL_RANGES.WATER.MAX}L (${goalToSliderPercentage(WEEKLY_GOAL_RANGES.WATER.MAX, 'water').toFixed(1)}%)`);

console.log('\n📊 Testing CO2 Goals:');
console.log(`Min: ${WEEKLY_GOAL_RANGES.CO2.MIN}kg (${goalToSliderPercentage(WEEKLY_GOAL_RANGES.CO2.MIN, 'co2').toFixed(1)}%)`);
console.log(`Default: ${WEEKLY_GOAL_RANGES.CO2.DEFAULT}kg (${goalToSliderPercentage(WEEKLY_GOAL_RANGES.CO2.DEFAULT, 'co2').toFixed(1)}%)`);
console.log(`Max: ${WEEKLY_GOAL_RANGES.CO2.MAX}kg (${goalToSliderPercentage(WEEKLY_GOAL_RANGES.CO2.MAX, 'co2').toFixed(1)}%)`);

// Test round-trip conversion
console.log('\n🔄 Testing Round-trip Conversion:');
const testWaterValue = 15; // 15L
const waterPercentage = goalToSliderPercentage(testWaterValue, 'water');
const convertedWaterValue = sliderPercentageToGoal(waterPercentage, 'water');
console.log(`Water: ${testWaterValue}L → ${waterPercentage.toFixed(1)}% → ${convertedWaterValue.toFixed(1)}L`);

const testCo2Value = 2.5; // 2.5kg
const co2Percentage = goalToSliderPercentage(testCo2Value, 'co2');
const convertedCo2Value = sliderPercentageToGoal(co2Percentage, 'co2');
console.log(`CO2: ${testCo2Value}kg → ${co2Percentage.toFixed(1)}% → ${convertedCo2Value.toFixed(1)}kg`);

// Test middle point (50%)
console.log('\n🎯 Testing Middle Point (50%):');
const middleWater = sliderPercentageToGoal(50, 'water');
const middleCo2 = sliderPercentageToGoal(50, 'co2');
console.log(`50% Water: ${middleWater.toFixed(1)}L`);
console.log(`50% CO2: ${middleCo2.toFixed(1)}kg`);

console.log('\n✅ Weekly Goals Test Complete!'); 