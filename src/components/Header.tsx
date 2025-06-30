import React, { useState, useEffect } from "react";
import {useHistory} from "react-router-dom";

interface HeaderProps {
    level?: number;
    coins?: number;
}

const Header: React.FC<HeaderProps> = ({ level: propLevel, coins: propCoins }) => {
    const history = useHistory();
    const [level, setLevel] = useState(() => {
        const savedLevel = localStorage.getItem('wordFinderLevel');
        return propLevel ?? (savedLevel ? parseInt(savedLevel) : 1);
    });

    const [coins, setCoins] = useState(() => {
        const savedCoins = localStorage.getItem('wordFinderCoins');
        return propCoins ?? (savedCoins ? parseInt(savedCoins) : 50);
    });

    // Sync props to state and localStorage
    useEffect(() => {
        if (typeof propLevel !== 'undefined') {
            setLevel(propLevel);
            localStorage.setItem('wordFinderLevel', propLevel.toString());
        }
    }, [propLevel]);

    useEffect(() => {
        if (typeof propCoins !== 'undefined') {
            setCoins(propCoins);
            localStorage.setItem('wordFinderCoins', propCoins.toString());
        }
    }, [propCoins]);

    const handleBackButton = () => {
        history.goBack();
    }

    return (
        <div className="word-finder-header">
            {/* Left Section */}
            <div className="word-finder-header-left">
                <img
                    src="/assets/wordFinder/previous.png"
                    className="word-finder-header-icon"
                    alt="Back"
                    onClick={handleBackButton}
                />
                <img
                    src="/assets/wordFinder/setting.png"
                    className="word-finder-header-icon"
                    alt="Settings"
                />
            </div>

            {/* Center Section */}
            <div className="word-finder-header-center">
        <span className="word-finder-level-text">
          مستوى {level}
        </span>
            </div>

            {/* Right Section */}
            <div className="word-finder-header-right">
                <div className="word-finder-coin-container">
                    <img
                        src="/assets/wordFinder/plus.png"
                        className="word-finder-coin-icon"
                        alt="Add Coins"
                    />
                    <span className="word-finder-coin-count">{coins}</span>
                    <img
                        src="/assets/wordFinder/coin.png"
                        className="word-finder-coin-icon"
                        alt="Coins"
                    />
                </div>
            </div>
        </div>
    );
}

export default Header;