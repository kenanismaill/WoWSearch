import React, {useState, useEffect, useRef} from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styles from './VisualPuzzle.module.css';
import quizData from './questions.json';
import seriesData from './series.json';

interface Person {
    name: string;
    description: string;
}

interface QuizQuestion {
    id: number;
    image: string;
    description: string;
    options: string[];
    answer: string;
    explanation: string;
    persons: Person[]; // Moved to individual questions
}

interface SeriesItem {
    id: number;
    title: string;
}

const VisualPuzzle: React.FC = () => {
    const { seriesId } = useParams<{ seriesId: string }>();
    const history = useHistory();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<string>('');
    const [showHintModal, setShowHintModal] = useState(false);
    const [showAnswerModal, setShowAnswerModal] = useState(false);
    const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
    const [currentExplanation, setCurrentExplanation] = useState<string>('');
    const [answerRevealed, setAnswerRevealed] = useState(false);
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    // Get current series
    const currentSeries = seriesData.find(series => series.id === parseInt(seriesId || '0'));

    // Filter questions for this series
    const seriesQuestions = quizData.filter(q => q.seriesId === parseInt(seriesId || '0')) as QuizQuestion[];

    const currentQuestion = seriesQuestions[currentQuestionIndex];

    useEffect(() => {
        resetQuestionState();
    }, [currentQuestionIndex]);

    const resetQuestionState = () => {
        setSelectedOption(null);
        setAnswerStatus(null);
        setAnswerRevealed(false);
    };

    const handleOptionSelect = (option: string) => {
        if (selectedOption) return;

        setSelectedOption(option);

        const correct = option === currentQuestion.answer;
        setAnswerStatus(correct ? 'correct' : 'incorrect');
        setCurrentExplanation(currentQuestion.explanation);

        setTimeout(() => {
            setShowAnswerModal(true);
        }, 300);
    };

    const handleNextQuestion = () => {
        setShowAnswerModal(false);

        if (currentQuestionIndex < seriesQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            alert('Series completed!');
            history.push('/series');
        }
    };

    const openImageModal = (imageUrl: string) => {
        setCurrentImage(imageUrl);
        setIsModalOpen(true);
        setScale(1); // Reset zoom
        setPosition({ x: 0, y: 0 }); // Reset position
        document.body.style.overflow = 'hidden';
    };
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newScale = scale + (e.deltaY > 0 ? -0.1 : 0.1);
        if (newScale >= 0.5 && newScale <= 3) {
            setScale(newScale);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (scale <= 1) return;
        setIsDragging(true);
        setDragStart({
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || scale <= 1) return;
        setPosition({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y
        });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || scale <= 1) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const closeImageModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = 'auto';
    };

    const toggleHintModal = () => {
        setShowHintModal(!showHintModal);
    };

    const watchAdToReveal = () => {
        setIsWatchingAd(true);

        setTimeout(() => {
            setIsWatchingAd(false);
            setAnswerRevealed(true);
        }, 2000);
    };

    if (!currentSeries || !currentQuestion) {
        return <div className={styles.loading}>Loading puzzle...</div>;
    }

    return (
        <div className={styles.puzzleContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.logo}>{currentSeries.title}</div>
                <div className={styles.headerActions}>
                    <div className={styles.progress}>
                        {currentQuestionIndex + 1} / {seriesQuestions.length}
                    </div>
                    <button className={styles.hintButton} onClick={toggleHintModal}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
                            <path d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.content}>
                {/* Image - clickable */}
                <div
                    className={styles.imageContainer}
                    onClick={() => openImageModal(currentQuestion.image)}
                >
                    <img
                        src={currentQuestion.image}
                        alt="Question visual"
                        className={styles.image}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/quiz/placeholder.png';
                            (e.target as HTMLImageElement).alt = 'Image failed to load';
                        }}
                    />
                    <div className={styles.zoomIndicator}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)" width="24" height="24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            <path d="M0 0h24v24H0z" fill="none"/>
                        </svg>
                    </div>
                </div>

                {/* Description */}
                <p className={styles.description}>{currentQuestion.description}</p>

                {/* Options */}
                <div className={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => (
                        <div
                            key={index}
                            className={`
                ${styles.option} 
                ${selectedOption === option ? styles.optionSelected : ''}
            `}
                            onClick={() => handleOptionSelect(option)}
                            tabIndex={0}
                            role="button"
                            aria-pressed={selectedOption === option}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') handleOptionSelect(option);
                            }}
                        >
                            <span className={styles.optionLabel}>{String.fromCharCode(65 + index)}</span>
                            {option}
                        </div>
                    ))}
                </div>
            </main>

            {/* Image Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={closeImageModal}>
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                        onWheel={handleWheel}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <button className={styles.closeButton} onClick={closeImageModal}>
                            {/* Close icon */}
                        </button>

                        {/* Image Preview */}
                        <div className={styles.imageWrapper}
                             style={{
                                 transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                 cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                             }}>
                            <img
                                ref={imageRef}
                                src={currentImage}
                                alt="Enlarged question visual"
                                className={styles.modalImage}
                                style={{ transformOrigin: 'top left' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/quiz/placeholder.png';
                                    (e.target as HTMLImageElement).alt = 'Image failed to load';
                                }}
                            />
                        </div>

                        {/* --- ZOOM CONTROLS: horizontal, below image --- */}
                        <div className={styles.zoomControlPanel}>
                            <div className={styles.zoomButtonsContainer}>
                                <button
                                    className={styles.zoomButton}
                                    onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
                                    aria-label="Zoom out"
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
                                        <path d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M19 13H5v-2h14v2z"/>
                                    </svg>
                                </button>
                                <button
                                    className={styles.zoomButton}
                                    onClick={() => setScale(prev => Math.min(prev + 0.2, 3))}
                                    aria-label="Zoom in"
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
                                        <path d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                    </svg>
                                </button>
                            </div>
                            <span className={styles.zoomScaleDisplay}>
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                className={styles.resetZoomButton}
                                onClick={resetZoom}
                                type="button"
                                disabled={scale === 1}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hint Modal */}
            {showHintModal && currentQuestion.persons && currentQuestion.persons.length > 0 && (
                <div className={styles.modalOverlay} onClick={toggleHintModal}>
                    <div className={styles.hintModal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.hintTitle}>Relevant Characters</h3>
                        <p className={styles.hintSubtitle}>People in this scenario</p>

                        <div className={styles.charactersGrid}>
                            {currentQuestion.persons.map((person, index) => (
                                <div key={index} className={styles.characterCard}>
                                    <div className={styles.characterName}>{person.name}</div>
                                    <div className={styles.characterDesc}>{person.description}</div>
                                </div>
                            ))}
                        </div>

                        <button className={styles.hintClose} onClick={toggleHintModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Answer Modal */}
            {showAnswerModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAnswerModal(false)}>
                    <div className={styles.answerModal} onClick={(e) => e.stopPropagation()}>
                        <div className={`${styles.answerStatus} ${answerStatus === 'correct' ? styles.correct : styles.incorrect}`}>
                            {answerStatus === 'correct' ? (
                                <div className={styles.resultIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#34a853" width="48" height="48">
                                        <path d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                </div>
                            ) : (
                                <div className={styles.resultIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ea4335" width="48" height="48">
                                        <path d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                </div>
                            )}
                            <h3>{answerStatus === 'correct' ? 'Correct!' : 'Incorrect'}</h3>
                        </div>

                        <div className={styles.explanation}>
                            <h4>Explanation:</h4>
                            <p>{currentExplanation}</p>
                        </div>

                        {answerStatus === 'incorrect' && !answerRevealed && (
                            <div className={styles.adSection}>
                                <div className={styles.adPlaceholder}>
                                    <div className={styles.adText}>Ad Space</div>
                                    {isWatchingAd ? (
                                        <div className={styles.adLoading}>
                                            <div className={styles.spinner}></div>
                                            <p>Watching ad...</p>
                                        </div>
                                    ) : (
                                        <button className={styles.watchAdButton} onClick={watchAdToReveal}>
                                            Watch Ad to Reveal Answer
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {answerRevealed && (
                            <div className={styles.correctAnswer}>
                                <h4>Correct Answer:</h4>
                                <div className={styles.correctOption}>{currentQuestion.answer}</div>
                            </div>
                        )}

                        <button
                            className={`${styles.nextButton} ${answerStatus === 'incorrect' && !answerRevealed ? styles.nextButtonDisabled : ''}`}
                            onClick={handleNextQuestion}
                            disabled={answerStatus === 'incorrect' && !answerRevealed}
                        >
                            {currentQuestionIndex < seriesQuestions.length - 1 ? 'Next Question' : 'Finish Series'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualPuzzle;