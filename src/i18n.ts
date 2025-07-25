import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
    en: {
        translation: {
            settings: "SETTINGS",
            music: "Music",
            soundEffects: "Sound Effects",
            language: "Language",
            confirm: "CONFIRM",
            level: "Level",
            english: "English",
            arabic: "Arabic",
            back: "Back",
            settingsButton: "Settings",
            findWordPrompt: "Find a word",
        }
    },
    ar: {
        translation: {
            settings: "الإعدادات",
            music: "الموسيقى",
            soundEffects: "المؤثرات الصوتية",
            language: "اللغة",
            confirm: "تأكيد",
            level: "مستوى",
            english: "الإنجليزية",
            arabic: "العربية",
            back: "رجوع",
            settingsButton: "الإعدادات",
            findWordPrompt: "ابحث عن كلمة",
        }
    }
};
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // default language; you may override at runtime
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;