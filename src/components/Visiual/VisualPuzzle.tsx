import React, {useState, useEffect, useRef} from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styles from './VisualPuzzle.module.css';
import quizData from './questions.json';
import seriesData from './series.json';
import confetti from 'canvas-confetti';

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

        if (correct) {
            // Fire confetti when the answer is correct
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#3a8dde', '#1aab8d', '#fff', '#f5f7fa'],
            });
        }

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
        <div className={styles.visualPuzzleBg}>
            <div className={styles.visualPuzzleCard}>
                {/* Header */}
                <header className={styles.vpHeader}>
                    <div className={styles.vpTitle}>{currentSeries.title}</div>
                    <div className={styles.vpProgressBarWrapper}>
                        <div className={styles.vpProgressBarBg}>
                            <div
                                className={styles.vpProgressBar}
                                style={{ width: `${((currentQuestionIndex + 1) / seriesQuestions.length) * 100}%` }}
                            />
                        </div>
                        <span className={styles.vpProgressText}>
                            {currentQuestionIndex + 1} / {seriesQuestions.length}
                        </span>
                    </div>
                    <button className={styles.vpHintFab} onClick={toggleHintModal} aria-label="Show hint">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="28" height="28">
                            <path d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                        </svg>
                    </button>
                </header>

                {/* Main Content */}
                <main className={styles.vpContent}>
                    {/* Image - centered */}
                    <div className={styles.vpImageSection}>
                        <div
                            className={styles.vpImageContainer}
                            onClick={() => openImageModal(currentQuestion.image)}
                        >
                            <img
                                src={currentQuestion.image}
                                alt="Question visual"
                                className={styles.vpImage}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/quiz/placeholder.png';
                                    (e.target as HTMLImageElement).alt = 'Image failed to load';
                                }}
                            />
                            <div className={styles.vpZoomIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" width="28" height="28">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                    <path d="M0 0h24v24H0z" fill="none"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className={styles.vpDivider} />

                    {/* Description */}
                    <div className={styles.vpQuestionSection}>
                        <p className={styles.vpDescription}>{currentQuestion.description}</p>
                    </div>

                    {/* Options - grid, professional look */}
                    <div className={styles.vpOptionsGrid}>
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOption === option;
                            return (
                                <button
                                    key={index}
                                    className={
                                        `${styles.vpOptionCard} ` +
                                        (isSelected ? styles.vpOptionCardSelected : '')
                                    }
                                    onClick={() => handleOptionSelect(option)}
                                    tabIndex={0}
                                    aria-pressed={isSelected}
                                    disabled={!!selectedOption}
                                >
                                    <span className={styles.vpOptionLetter}>{String.fromCharCode(65 + index)}</span>
                                    <span className={styles.vpOptionText}>{option}</span>
                                    {isSelected && (
                                        <span className={styles.vpOptionCheck}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1aab8d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 10 18 4 12" /></svg>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </main>

                {/* Image Modal */}
                {isModalOpen && (
                    <div className={styles.vpModalOverlay} onClick={closeImageModal}>
                        <div
                            className={styles.vpModalContent}
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
                            <button className={styles.vpCloseButton} onClick={closeImageModal} aria-label="Close image modal">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="28" height="28">
                                    <path d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                            <div className={styles.vpImageWrapper}
                                 style={{
                                     transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                     cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                                 }}>
                                <img
                                    ref={imageRef}
                                    src={currentImage}
                                    alt="Enlarged question visual"
                                    className={styles.vpModalImage}
                                    style={{ transformOrigin: 'top left' }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/quiz/placeholder.png';
                                        (e.target as HTMLImageElement).alt = 'Image failed to load';
                                    }}
                                />
                            </div>
                            <div className={styles.vpZoomControlPanel}>
                                <div className={styles.vpZoomButtonsContainer}>
                                    <button
                                        className={styles.vpZoomButton}
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
                                        className={styles.vpZoomButton}
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
                                <span className={styles.vpZoomScaleDisplay}>
                                    {Math.round(scale * 100)}%
                                </span>
                                <button
                                    className={styles.vpResetZoomButton}
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
                    <div className={styles.vpModalOverlay} onClick={toggleHintModal}>
                        <div className={styles.vpHintModal} onClick={(e) => e.stopPropagation()}>
                            <h3 className={styles.vpHintTitle}>Relevant Characters</h3>
                            <p className={styles.vpHintSubtitle}>People in this scenario</p>
                            <div className={styles.vpCharactersGrid}>
                                {currentQuestion.persons.map((person, index) => (
                                    <div key={index} className={styles.vpCharacterCard}>
                                        <div className={styles.vpCharacterName}>{person.name}</div>
                                        <div className={styles.vpCharacterDesc}>{person.description}</div>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.vpHintClose} onClick={toggleHintModal}>
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Answer Modal */}
                {showAnswerModal && (
                    <div className={styles.vpModalOverlay} onClick={() => setShowAnswerModal(false)}>
                        <div className={styles.vpAnswerModal} onClick={(e) => e.stopPropagation()}>
                            <div className={`${styles.vpAnswerStatus} ${answerStatus === 'correct' ? styles.vpCorrect : styles.vpIncorrect}`}>
                                {answerStatus === 'correct' ? (
                                    <div className={styles.vpResultIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#34a853" width="48" height="48">
                                            <path d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                        </svg>
                                    </div>
                                ) : (
                                    <div className={styles.vpResultIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ea4335" width="48" height="48">
                                            <path d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                        </svg>
                                    </div>
                                )}
                                <h3>{answerStatus === 'correct' ? 'Correct!' : 'Incorrect'}</h3>
                            </div>
                            <div className={styles.vpExplanation}>
                                <h4>Explanation:</h4>
                                <p>{currentExplanation}</p>
                            </div>
                            {answerStatus === 'incorrect' && !answerRevealed && (
                                <div className={styles.vpAdSection}>
                                    <div className={styles.vpAdPlaceholder}>
                                        <div className={styles.vpAdText}>Ad Space</div>
                                        {isWatchingAd ? (
                                            <div className={styles.vpAdLoading}>
                                                <div className={styles.vpSpinner}></div>
                                                <p>Watching ad...</p>
                                            </div>
                                        ) : (
                                            <button className={styles.vpWatchAdButton} onClick={watchAdToReveal}>
                                                Watch Ad to Reveal Answer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            {answerRevealed && (
                                <div className={styles.vpCorrectAnswer}>
                                    <h4>Correct Answer:</h4>
                                    <div className={styles.vpCorrectOption}>{currentQuestion.answer}</div>
                                </div>
                            )}
                            <button
                                className={`${styles.vpNextButton} ${answerStatus === 'incorrect' && !answerRevealed ? styles.vpNextButtonDisabled : ''}`}
                                onClick={handleNextQuestion}
                                disabled={answerStatus === 'incorrect' && !answerRevealed}
                            >
                                {currentQuestionIndex < seriesQuestions.length - 1 ? 'Next Question' : 'Finish Series'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualPuzzle;