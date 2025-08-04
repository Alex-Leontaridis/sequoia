import React, { useState, useEffect } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import Welcome from '../../components/Welcome';
import Welcome2 from '../../components/Welcome2';
import Welcome3 from '../../components/Welcome3';
import Main from '../../components/Main';
import Settings from '../../components/Settings';
import { isWelcomeCompleted, markWelcomeCompleted } from '../../utils/storage.js';
import './Popup.css';

const Popup = () => {
  const [currentPage, setCurrentPage] = useState('loading'); // 'loading', 'welcome', 'welcome2', 'welcome3', 'main', 'settings'

  useEffect(() => {
    const checkWelcomeStatus = async () => {
      try {
        const welcomeCompleted = await isWelcomeCompleted();
        
        if (welcomeCompleted) {
          // User has already seen welcome screens, go directly to main
          setCurrentPage('main');
        } else {
          // First time user, show welcome screens after loading
          const timer = setTimeout(() => {
            setCurrentPage('welcome');
          }, 3000);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('🔧 Sequoia: Error checking welcome status:', error);
        // Fallback to showing welcome screens
        const timer = setTimeout(() => {
          setCurrentPage('welcome');
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    };

    checkWelcomeStatus();
  }, []);

  const handleWelcomeComplete = () => {
    setCurrentPage('welcome2');
  };

  const handleWelcome2Complete = () => {
    setCurrentPage('welcome3');
  };

  const handleWelcome3Complete = async () => {
    try {
      // Mark welcome as completed
      await markWelcomeCompleted();
      setCurrentPage('main');
    } catch (error) {
      console.error('🔧 Sequoia: Error marking welcome as completed:', error);
      setCurrentPage('main');
    }
  };

  const handleSettingsClick = () => {
    setCurrentPage('settings');
  };

  const handleSettingsBack = () => {
    setCurrentPage('main');
  };

  return (
    <>
      {currentPage === 'loading' && <LoadingScreen />}
      {currentPage === 'welcome' && <Welcome onComplete={handleWelcomeComplete} />}
      {currentPage === 'welcome2' && <Welcome2 onComplete={handleWelcome2Complete} />}
      {currentPage === 'welcome3' && <Welcome3 onComplete={handleWelcome3Complete} />}
      {currentPage === 'main' && <Main onSettingsClick={handleSettingsClick} />}
      {currentPage === 'settings' && <Settings onBack={handleSettingsBack} />}
    </>
  );
};

export default Popup; 