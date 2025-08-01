import React from 'react';

const CompressionStats = ({ stats }) => {
  return (
    <div className="compression-stats">
      <h3>Compression Stats</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.totalCompressed}</div>
          <div className="stat-label">Messages Compressed</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.tokensSaved}</div>
          <div className="stat-label">Tokens Saved</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.compressionRate}%</div>
          <div className="stat-label">Compression Rate</div>
        </div>
      </div>
    </div>
  );
};

export default CompressionStats; 