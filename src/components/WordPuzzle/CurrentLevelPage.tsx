import React from 'react';
import './CurrentLevelPage.css';

const CurrentLevelPage: React.FC = () => {
    return (
        <div className="level-container">
            <img src="/assets/wordFinder/finder-level-bg.png" alt="background" className="background" />

            <div className="level-cloud">
                <img src="/assets/wordFinder/cloud-label.png" alt="cloud" className="cloud" />
                <span className="level-text">Level 2</span>
            </div>

            <div className="crown-section">
                <img src="/assets/wordFinder/crown-medal.png" alt="crown" className="crown" />
                <div className="level-number">1</div>
            </div>

            <div className="stars">
                <img src="/assets/wordFinder/star.png" alt="star" className="star" />
                <img src="/assets/wordFinder/star.png" alt="star" className="star" />
                <img src="/assets/wordFinder/star.png" alt="star" className="star" />
            </div>

            <button className="next-button">
                Next
            </button>
        </div>
    );
};

export default CurrentLevelPage;
