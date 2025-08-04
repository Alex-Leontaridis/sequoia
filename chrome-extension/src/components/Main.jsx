import React, { useState, useEffect } from 'react';
import './Main.css';
import { getSavings, formatSavings, initializeStorage } from '../utils/storage.js';

const Main = ({ onSettingsClick }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [savings, setSavings] = useState({ co2Saved: 0, waterSaved: 0 });
  const [formattedSavings, setFormattedSavings] = useState({ 
    co2Formatted: '0.0g', 
    waterFormatted: '0.0mL',
    co2Percentage: 0,
    waterPercentage: 0
  });

  useEffect(() => {
    // Initialize storage and load all data
    const loadData = async () => {
      try {
        await initializeStorage();
        
        // Load pause state and savings
        const [pauseResult, savingsData] = await Promise.all([
          new Promise((resolve) => {
            chrome.storage.local.get(['isPaused'], resolve);
          }),
          getSavings()
        ]);
        
        // Set pause state
        const pauseState = pauseResult.isPaused === true ? true : false;
        setIsPaused(pauseState);
        
        // If the storage doesn't have the key set, initialize it to false
        if (pauseResult.isPaused === undefined) {
          chrome.storage.local.set({ isPaused: false });
        }
        
        // Set savings data
        setSavings(savingsData);
        setFormattedSavings(formatSavings(savingsData.co2Saved, savingsData.waterSaved));
        
      } catch (error) {
        console.error('🔧 Sequoia: Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Listen for storage changes to update savings in real-time
  useEffect(() => {
    const handleStorageChange = (changes, area) => {
      if (area === 'local') {
        const co2Changed = changes.co2Saved;
        const waterChanged = changes.waterSaved;
        const pauseChanged = changes.isPaused;
        
        if (co2Changed || waterChanged) {
          const newCo2 = co2Changed ? co2Changed.newValue : savings.co2Saved;
          const newWater = waterChanged ? waterChanged.newValue : savings.waterSaved;
          
          setSavings({ co2Saved: newCo2, waterSaved: newWater });
          setFormattedSavings(formatSavings(newCo2, newWater));
        }
        
        if (pauseChanged) {
          setIsPaused(pauseChanged.newValue);
        }
      }
    };
    
    chrome.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [savings.co2Saved, savings.waterSaved]);

  // Check if current tab is supported
  const [isSupportedPage, setIsSupportedPage] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const isSupported = tabs[0].url.includes('chat.openai.com') || 
                           tabs[0].url.includes('claude.ai') ||
                           tabs[0].url.includes('chatgpt.com') ||
                           tabs[0].url.includes('grok.com') ||
                           tabs[0].url.includes('gemini.google.com') ||
                           tabs[0].url.includes('bard.google.com');
        setIsSupportedPage(isSupported);
      }
    });
  }, []);

  const handlePauseToggle = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    
    // Save to storage
    chrome.storage.local.set({ isPaused: newPausedState });
    
    // Send message to content script and refresh the page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('chat.openai.com') || tabs[0].url.includes('claude.ai') || tabs[0].url.includes('chatgpt.com') || tabs[0].url.includes('grok.com') || tabs[0].url.includes('gemini.google.com') || tabs[0].url.includes('bard.google.com'))) {
        // Send pause toggle message
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'PAUSE_TOGGLE', 
          isPaused: newPausedState 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Pause toggle message failed:', chrome.runtime.lastError.message);
          }
          
          // Refresh the page after a short delay to ensure state is saved
          setTimeout(() => {
            chrome.tabs.reload(tabs[0].id);
          }, 100);
        });
      }
    });
  };
  return (
    <div className="main-screen">
      <div className="main-container">
        {/* Header Section */}
        <div className="main-header">
          <div className="header-left">
            <div className="sequoia-title">Sequoia</div>
            <div className="header-icons">
              <div 
                className={`pause-icon ${isPaused ? 'paused' : ''} ${!isSupportedPage ? 'disabled' : ''}`} 
                onClick={isSupportedPage ? handlePauseToggle : undefined} 
                title={!isSupportedPage ? 'Navigate to a supported AI service (ChatGPT, Claude, Gemini, or Grok) to use compression' : 
                       (isPaused ? 'Resume compression (will refresh page)' : 'Pause compression (will refresh page)')}
              >
                {isPaused ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5V19L19 12L8 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 4H10V20H6V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 4H18V20H14V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="settings-icon" onClick={onSettingsClick}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.257 9.77251 19.9887C9.5799 19.7204 9.31074 19.5179 9 19.41C8.69838 19.2769 8.36381 19.2372 8.03941 19.296C7.71502 19.3548 7.41568 19.5095 7.18 19.74L7.12 19.8C6.93425 19.986 6.71368 20.1335 6.47088 20.2341C6.22808 20.3348 5.96783 20.3866 5.705 20.3866C5.44217 20.3866 5.18192 20.3348 4.93912 20.2341C4.69632 20.1335 4.47575 19.986 4.29 19.8C4.10405 19.6143 3.95653 19.3937 3.85588 19.1509C3.75523 18.9081 3.70343 18.6478 3.70343 18.385C3.70343 18.1222 3.75523 17.8619 3.85588 17.6191C3.95653 17.3763 4.10405 17.1557 4.29 16.97L4.35 16.91C4.58054 16.6743 4.73519 16.375 4.79399 16.0506C4.8528 15.7262 4.81312 15.3916 4.68 15.09C4.55324 14.7942 4.34276 14.542 4.07447 14.3643C3.80618 14.1866 3.49179 14.0913 3.17 14.09H3C2.46957 14.09 1.96086 13.8793 1.58579 13.5042C1.21071 13.1291 1 12.6204 1 12.09C1 11.5596 1.21071 11.0509 1.58579 10.6758C1.96086 10.3007 2.46957 10.09 3 10.09H3.09C3.42099 10.0823 3.743 9.97512 4.0113 9.78251C4.2796 9.5899 4.4821 9.32074 4.59 9.01C4.72312 8.70838 4.7628 8.37381 4.704 8.04941C4.6452 7.72502 4.49054 7.42568 4.26 7.19L4.2 7.13C4.01405 6.94425 3.86653 6.72368 3.76588 6.48088C3.66523 6.23808 3.61343 5.97783 3.61343 5.715C3.61343 5.45217 3.66523 5.19192 3.76588 4.94912C3.86653 4.70632 4.01405 4.48575 4.2 4.3C4.38575 4.11405 4.60632 3.96653 4.84912 3.86588C5.09192 3.76523 5.35217 3.71343 5.615 3.71343C5.87783 3.71343 6.13808 3.76523 6.38088 3.86588C6.62368 3.96653 6.84425 4.11405 7.03 4.3L7.09 4.36C7.32568 4.59054 7.62502 4.74519 7.94941 4.80399C8.27381 4.8628 8.60838 4.82312 8.91 4.69H9C9.29577 4.56324 9.54802 4.35276 9.72569 4.08447C9.90337 3.81618 9.99872 3.50179 10 3.18V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.7728 15.9606 4.714C16.285 4.6552 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.71343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="version">V.1.0</div>
          <div className="divider-line"></div>
        </div>
        
        {/* Content Section */}
        <div className="main-content">
          <div className="progress-container">
            <div className="progress-ring">
              <div className="progress-fill"></div>
              <div className="tree-center">
                <img src="assets/tree.png" alt="Tree" />
              </div>
            </div>
          </div>
          
          <div className="progress-text">
            <div className="progress-percentage">25% Towards Full Tree</div>
          </div>
          
          <div className="main-tagline">
            Grow Your Tree, Shrink Your Footprint
          </div>
          
          {/* Progress Cards */}
          <div className="progress-cards">
            <div className="progress-card">
              <div className="progress-icon co2-icon">
                <div className="icon-outline"></div>
                <div className="icon-dot"></div>
              </div>
              <div className="progress-info">
                <div className="progress-text-card">{formattedSavings.co2Formatted} CO2 Saved</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill-bar co2-fill" 
                    style={{ width: `${formattedSavings.co2Percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="progress-card">
              <div className="progress-icon water-icon">
                <div className="icon-outline"></div>
                <div className="icon-dot"></div>
              </div>
              <div className="progress-info">
                <div className="progress-text-card">{formattedSavings.waterFormatted} Water Saved</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill-bar water-fill"
                    style={{ width: `${formattedSavings.waterPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  );
};

export default Main; 