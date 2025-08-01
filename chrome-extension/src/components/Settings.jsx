import React, { useState, useRef, useEffect } from 'react';
import './Settings.css';

const Settings = ({ onBack }) => {
  const [sliderValues, setSliderValues] = useState({
    co2: 66,
    water: 66,
    limit: 66
  });

  const [isDragging, setIsDragging] = useState({
    co2: false,
    water: false,
    limit: false
  });

  const [activeSlider, setActiveSlider] = useState(null);

  const sliderRefs = {
    co2: useRef(null),
    water: useRef(null),
    limit: useRef(null)
  };

  const handleMouseDown = (sliderType, e) => {
    e.preventDefault();
    setActiveSlider(sliderType);
    setIsDragging(prev => ({ co2: false, water: false, limit: false, [sliderType]: true }));
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
  };

  const handleMouseUp = () => {
    setIsDragging({ co2: false, water: false, limit: false });
    setActiveSlider(null);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging.co2) handleMouseMove('co2', e);
      if (isDragging.water) handleMouseMove('water', e);
      if (isDragging.limit) handleMouseMove('limit', e);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging({ co2: false, water: false, limit: false });
      setActiveSlider(null);
    };

    if (isDragging.co2 || isDragging.water || isDragging.limit) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

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
                  <div className="slider-tooltip">{Math.round(sliderValues.co2)}</div>
                </div>
              </div>
              <div className="slider-markers">
                <div className="marker">
                  <div className="marker-line"></div>
                  <div className="marker-label">15 Min / Day</div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div className="marker-label">45 Min / Day</div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div className="marker-label">3+ Hours /Day</div>
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
                  <div className="slider-tooltip">{Math.round(sliderValues.water)}</div>
                </div>
              </div>
              <div className="slider-markers">
                <div className="marker">
                  <div className="marker-line"></div>
                  <div className="marker-label">15 Min / Day</div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div className="marker-label">45 Min / Day</div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div className="marker-label">3+ Hours /Day</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Set Daily Limit Slider */}
          <div className="slider-section">
            <div className="slider-label">Set Daily Limit</div>
            <div className="slider-container">
              <div 
                className={`slider-track limit-track ${isDragging.limit ? 'dragging' : ''}`}
                ref={sliderRefs.limit}
                onMouseDown={(e) => handleMouseDown('limit', e)}
              >
                <div 
                  className="slider-fill limit-fill"
                  style={{ width: `${sliderValues.limit}%` }}
                ></div>
                <div 
                  className="slider-knob"
                  style={{ left: `${sliderValues.limit}%` }}
                >
                  <div className="slider-tooltip">{Math.round(sliderValues.limit)}</div>
                </div>
              </div>
              <div className="slider-markers">
                <div className="marker">
                  <div className="marker-line"></div>
                  <div className="marker-label">Eco</div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div className="marker-label">Balanced</div>
                </div>
                <div className="marker">
                  <div className="marker-line"></div>
                  <div className="marker-label">Power</div>
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