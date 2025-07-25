import React, { useState } from 'react';
import './WatchAdPopup.css';

interface WatchAdPopupProps {
    coins: number;
    onUseCoins: () => void;
    onWatchAd: () => void;
    onClose: () => void;
}

const WatchAdPopup: React.FC<WatchAdPopupProps> = ({ coins, onUseCoins, onWatchAd, onClose }) => {
    const [isRewardedClicked, setIsRewardedClicked] = useState(false);

    const handleWatchAdClick = () => {
        setIsRewardedClicked(true);
        onWatchAd();
    };

    return (
        <div className="coin-popup">
            <div className="coin-popup-content">
                <div className="coin-popup-header">
                    {/*<p className="popup-text">*/}
                    {/*    اختر بين استخدام الرصيد الحالي أو مشاهدة فيديو*/}
                    {/*    لفتح تحدي جديد*/}
                    {/*</p>*/}
                </div>
                <div className="coin-animation">
                    <div className="coin-3d">
                        <img
                            src="/assets/wordFinder/coins.gif"
                            alt="Coin"
                            className="coin-image"
                        />
                    </div>
                </div>
                <div className="coin-popup-buttons">
                    <button
                        className="use-coins-button icon-button"
                        onClick={onUseCoins}
                        disabled={coins < 500}
                    >
                        <div className={'badge-use-coins'}>500</div>
                        <img
                            src="/assets/wordFinder/coin.png"
                            alt="Coins"
                            className="button-coin-icon"
                        />
                    </button>
                    <button
                        className="watch-ad-button icon-button"
                        onClick={handleWatchAdClick}
                        disabled={isRewardedClicked}
                    >
                        <div className={'badge-use-coins'}>مجاني</div>
                        <img
                            src="/assets/wordFinder/free-ad.png"
                            alt="Play"
                            className="button-play-icon"
                        />
                    </button>
                </div>
                <button className="close-button" onClick={onClose}>
                    إغلاق
                </button>
            </div>
        </div>
    );
};

export default WatchAdPopup;
