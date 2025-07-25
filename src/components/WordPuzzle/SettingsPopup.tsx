import React from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsPopup.css';

interface SettingsPopupProps {
    onClose: () => void;
    currentLanguage: string;
    onLanguageChange: (language: string) => void;
    isMusicEnabled: boolean;
    onMusicToggle: () => void;
    isSoundEnabled: boolean;
    onSoundToggle: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({
                                                         onClose,
                                                         currentLanguage,
                                                         onLanguageChange,
                                                         isMusicEnabled,
                                                         onMusicToggle,
                                                         isSoundEnabled,
                                                         onSoundToggle,
                                                     }) => {
    const { t } = useTranslation();

    return (
        <div className={`settings-popup-overlay ${currentLanguage === 'ar' ? 'rtl' : ''}`}>
            <div className="sunburst-background"></div>

            <div className="settings-popup-container">
                <div className="settings-popup-content">
                    <div className="settings-popup-header">
                        <h2 className="settings-title">{t('settings')}</h2>
                        <button className="settings-close-btn" onClick={onClose}>
                            <img src="/assets/wordFinder/close-icon.png" alt={t('back')} />
                        </button>
                    </div>

                    <div className="settings-options">
                        <div className="settings-option">
                            <div className="option-label">
                                <img src="/assets/wordFinder/music-icon.png" alt={t('music')} />
                                <span>{t('music')}</span>
                            </div>
                            <label className="settings-switch">
                                <input
                                    type="checkbox"
                                    checked={isMusicEnabled}
                                    onChange={onMusicToggle}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="settings-option">
                            <div className="option-label">
                                <img src="/assets/wordFinder/sound-icon.png" alt={t('soundEffects')} />
                                <span>{t('soundEffects')}</span>
                            </div>
                            <label className="settings-switch">
                                <input
                                    type="checkbox"
                                    checked={isSoundEnabled}
                                    onChange={onSoundToggle}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="settings-option">
                            <div className="option-label">
                                <img src="/assets/wordFinder/language-icon.png" alt={t('language')} />
                                <span>{t('language')}</span>
                            </div>
                            <div className="language-selector">
                                <select
                                    value={currentLanguage}
                                    onChange={(e) => onLanguageChange(e.target.value)}
                                    className="language-dropdown"
                                >
                                    <option value="en">{t('english')}</option>
                                    <option value="ar">{t('arabic')}</option>
                                </select>
                                <div className="dropdown-arrow"></div>
                            </div>
                        </div>
                    </div>

                    <div className="settings-footer">
                        <button className="settings-confirm-btn" onClick={onClose}>
                            {t('confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPopup;