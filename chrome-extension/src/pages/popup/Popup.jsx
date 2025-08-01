import React, { useState, useEffect } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import Welcome from '../../components/Welcome';
import Welcome2 from '../../components/Welcome2';
import Welcome3 from '../../components/Welcome3';
import Main from '../../components/Main';
import Settings from '../../components/Settings';
import './Popup.css';

const Popup = () => {
  const [currentPage, setCurrentPage] = useState('loading'); // 'loading', 'welcome', 'welcome2', 'welcome3', 'main', 'settings'

  useEffect(() => {
    // Show welcome page after 3 seconds
    const timer = setTimeout(() => {
      setCurrentPage('welcome');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleWelcomeComplete = () => {
    setCurrentPage('welcome2');
  };

  const handleWelcome2Complete = () => {
    setCurrentPage('welcome3');
  };

  const handleWelcome3Complete = () => {
    setCurrentPage('main');
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