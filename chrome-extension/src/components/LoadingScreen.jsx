import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Show logo after a brief delay
    const timer = setTimeout(() => {
      setShowLogo(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className={`sequoia-logo ${showLogo ? 'show' : ''}`}>
          <h1>Sequoia</h1>
        </div>
        
        <div className="graphics-container">
          <img src="assets/Graphics.png" alt="Sequoia Graphics" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 