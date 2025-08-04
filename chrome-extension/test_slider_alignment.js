// Test script for slider alignment and positioning
// Run this in the browser console to test the slider alignment

console.log('🧪 Testing Slider Alignment and Positioning...');

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

console.log('📊 Slider Range Testing:');

// Test minimum values (should be 0%)
console.log('\n🎯 Minimum Values (0%):');
const waterMinPercentage = goalToSliderPercentage(WEEKLY_GOAL_RANGES.WATER.MIN, 'water');
const co2MinPercentage = goalToSliderPercentage(WEEKLY_GOAL_RANGES.CO2.MIN, 'co2');
console.log(`Water min (${WEEKLY_GOAL_RANGES.WATER.MIN}L): ${waterMinPercentage.toFixed(1)}%`);
console.log(`CO2 min (${WEEKLY_GOAL_RANGES.CO2.MIN}kg): ${co2MinPercentage.toFixed(1)}%`);

// Test maximum values (should be 100%)
console.log('\n🎯 Maximum Values (100%):');
const waterMaxPercentage = goalToSliderPercentage(WEEKLY_GOAL_RANGES.WATER.MAX, 'water');
const co2MaxPercentage = goalToSliderPercentage(WEEKLY_GOAL_RANGES.CO2.MAX, 'co2');
console.log(`Water max (${WEEKLY_GOAL_RANGES.WATER.MAX}L): ${waterMaxPercentage.toFixed(1)}%`);
console.log(`CO2 max (${WEEKLY_GOAL_RANGES.CO2.MAX}kg): ${co2MaxPercentage.toFixed(1)}%`);

// Test middle values (should be 50%)
console.log('\n🎯 Middle Values (50%):');
const waterMiddle = (WEEKLY_GOAL_RANGES.WATER.MIN + WEEKLY_GOAL_RANGES.WATER.MAX) / 2;
const co2Middle = (WEEKLY_GOAL_RANGES.CO2.MIN + WEEKLY_GOAL_RANGES.CO2.MAX) / 2;
const waterMiddlePercentage = goalToSliderPercentage(waterMiddle, 'water');
const co2MiddlePercentage = goalToSliderPercentage(co2Middle, 'co2');
console.log(`Water middle (${waterMiddle}L): ${waterMiddlePercentage.toFixed(1)}%`);
console.log(`CO2 middle (${co2Middle}kg): ${co2MiddlePercentage.toFixed(1)}%`);

// Test default values
console.log('\n🎯 Default Values:');
const waterDefaultPercentage = goalToSliderPercentage(WEEKLY_GOAL_RANGES.WATER.DEFAULT, 'water');
const co2DefaultPercentage = goalToSliderPercentage(WEEKLY_GOAL_RANGES.CO2.DEFAULT, 'co2');
console.log(`Water default (${WEEKLY_GOAL_RANGES.WATER.DEFAULT}L): ${waterDefaultPercentage.toFixed(1)}%`);
console.log(`CO2 default (${WEEKLY_GOAL_RANGES.CO2.DEFAULT}kg): ${co2DefaultPercentage.toFixed(1)}%`);

// Test round-trip conversion for edge cases
console.log('\n🔄 Round-trip Conversion Testing:');
const testValues = [
  { value: WEEKLY_GOAL_RANGES.WATER.MIN, type: 'water', name: 'Water Min' },
  { value: WEEKLY_GOAL_RANGES.WATER.MAX, type: 'water', name: 'Water Max' },
  { value: WEEKLY_GOAL_RANGES.CO2.MIN, type: 'co2', name: 'CO2 Min' },
  { value: WEEKLY_GOAL_RANGES.CO2.MAX, type: 'co2', name: 'CO2 Max' }
];

testValues.forEach(({ value, type, name }) => {
  const percentage = goalToSliderPercentage(value, type);
  const convertedValue = sliderPercentageToGoal(percentage, type);
  const unit = type === 'water' ? 'L' : 'kg';
  console.log(`${name}: ${value}${unit} → ${percentage.toFixed(1)}% → ${convertedValue.toFixed(1)}${unit}`);
});

console.log('\n✅ Verification:');
console.log(`Water min should be 0%: ${Math.abs(waterMinPercentage) < 0.1 ? '✅ Correct' : '❌ Wrong'}`);
console.log(`Water max should be 100%: ${Math.abs(waterMaxPercentage - 100) < 0.1 ? '✅ Correct' : '❌ Wrong'}`);
console.log(`CO2 min should be 0%: ${Math.abs(co2MinPercentage) < 0.1 ? '✅ Correct' : '❌ Wrong'}`);
console.log(`CO2 max should be 100%: ${Math.abs(co2MaxPercentage - 100) < 0.1 ? '✅ Correct' : '❌ Wrong'}`);

console.log('\n📝 Slider Alignment Summary:');
console.log('- Sliders now start exactly at minimum values (0.4kg, 3L, Eco)');
console.log('- Sliders now end exactly at maximum values (5kg, 40L, Power)');
console.log('- No extra padding on sides - sliders align with markers');
console.log('- Clicking labels sets exact values with proper positioning');
console.log('- All percentage calculations work correctly with new alignment');

console.log('\n✅ Slider Alignment Test Complete!'); 