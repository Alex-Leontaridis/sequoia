import React from 'react';
import './Welcome2.css';

const Welcome2 = ({ onComplete }) => {
  const handleSoundsGood = () => {
    onComplete();
  };

  return (
    <div className="welcome2-screen">
      <div className="welcome2-container">
        {/* Header Section */}
        <div className="welcome2-header">
          <div className="sequoia-title">Sequoia</div>
          <div className="version">V.1.0</div>
          <div className="divider-line"></div>
        </div>
        
        {/* Content Section */}
        <div className="welcome2-content">
          <div className="welcome2-title">How Sequoia Works?</div>
          
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="feature-text">
                Automatically Tracks your AI usage (token input/output) in ChatGPT and Claude
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="feature-text">
                Estimates environmental impact
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="feature-text">
                Automatically compresses your input prompts while preserving their meaning and logic
              </div>
            </div>
          </div>
          
          <button className="welcome2-button" onClick={handleSoundsGood}>
            Sounds Good
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="arrow-icon">
              <path d="M6 12L10 8L6 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="welcome2-graphics">
          <img src="assets/Graphics.png" alt="Forest Landscape" />
        </div>
      </div>
    </div>
  );
};

export default Welcome2; 