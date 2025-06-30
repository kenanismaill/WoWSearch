// Footer.tsx
import React from 'react';

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
    const handleAction = (action: FooterAction, actionName: string) => {
        if (action.count > 0) {
            action.onAction();
        } else {
            onWatchAdRequest(actionName);
        }
    };

    return (
        <div className="word-finder-footer">
            <div className="word-finder-footer-icons-container">
                <div
                    className="word-finder-footer-item"
                    onClick={() => handleAction(revealFirst, 'revealFirst')}
                    title="Reveal first letters"
                >
                    <img
                        src="/assets/wordFinder/search.png"
                        className="word-finder-footer-icon"
                        alt="Reveal first letters"
                    />
                    <div className="tries-badge">
                        {revealFirst.count}
                    </div>
                </div>

                <div
                    className="word-finder-footer-item"
                    onClick={() => handleAction(removeLetters, 'removeLetters')}
                    title="Remove unused letters"
                >
                    <img
                        src="/assets/wordFinder/law.png"
                        className="word-finder-footer-icon"
                        alt="Remove unused letters"
                    />
                    <div className="tries-badge">
                        {removeLetters.count}
                    </div>
                </div>

                <div
                    className="word-finder-footer-item"
                    onClick={() => handleAction(revealWord, 'revealWord')}
                    title="Reveal a word"
                >
                    <img
                        src="/assets/wordFinder/lamp.png"
                        className="word-finder-footer-icon"
                        alt="Reveal a word"
                    />
                    <div className="tries-badge">
                        {revealWord.count}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;