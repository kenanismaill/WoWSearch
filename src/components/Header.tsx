import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SettingsPopup from './WordPuzzle/SettingsPopup';

const DEFAULT_SETTINGS = {
    isMusicEnabled: true,
    isSoundEnabled: true,
    language: 'en'
};

interface HeaderProps {
    level?: number;
    coins?: number;
    settings?: {
        isMusicEnabled: boolean;
        isSoundEnabled: boolean;
        language: string;
    };
    onSettingsChange: (newSettings: {
        isMusicEnabled?: boolean;
        isSoundEnabled?: boolean;
        language?: string;
    }) => void;
}

const Header: React.FC<HeaderProps> = ({
                                           level: propLevel,
                                           coins: propCoins,
                                           settings: propSettings,
                                           onSettingsChange
                                       }) => {
    const history = useHistory();
    const { t, i18n } = useTranslation();
    const [showSettings, setShowSettings] = useState(false);
    const [level, setLevel] = useState(() => {
        const savedLevel = localStorage.getItem('wordFinderLevel');
        return propLevel ?? (savedLevel ? parseInt(savedLevel) : 1);
    });
    const [coins, setCoins] = useState(() => {
        const savedCoins = localStorage.getItem('wordFinderCoins');
        return propCoins ?? (savedCoins ? parseInt(savedCoins) : 50);
    });

    // Use default settings when propSettings is undefined
    const settings = propSettings ?? DEFAULT_SETTINGS;

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
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    const toggleMusic = () => {
        const newValue = !settings.isMusicEnabled;
        onSettingsChange({ isMusicEnabled: newValue });
    };

    const toggleSound = () => {
        const newValue = !settings.isSoundEnabled;
        onSettingsChange({ isSoundEnabled: newValue });
    };

    const handleLanguageChange = (language: string) => {
        onSettingsChange({ language });
        i18n.changeLanguage(language);
    };

    return (
        <>
            <div className={`word-finder-header ${settings.language === 'ar' ? 'rtl' : ''}`}>
                {/* Left Section */}
                <div className="word-finder-header-left">
                    <img
                        src="/assets/wordFinder/previous.png"
                        className="word-finder-header-icon"
                        alt={t('back')}
                        onClick={handleBackButton}
                    />
                    <img
                        src="/assets/wordFinder/setting.png"
                        className="word-finder-header-icon"
                        alt={t('settingsButton')}
                        onClick={toggleSettings}
                    />
                </div>

                {/* Center Section */}
                <div className="word-finder-header-center">
          <span className="word-finder-level-text">
            {t('level')} {level}
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

            {showSettings && (
                <SettingsPopup
                    onClose={toggleSettings}
                    currentLanguage={settings.language}
                    onLanguageChange={handleLanguageChange}
                    isMusicEnabled={settings.isMusicEnabled}
                    onMusicToggle={toggleMusic}
                    isSoundEnabled={settings.isSoundEnabled}
                    onSoundToggle={toggleSound}
                />
            )}
        </>
    );
};

export default Header;