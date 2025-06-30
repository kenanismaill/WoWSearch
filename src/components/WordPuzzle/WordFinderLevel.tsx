import React, { useMemo } from 'react';
import './WordFinderLevel.css';
import { useHistory } from 'react-router-dom';
import Header from '../Header';

interface WordFinderLevelProps {
    currentLevel?: number;
}

const TOTAL_LEVELS = 500;

export const WordFinderLevel: React.FC<WordFinderLevelProps> = ({ currentLevel = 1 }) => {
    const history = useHistory();
    const levels = useMemo(() => Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1), []);
    const randomBgColor = useMemo(() => {
        const colors = ['rgb(248, 243, 225)', '#e6e5e5', '#f0ede7', '#f0e7e7'];
        return colors[Math.floor(Math.random() * colors.length)];
    }, []);
    const handleLevelSelect = () => {
        history.push('/word-finder');
    };
    return (
        <div className="finder-level-container" style={{ backgroundColor: randomBgColor }}>
            <Header />
            <img src="/assets/wordFinder/finder-level-bg.png" alt="" className="finder-level-background" />
            <div className="finder-level-grid">
                {levels.map((level) => (
                    <button
                        key={level}
                        className="finder-level-item"
                        disabled={level > currentLevel}
                        onClick={() => handleLevelSelect()}
                    >
                        {level <= currentLevel ? (
                            <img
                                src="/assets/wordFinder/finder-trophy-icon.png"
                                alt="Unlocked"
                                className="finder-level-icon"
                            />
                        ) : (
                            <img
                                src="/assets/wordFinder/finder-lock-icon.png"
                                alt="Locked"
                                className="finder-level-icon"
                            />
                        )}
                        <div className={`finder-level-badge ${level <= currentLevel ? 'unlocked' : ''}`}>
                            <span className="finder-level-number">{level}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WordFinderLevel;
