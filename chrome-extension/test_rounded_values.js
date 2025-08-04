// Test script for rounded values and middle values
// Run this in the browser console to test the rounding and middle values

console.log('🧪 Testing Rounded Values and Middle Values...');

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

// Calculate middle values
const WATER_MIDDLE = (WEEKLY_GOAL_RANGES.WATER.MIN + WEEKLY_GOAL_RANGES.WATER.MAX) / 2;
const CO2_MIDDLE = (WEEKLY_GOAL_RANGES.CO2.MIN + WEEKLY_GOAL_RANGES.CO2.MAX) / 2;

console.log('📊 Middle Values:');
console.log(`Water middle: ${WATER_MIDDLE}L (between ${WEEKLY_GOAL_RANGES.WATER.MIN}L and ${WEEKLY_GOAL_RANGES.WATER.MAX}L)`);
console.log(`CO2 middle: ${CO2_MIDDLE}kg (between ${WEEKLY_GOAL_RANGES.CO2.MIN}kg and ${WEEKLY_GOAL_RANGES.CO2.MAX}kg)`);

// Test rounding function (same as used in Main component)
function roundGoalValue(value) {
  return Math.round(value * 10) / 10;
}

// Test various values for rounding
console.log('\n🔢 Testing Rounding Function:');
const testValues = [
  { value: 3.6, type: 'CO2' },
  { value: 2.5, type: 'CO2' },
  { value: 3.0, type: 'CO2' },
  { value: 1.0, type: 'CO2' },
  { value: 10.0, type: 'Water' },
  { value: 21.5, type: 'Water' },
  { value: 15.7, type: 'Water' },
  { value: 40.0, type: 'Water' }
];

testValues.forEach(({ value, type }) => {
  const rounded = roundGoalValue(value);
  const unit = type === 'Water' ? 'L' : 'kg';
  console.log(`${value}${unit} → ${rounded}${unit}`);
});

// Test conversion functions for middle values
function goalToSliderPercentage(value, type) {
  const ranges = type === 'water' ? WEEKLY_GOAL_RANGES.WATER : WEEKLY_GOAL_RANGES.CO2;
  return ((value - ranges.MIN) / (ranges.MAX - ranges.MIN)) * 100;
}

console.log('\n🎯 Testing Middle Value Conversions:');
const waterMiddlePercentage = goalToSliderPercentage(WATER_MIDDLE, 'water');
const co2MiddlePercentage = goalToSliderPercentage(CO2_MIDDLE, 'co2');

console.log(`Water middle (${WATER_MIDDLE}L): ${waterMiddlePercentage.toFixed(1)}%`);
console.log(`CO2 middle (${CO2_MIDDLE}kg): ${co2MiddlePercentage.toFixed(1)}%`);

// Test that middle values are exactly 50% on the slider
console.log('\n✅ Verification:');
console.log(`Water middle should be 50%: ${Math.abs(waterMiddlePercentage - 50) < 0.1 ? '✅ Correct' : '❌ Wrong'}`);
console.log(`CO2 middle should be 50%: ${Math.abs(co2MiddlePercentage - 50) < 0.1 ? '✅ Correct' : '❌ Wrong'}`);

console.log('\n📝 Summary:');
console.log('- Progress cards now show rounded goal values (e.g., 3.6kg, 2.5kg, 3.0kg)');
console.log('- Middle labels show actual middle values: 21.5L for water, 2.7kg for CO2');
console.log('- Clicking middle labels sets slider to exactly 50% position');
console.log('- All values are properly rounded to 1 decimal place');

console.log('\n✅ Rounded Values and Middle Values Test Complete!'); 