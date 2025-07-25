// Footer.tsx
import React, {useState} from 'react';

interface FooterAction {
    count: number;
    onAction: () => void;
}

interface FooterProps {
    revealFirst: FooterAction;
    removeLetters: FooterAction;
    revealWord: FooterAction;
    onWatchAdRequest: (action: string) => void;
}

const Footer: React.FC<FooterProps> = ({
                                           revealFirst,
                                           removeLetters,
                                           revealWord,
                                           onWatchAdRequest
                                       }) => {
    const [clickedButton, setClickedButton] = useState<string | null>(null);

    const handleAction = (action: FooterAction, actionName: string) => {
        if (action.count > 0) {
            setClickedButton(actionName);
            setTimeout(() => setClickedButton(null), 300);
            action.onAction();
        } else {
            onWatchAdRequest(actionName);
        }
    };

    const getButtonClass = (count: number, actionName: string) => {
        let className = '';
        if (count > 0) className += 'has-tries ';
        if (clickedButton === actionName) className += 'button-click ';
        return className.trim();
    };

    return (
        <div className="word-finder-footer">
            <div className="word-finder-footer-icons-container">
                <div
                    className={`word-finder-footer-item ${getButtonClass(revealFirst.count, 'revealFirst')}`}
                    onClick={() => handleAction(revealFirst, 'revealFirst')}
                    title="Reveal first letters"
                >
                    <img
                        src="/assets/wordFinder/search.png"
                        className="word-finder-footer-icon"
                        alt="Reveal first letters"
                    />
                    {revealFirst.count > 0 && (
                        <div className="tries-badge">
                            {revealFirst.count}
                        </div>
                    )}
                </div>

                <div
                    className={`word-finder-footer-item ${getButtonClass(removeLetters.count, 'removeLetters')}`}
                    onClick={() => handleAction(removeLetters, 'removeLetters')}
                    title="Remove unused letters"
                >
                    <img
                        src="/assets/wordFinder/law.png"
                        className="word-finder-footer-icon"
                        alt="Remove unused letters"
                    />
                    {removeLetters.count > 0 && (
                        <div className="tries-badge">
                            {removeLetters.count}
                        </div>
                    )}
                </div>

                <div
                    className={`word-finder-footer-item ${getButtonClass(revealWord.count, 'revealWord')}`}
                    onClick={() => handleAction(revealWord, 'revealWord')}
                    title="Reveal a word"
                >
                    <img
                        src="/assets/wordFinder/lamp.png"
                        className="word-finder-footer-icon"
                        alt="Reveal a word"
                    />
                    {revealWord.count > 0 && (
                        <div className="tries-badge">
                            {revealWord.count}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Footer;