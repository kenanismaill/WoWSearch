import React from 'react';

interface WatchAdPopupProps {
    onClose: () => void;
    onConfirm: () => void;
}

const WatchAdPopup: React.FC<WatchAdPopupProps> = ({ onClose, onConfirm }) => {
    return (
        <div className="ad-popup-overlay">
            <div className="ad-popup">
                <h3>Out of Attempts!</h3>
                <p>Watch a short ad to get more attempts?</p>
                <div className="ad-popup-buttons">
                    <button
                        className="ad-popup-button cancel"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="ad-popup-button confirm"
                        onClick={onConfirm}
                    >
                        Watch Ad
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WatchAdPopup;