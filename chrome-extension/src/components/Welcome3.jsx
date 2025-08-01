import React from 'react';
import './Welcome3.css';

const Welcome3 = ({ onComplete }) => {
  const handleStartUsing = () => {
    onComplete();
  };

  return (
    <div className="welcome3-screen">
      <div className="welcome3-container">
        {/* Header Section */}
        <div className="welcome3-header">
          <div className="sequoia-title">Sequoia</div>
          <div className="version">V.1.0</div>
          <div className="divider-line"></div>
        </div>
        
        {/* Content Section */}
        <div className="welcome3-content">
          <div className="welcome3-title">Grow Your Tree</div>
          
          <div className="circular-graphic">
            <img src="assets/welcome_asset.png" alt="Tree with Progress" />
          </div>
          
          <div className="welcome3-description">
            Your new AI habits will grow this tree.
          </div>
          
          <button className="welcome3-button" onClick={handleStartUsing}>
            Start Using Sequoia
          </button>
        </div>
        
        <div className="welcome3-graphics">
          <img src="assets/Graphics.png" alt="Forest Landscape" />
        </div>
      </div>
    </div>
  );
};

export default Welcome3; 