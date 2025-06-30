import React, { useState } from 'react';
import Confetti from 'react-confetti';
import './DailyGiftPopup.css';

interface DailyGiftPopupProps {
    onClose?: () => void;
}

const DailyGiftPopup: React.FC<DailyGiftPopupProps> = ({ onClose }) => {
    const [selectedGift, setSelectedGift] = useState<{ key: string; value: string; reward: number } | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDoubled, setIsDoubled] = useState(false);
    const [currentReward, setCurrentReward] = useState(0);
    const [isBoxSelected, setIsBoxSelected] = useState(false);

    const gifts = [
        { key: '25', value: '+25', reward: 25 },
        { key: '50', value: '+50', reward: 50 },
        { key: '100', value: '+100', reward: 100 },
    ];

    const handleBoxClick = () => {
        if (!selectedGift) {
            const randomGift = gifts[Math.floor(Math.random() * gifts.length)];
            setSelectedGift(randomGift);
            setCurrentReward(randomGift.reward);
            setIsBoxSelected(true);
            setShowConfetti(true);
        }
    };

    const handleDoubleClick = () => {
        if (selectedGift && !isDoubled) {
            setCurrentReward(currentReward * 2);
            setIsDoubled(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }
    };
    const handleCollectClick = () => {
        if (onClose) onClose();
    };

    return (
        <div className="daily-gift-popup">
            <div className="sunburst-background"></div>
            <div className="daily-gift-popup-content">
                <div className="daily-gift-header">
                    <h2>DAILY REWARD</h2>
                    <p>PICK YOUR DAILY GIFT!</p>
                </div>

                {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

                {isBoxSelected && (
                    <div className="reward-center-display">
                        <img
                            src='/assets/wordFinder/coins-win.gif'
                            alt="Coin"
                            className="coin-image"
                        />
                        <span className="reward-amount">+{currentReward}</span>
                    </div>
                )}

                <div className="gift-box-container">
                    <div className="gift-box-row">
                        {/* Purple Gift Box */}
                        <div
                            className={`gift-box purple ${isBoxSelected ? 'disabled' : ''}`}
                            onClick={handleBoxClick}
                        >
                            <img
                                src='/assets/wordFinder/gift-box.png'
                                alt="Gift box"
                                className="gift-box-image"
                            />
                        </div>

                        {/* Green Gift Box */}
                        <div
                            className={`gift-box green ${isBoxSelected ? 'disabled' : ''}`}
                            onClick={handleBoxClick}
                        >
                            <img
                                src='/assets/wordFinder/gift-box.png'
                                alt="Gift box"
                                className="gift-box-image"
                            />
                        </div>
                    </div>

                    {/* Blue Gift Box */}
                    <div
                        className={`gift-box blue ${isBoxSelected ? 'disabled' : ''}`}
                        onClick={handleBoxClick}
                    >
                        <img
                            src='/assets/wordFinder/gift-box.png'
                            alt="Gift box"
                            className="gift-box-image"
                        />
                    </div>
                </div>

                {isBoxSelected && (
                    <div className="reward-buttons">
                        <button
                            className={`double-button ${isDoubled ? 'disabled' : ''}`}
                            onClick={handleDoubleClick}
                            disabled={isDoubled}
                        >
                            DOUBLE
                        </button>
                        <button
                            className="collect-button"
                            onClick={handleCollectClick}
                        >
                            COLLECT
                        </button>
                    </div>
                )}

                {!isBoxSelected && (
                    <div className="instruction-text">
                        <p>Tap a gift box to reveal your reward!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyGiftPopup;