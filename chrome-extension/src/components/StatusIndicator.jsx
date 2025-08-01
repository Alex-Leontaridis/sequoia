import React from 'react';

const StatusIndicator = ({ isEnabled }) => {
  return (
    <div className={`status-indicator ${isEnabled ? 'enabled' : 'disabled'}`}>
      <div className="status-dot"></div>
      <span className="status-text">
        {isEnabled ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};

export default StatusIndicator; 