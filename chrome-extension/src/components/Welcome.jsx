import React from 'react';
import './Welcome.css';

const Welcome = ({ onComplete }) => {
  const handleGetStarted = () => {
    onComplete();
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        {/* Header Section */}
        <div className="welcome-header">
          <div className="sequoia-title">Sequoia</div>
          <div className="version">V.1.0</div>
          <div className="divider-line"></div>
        </div>
        
        {/* Content Section */}
        <div className="welcome-content">
          <div className="welcome-title">Welcome to Sequoia</div>
          <div className="welcome-description">
            You're about to make your AI usage greener. Sequoia helps you track how much ChatGPT and Claude you use, how many tokens you generate, and your estimated carbon & water footprint.
          </div>
          <button className="welcome-button" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
        
        <div className="welcome-graphics">
          <img src="assets/Graphics.png" alt="Forest Landscape" />
        </div>
      </div>
    </div>
  );
};

export default Welcome; 