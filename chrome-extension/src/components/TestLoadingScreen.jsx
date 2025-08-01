import React from 'react';
import SessionManager from '../utils/session';

const TestLoadingScreen = () => {
  const resetSession = async () => {
    try {
      await SessionManager.resetSession();
      alert('Session reset! Next time you open the popup, the loading screen will show.');
    } catch (error) {
      console.error('Error resetting session:', error);
      alert('Error resetting session');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Test Loading Screen</h3>
      <p>Click the button below to reset the session and show the loading screen on next popup open.</p>
      <button 
        onClick={resetSession}
        style={{
          background: '#78D8A4',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Reset Session
      </button>
    </div>
  );
};

export default TestLoadingScreen; 