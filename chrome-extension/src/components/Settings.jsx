import React, { useState, useRef, useEffect } from 'react';
import './Settings.css';
import { 
  getWeeklyGoals, 
  setWeeklyGoals, 
  goalToSliderPercentage, 
  sliderPercentageToGoal,
  WEEKLY_GOAL_RANGES,
  getDailyLimit,
  setDailyLimit,
  dailyLimitToSliderPercentage,
  sliderPercentageToDailyLimit,
  DAILY_LIMIT_RANGES
} from '../utils/storage.js';

const Settings = ({ onBack }) => {
  const [sliderValues, setSliderValues] = useState({
    co2: 50, // Default to middle (50%)
    water: 50, // Default to middle (50%)
    dailyLimit: 0
  });

  const [goalValues, setGoalValues] = useState({
    co2: WEEKLY_GOAL_RANGES.CO2.DEFAULT,
    water: WEEKLY_GOAL_RANGES.WATER.DEFAULT,
    dailyLimit: DAILY_LIMIT_RANGES.DEFAULT
  });

  const [isDragging, setIsDragging] = useState({
    co2: false,
    water: false,
    dailyLimit: false
  });

  const [activeSlider, setActiveSlider] = useState(null);

  const sliderRefs = {
    co2: useRef(null),
    water: useRef(null),
    dailyLimit: useRef(null)
  };

  // Load weekly goals and daily limit on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [goals, dailyLimitData] = await Promise.all([
          getWeeklyGoals(),
          getDailyLimit()
        ]);
        
        const co2Percentage = goalToSliderPercentage(goals.co2Goal, 'co2');
        const waterPercentage = goalToSliderPercentage(goals.waterGoal, 'water');
        const dailyLimitPercentage = dailyLimitToSliderPercentage(dailyLimitData.dailyLimit);
        
        setSliderValues(prev => ({
          ...prev,
          co2: co2Percentage,
          water: waterPercentage,
          dailyLimit: dailyLimitPercentage
        }));
        
        setGoalValues({
          co2: goals.co2Goal,
          water: goals.waterGoal,
          dailyLimit: dailyLimitData.dailyLimit
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleMouseDown = (sliderType, e) => {
    e.preventDefault();
    setActiveSlider(sliderType);
    setIsDragging(prev => ({ co2: false, water: false, dailyLimit: false, [sliderType]: true }));
    handleMouseMove(sliderType, e);
  };

  const handleMouseMove = (sliderType, e) => {
    if (!isDragging[sliderType]) return;
    
    const slider = sliderRefs[sliderType].current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    setSliderValues(prev => ({ ...prev, [sliderType]: percentage }));
    
    // Update goal values for water, CO2, and daily limit sliders
    if (sliderType === 'water' || sliderType === 'co2') {
      const goalValue = sliderPercentageToGoal(percentage, sliderType);
      setGoalValues(prev => ({ ...prev, [sliderType]: goalValue }));
    } else if (sliderType === 'dailyLimit') {
      const limitValue = sliderPercentageToDailyLimit(percentage);
      setGoalValues(prev => ({ ...prev, [sliderType]: limitValue }));
    }
  };

  const handleMouseUp = async () => {
    // Save weekly goals when user finishes dragging
    if (isDragging.co2 || isDragging.water) {
      try {
        await setWeeklyGoals(goalValues.water, goalValues.co2);
      } catch (error) {
        console.error('Error saving weekly goals:', error);
      }
    }
    
    // Save daily limit when user finishes dragging
    if (isDragging.dailyLimit) {
      try {
        await setDailyLimit(goalValues.dailyLimit);
      } catch (error) {
        console.error('Error saving daily limit:', error);
      }
    }
    
    setIsDragging({ co2: false, water: false, dailyLimit: false });
    setActiveSlider(null);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging.co2) handleMouseMove('co2', e);
      if (isDragging.water) handleMouseMove('water', e);
      if (isDragging.dailyLimit) handleMouseMove('dailyLimit', e);
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (isDragging.co2 || isDragging.water || isDragging.dailyLimit) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, goalValues]);

  const formatGoalValue = (value, type) => {
    if (type === 'water') {
      return `${value.toFixed(1)}L`;
    } else if (type === 'co2') {
      return `${value.toFixed(1)}kg`;
    } else if (type === 'dailyLimit') {
      return value === 0 ? 'No Limit' : `${value} messages`;
    }
    return Math.round(value);
  };

  const handleLabelClick = async (sliderType, value) => {
    // Convert the value to slider percentage
    let percentage;
    if (sliderType === 'dailyLimit') {
      percentage = dailyLimitToSliderPercentage(value);
    } else {
      percentage = goalToSliderPercentage(value, sliderType);
    }
    
    // Update slider values
    setSliderValues(prev => ({ ...prev, [sliderType]: percentage }));
    setGoalValues(prev => ({ ...prev, [sliderType]: value }));
    
    // Save the new goal
    try {
      if (sliderType === 'water') {
        await setWeeklyGoals(value, goalValues.co2);
      } else if (sliderType === 'co2') {
        await setWeeklyGoals(goalValues.water, value);
      } else if (sliderType === 'dailyLimit') {
        await setDailyLimit(value);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="settings-screen">
      <div className="settings-container">
        {/* Header Section */}
        <div className="settings-header">
          <div className="header-left">
            <div className="back-button" onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="settings-title">Settings</div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="settings-content">
          <div className="settings-title-main">Change Your Weekly Goals</div>
          
          {/* Weekly CO2 Goal Slider */}
          <div className="slider-section">
            <div className="slider-label">Weekly CO2 Goal</div>
            <div className="slider-container">
              <div 
                className={`slider-track co2-track ${isDragging.co2 ? 'dragging' : ''}`}
                ref={sliderRefs.co2}
                onMouseDown={(e) => handleMouseDown('co2', e)}
              >
                <div 
                  className="slider-fill co2-fill"
                  style={{ width: `${sliderValues.co2}%` }}
                ></div>
                <div 
                  className="slider-knob"
                  style={{ left: `${sliderValues.co2}%` }}
                >
                  <div className="slider-tooltip">{formatGoalValue(goalValues.co2, 'co2')}</div>
                </div>
              </div>
              <div className="slider-markers">
                <div className="marker">
                  <div className="marker-line"></div>
                  <div 
                    className="marker-label clickable"
                    onClick={() => handleLabelClick('co2', WEEKLY_GOAL_RANGES.CO2.MIN)}
                  >
                    {WEEKLY_GOAL_RANGES.CO2.MIN}kg
                  </div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div 
                    className="marker-label clickable"
                    onClick={() => handleLabelClick('co2', 2.7)}
                  >
                    2.7kg
                  </div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div 
                    className="marker-label clickable"
                    onClick={() => handleLabelClick('co2', WEEKLY_GOAL_RANGES.CO2.MAX)}
                  >
                    {WEEKLY_GOAL_RANGES.CO2.MAX}kg
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weekly Water Goal Slider */}
          <div className="slider-section">
            <div className="slider-label">Weekly Water Goal</div>
            <div className="slider-container">
              <div 
                className={`slider-track water-track ${isDragging.water ? 'dragging' : ''}`}
                ref={sliderRefs.water}
                onMouseDown={(e) => handleMouseDown('water', e)}
              >
                <div 
                  className="slider-fill water-fill"
                  style={{ width: `${sliderValues.water}%` }}
                ></div>
                <div 
                  className="slider-knob"
                  style={{ left: `${sliderValues.water}%` }}
                >
                  <div className="slider-tooltip">{formatGoalValue(goalValues.water, 'water')}</div>
                </div>
              </div>
              <div className="slider-markers">
                <div className="marker">
                  <div className="marker-line"></div>
                  <div 
                    className="marker-label clickable"
                    onClick={() => handleLabelClick('water', WEEKLY_GOAL_RANGES.WATER.MIN)}
                  >
                    {WEEKLY_GOAL_RANGES.WATER.MIN}L
                  </div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div 
                    className="marker-label clickable"
                    onClick={() => handleLabelClick('water', 21.5)}
                  >
                    21.5L
                  </div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div 
                    className="marker-label clickable"
                    onClick={() => handleLabelClick('water', WEEKLY_GOAL_RANGES.WATER.MAX)}
                  >
                    {WEEKLY_GOAL_RANGES.WATER.MAX}L
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Daily Limit Slider */}
          <div className="slider-section">
            <div className="slider-label">Daily Message Limit</div>
            <div className="slider-container">
              <div 
                className={`slider-track daily-limit-track ${isDragging.dailyLimit ? 'dragging' : ''}`}
                ref={sliderRefs.dailyLimit}
                onMouseDown={(e) => handleMouseDown('dailyLimit', e)}
              >
                <div 
                  className="slider-fill daily-limit-fill"
                  style={{ width: `${sliderValues.dailyLimit}%` }}
                ></div>
                <div 
                  className="slider-knob"
                  style={{ left: `${sliderValues.dailyLimit}%` }}
                >
                  <div className="slider-tooltip">{formatGoalValue(goalValues.dailyLimit, 'dailyLimit')}</div>
                </div>
              </div>
              <div className="slider-markers">
                <div className="marker">
                  <div className="marker-line"></div>
                  <div 
                    className="marker-label clickable"
                    onClick={() => handleLabelClick('dailyLimit', 0)}
                  >
                    No Limit
                  </div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div 
                    className="marker-label clickable"
                    onClick={() => handleLabelClick('dailyLimit', 25)}
                  >
                    25
                  </div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div 
                    className="marker-label clickable"
                    onClick={() => handleLabelClick('dailyLimit', DAILY_LIMIT_RANGES.MAX)}
                  >
                    {DAILY_LIMIT_RANGES.MAX}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 