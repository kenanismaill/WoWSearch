import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import wordsData from './wordsFinder-ar.json';
import './WordFinder.css';
import Lottie from "react-lottie-player";
import celebrationLottie from "../../../public/lotties/confetti-lottie.json";
import { bubbleSound, foundAudio, newCategorySound, popSound } from "../../utils/sounds";
import Header from "../Header";
import Footer from "./Footer";
import WatchAdPopup from "./WatchAdPopup";

type TriesState = {
    revealFirst: number;
    removeLetters: number;
    revealWord: number;
};

interface GridCell {
    letter: string;
    x: number;
    y: number;
    color?: string;
    animate?: string;
}

interface FoundWord {
    word: string;
    color: string;
}

interface CompletedPath {
    path: string;
    color: string;
}

interface FirstLetterCell {
    x: number;
    y: number;
    color: string;
}

const colors = [
    '#570505',
    '#03872d',
    '#6c058e',
    '#92059e',
    '#03066c',
    '#9f5102',
    '#770703'
];

const WordFinder: React.FC = () => {
    // State management
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(() => {
        const savedIndex = localStorage.getItem('wordFinderCategoryIndex');
        return savedIndex ? parseInt(savedIndex) : 0;
    });
    const [grid, setGrid] = useState<GridCell[][]>([]);
    const [selectedLetters, setSelectedLetters] = useState<GridCell[]>([]);
    const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
    const [completedPaths, setCompletedPaths] = useState<CompletedPath[]>([]);
    const [, setTransitioning] = useState(false);
    const [celebrateCategory, setCelebrateCategory] = useState(false);
    const [gridSize, setGridSize] = useState(4);
    const [maskedWords, setMaskedWords] = useState<string[]>([]);
    const [firstLetterCells, setFirstLetterCells] = useState<FirstLetterCell[]>([]);
    const [revealedWord, setRevealedWord] = useState<string | null>(null);
    const [showAdPopup, setShowAdPopup] = useState(false);
    const [currentAction, setCurrentAction] = useState<string | null>(null);

    const gridRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGSVGElement>(null);

    const currentCategory = wordsData.categories[currentCategoryIndex] || [];

    const [tries, setTries] = useState<TriesState>(() => {
        const savedTries = localStorage.getItem('wordFinderTries');
        return savedTries
            ? JSON.parse(savedTries)
            : { revealFirst: 2, removeLetters: 2, revealWord: 2 };
    });

    // Memoized values
    const colorMap = useMemo(() => {
        const map = new Map<string, string>();
        currentCategory.forEach((word, index) => {
            map.set(word, colors[index % colors.length]);
        });
        return map;
    }, [currentCategory]);

    // Persist state to localStorage
    useEffect(() => {
        localStorage.setItem('wordFinderTries', JSON.stringify(tries));
    }, [tries]);

    useEffect(() => {
        localStorage.setItem('wordFinderCategoryIndex', currentCategoryIndex.toString());
    }, [currentCategoryIndex]);

    // Calculate grid size based on current category
    useEffect(() => {
        const calculateGridSize = () => {
            if (currentCategory.length === 0) return 4;
            const totalLetters = currentCategory.reduce((sum, word) => sum + word.length, 0);
            const maxWordLength = Math.max(...currentCategory.map(word => word.length));
            let size = Math.ceil(Math.sqrt(totalLetters));
            size = Math.max(size, maxWordLength, 4);
            return Math.min(size, 10);
        };
        setGridSize(calculateGridSize());
    }, [currentCategoryIndex, currentCategory]);

    // Initialize grid when category or size changes
    useEffect(() => {
        if (currentCategory.length > 0) initializeGrid();
    }, [currentCategoryIndex, gridSize]);

    // Setup masked words based on category difficulty
    useEffect(() => {
        const getMaskingRules = () => {
            const index = currentCategoryIndex;
            if (index > 5 && index < 10) return { count: 1, showFirst: true };
            if (index >= 20 && index < 50) return { count: 1, showFirst: false };
            if (index >= 50 && index < 100) return { count: 2, showFirst: true };
            if (index >= 100 && index < 200) return { count: 2, showFirst: false };
            if (index >= 200 && index < 400) return { count: 3, showFirst: true };
            if (index >= 400 && index < 800) return { count: 3, showFirst: false };
            return { count: 0, showFirst: false };
        };

        const { count } = getMaskingRules();
        const wordsToMask = shuffleArray([...currentCategory]).slice(0, count);
        setMaskedWords(wordsToMask);
    }, [currentCategoryIndex, currentCategory]);

    // Helper functions
    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const getMaskedWordDisplay = (word: string) => {
        if (foundWords.some(w => w.word === word)) return word;

        const showFirst = (
            (currentCategoryIndex >= 1 && currentCategoryIndex <= 50) ||
            (currentCategoryIndex >= 51 && currentCategoryIndex <= 100)
        );

        if (maskedWords.includes(word)) {
            return showFirst
                ? `${word[0]}${'●'.repeat(word.length - 1)}`
                : '●'.repeat(word.length);
        }
        return word;
    };

    const initializeGrid = () => {
        const newGrid: GridCell[][] = Array.from({ length: gridSize }, (_, y) =>
            Array.from({ length: gridSize }, (__, x) => ({
                letter: '',
                x,
                y,
                color: undefined
            }))
        );

        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: -1 },
            { dx: 1, dy: -1 }, { dx: -1, dy: 1 }
        ];

        const tryPlaceCrossing = (word: string): boolean => {
            for (let attempt = 0; attempt < 200; attempt++) {
                const randomIndex = Math.floor(Math.random() * word.length);
                const targetLetter = word[randomIndex];
                const potentialCrossPoints: { x: number; y: number }[] = [];

                for (let y = 0; y < gridSize; y++) {
                    for (let x = 0; x < gridSize; x++) {
                        if (newGrid[y][x].letter === targetLetter) {
                            potentialCrossPoints.push({ x, y });
                        }
                    }
                }

                if (potentialCrossPoints.length === 0) break;

                const { x: crossX, y: crossY } = potentialCrossPoints[
                    Math.floor(Math.random() * potentialCrossPoints.length)
                    ];

                const crossDirections = shuffleArray([{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }]);

                for (const dir of crossDirections) {
                    const startX = crossX - dir.dx * randomIndex;
                    const startY = crossY - dir.dy * randomIndex;
                    let valid = true;
                    const cellsToFill: { x: number; y: number }[] = [];

                    for (let i = 0; i < word.length; i++) {
                        const x = startX + dir.dx * i;
                        const y = startY + dir.dy * i;

                        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
                            valid = false;
                            break;
                        }

                        const currentLetter = newGrid[y][x].letter;
                        if (currentLetter !== '' && currentLetter !== word[i]) {
                            valid = false;
                            break;
                        }

                        cellsToFill.push({ x, y });
                    }

                    if (valid) {
                        cellsToFill.forEach(({ x, y }, i) => {
                            newGrid[y][x].letter = word[i];
                        });
                        return true;
                    }
                }
            }
            return false;
        };

        const tryPlaceRandom = (word: string): boolean => {
            const shuffledDirections = shuffleArray([...directions]);

            for (const dir of shuffledDirections) {
                let maxX, maxY;

                if (dir.dx > 0) {
                    maxX = gridSize - word.length;
                } else if (dir.dx < 0) {
                    maxX = word.length - 1;
                } else {
                    maxX = gridSize - 1;
                }

                if (dir.dy > 0) {
                    maxY = gridSize - word.length;
                } else if (dir.dy < 0) {
                    maxY = word.length - 1;
                } else {
                    maxY = gridSize - 1;
                }

                if (maxX < 0 || maxY < 0) continue;

                for (let attempt = 0; attempt < 50; attempt++) {
                    const startX = Math.floor(Math.random() * (maxX + 1));
                    const startY = Math.floor(Math.random() * (maxY + 1));
                    let valid = true;
                    const lettersToPlace: { x: number; y: number }[] = [];

                    for (let i = 0; i < word.length; i++) {
                        const x = startX + dir.dx * i;
                        const y = startY + dir.dy * i;

                        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
                            valid = false;
                            break;
                        }

                        const currentLetter = newGrid[y][x].letter;
                        if (currentLetter !== '' && currentLetter !== word[i]) {
                            valid = false;
                            break;
                        }

                        lettersToPlace.push({ x, y });
                    }

                    if (valid) {
                        lettersToPlace.forEach(({ x, y }, i) => {
                            newGrid[y][x].letter = word[i];
                        });
                        return true;
                    }
                }
            }
            return false;
        };

        const tryPlaceForced = (word: string): boolean => {
            for (const dir of directions) {
                let maxX, maxY;

                if (dir.dx > 0) {
                    maxX = gridSize - word.length;
                } else if (dir.dx < 0) {
                    maxX = word.length - 1;
                } else {
                    maxX = gridSize - 1;
                }

                if (dir.dy > 0) {
                    maxY = gridSize - word.length;
                } else if (dir.dy < 0) {
                    maxY = word.length - 1;
                } else {
                    maxY = gridSize - 1;
                }

                if (maxX < 0 || maxY < 0) continue;

                for (let startX = 0; startX <= maxX; startX++) {
                    for (let startY = 0; startY <= maxY; startY++) {
                        let valid = true;

                        for (let i = 0; i < word.length; i++) {
                            const x = startX + dir.dx * i;
                            const y = startY + dir.dy * i;

                            if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
                                valid = false;
                                break;
                            }

                            const currentLetter = newGrid[y][x].letter;
                            if (currentLetter !== '' && currentLetter !== word[i]) {
                                valid = false;
                                break;
                            }
                        }

                        if (valid) {
                            for (let i = 0; i < word.length; i++) {
                                const x = startX + dir.dx * i;
                                const y = startY + dir.dy * i;
                                newGrid[y][x].letter = word[i];
                            }
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        const shuffledWords = shuffleArray([...currentCategory]);
        for (const word of shuffledWords) {
            if (!tryPlaceCrossing(word) && !tryPlaceRandom(word) && !tryPlaceForced(word)) {
                const newSize = Math.min(gridSize + 1, 10);
                if (newSize > gridSize) {
                    setGridSize(newSize);
                    return;
                }
            }
        }

        const arabicLetters = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';
        newGrid.forEach(row => row.forEach(cell => {
            if (!cell.letter) {
                cell.letter = arabicLetters[Math.floor(Math.random() * arabicLetters.length)];
            }
        }));

        setGrid(newGrid);
    };

    // Touch handlers
    const handleTouchStart = useCallback((e: React.TouchEvent, cell: GridCell) => {
        setSelectedLetters([cell]);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!gridRef.current || selectedLetters.length === 0 || grid.length === 0) return;

        const rect = gridRef.current.getBoundingClientRect();
        const cellSize = rect.width / gridSize;
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;

        const col = Math.min(gridSize - 1, Math.max(0, Math.floor((touchX + cellSize * 0.3) / cellSize)));
        const row = Math.min(gridSize - 1, Math.max(0, Math.floor((touchY + cellSize * 0.3) / cellSize)));

        const first = selectedLetters[0];
        const last = selectedLetters[selectedLetters.length - 1];

        if (col !== last.x || row !== last.y) {
            const dx = col - first.x;
            const dy = row - first.y;
            const length = Math.max(Math.abs(dx), Math.abs(dy));
            const stepX = dx / length;
            const stepY = dy / length;

            const isStraight = dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
            if (!isStraight) return;

            const pathCells: GridCell[] = [];
            for (let i = 0; i <= length; i++) {
                const x = Math.round(first.x + stepX * i);
                const y = Math.round(first.y + stepY * i);
                if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
                pathCells.push(grid[y][x]);
            }
            setSelectedLetters(pathCells);
            popSound();
        }
    }, [grid, gridSize, selectedLetters]);

    const handleTouchEnd = useCallback(() => {
        const word = selectedLetters.map(c => c.letter).join('');
        const path = generateSmoothPath();
        const color = colorMap.get(word);

        if (color && currentCategory.includes(word) && !foundWords.some(w => w.word === word)) {
            foundAudio();
            const newFoundWords = [...foundWords, { word, color }];
            setFoundWords(newFoundWords);
            setCompletedPaths(prev => [...prev, { path, color }]);

            setGrid(prev =>
                prev.map(row =>
                    row.map(cell => ({
                        ...cell,
                        color: selectedLetters.some(s => s.x === cell.x && s.y === cell.y) ? color : cell.color,
                        animate: selectedLetters.some(s => s.x === cell.x && s.y === cell.y) ? 'bounce' : ''
                    }))
                )
            );

            if (newFoundWords.length === currentCategory.length) {
                setTransitioning(true);
                setCelebrateCategory(true);
                setTimeout(() => {
                    newCategorySound();
                    setCurrentCategoryIndex(prev => prev < wordsData.categories.length - 1 ? prev + 1 : 0);
                    setFoundWords([]);
                    setCompletedPaths([]);
                    setTransitioning(false);
                    setFirstLetterCells([]);
                    setTimeout(() => setCelebrateCategory(false), 1500);
                }, 1000);
            }
        }
        setSelectedLetters([]);
    }, [colorMap, currentCategory, foundWords, selectedLetters]);

    // Grid helpers
    const calculatePosition = useCallback((cell: GridCell) => {
        if (!gridRef.current) return { x: 0, y: 0 };

        const rect = gridRef.current.getBoundingClientRect();
        const cellSize = rect.width / gridSize;
        return {
            x: cell.x * cellSize + cellSize / 2,
            y: cell.y * cellSize + cellSize / 2
        };
    }, [gridSize]);

    const generateSmoothPath = useCallback(() => {
        if (selectedLetters.length < 2) return '';

        const pts = selectedLetters.map(calculatePosition);
        let d = `M ${pts[0].x} ${pts[0].y}`;

        for (let i = 1; i < pts.length; i++) {
            const p = pts[i];
            const prev = pts[i - 1];
            const cp1x = prev.x + (prev.x - (pts[i - 2]?.x ?? prev.x)) * 0.2;
            const cp1y = prev.y + (prev.y - (pts[i - 2]?.y ?? prev.y)) * 0.2;
            const cp2x = prev.x + (p.x - prev.x) * 0.5;
            const cp2y = prev.y + (p.y - prev.y) * 0.5;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
        }

        return d;
    }, [selectedLetters, calculatePosition]);

    // Action handlers
    const displayFirstLettersInsideGrid = useCallback(() => {
        const wordStartMap = new Map<string, GridCell>();

        currentCategory.forEach(word => {
            const wordLength = word.length;
            grid.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell.letter === word[0]) {
                        const directions = [
                            { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 },
                            { dx: 0, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: -1 },
                            { dx: 1, dy: -1 }, { dx: -1, dy: 1 }
                        ];

                        directions.forEach(({ dx, dy }) => {
                            let match = true;
                            for (let i = 0; i < wordLength; i++) {
                                const checkX = x + dx * i;
                                const checkY = y + dy * i;
                                if (
                                    checkX >= gridSize ||
                                    checkY >= gridSize ||
                                    grid[checkY]?.[checkX]?.letter !== word[i]
                                ) {
                                    match = false;
                                    break;
                                }
                            }
                            if (match) {
                                wordStartMap.set(word, grid[y][x]);
                            }
                        });
                    }
                });
            });
        });

        const cells = Array.from(wordStartMap.values()).map(cell => ({
            x: cell.x,
            y: cell.y,
            color: colorMap.get(cell.letter) || '#ffffff'
        }));

        setFirstLetterCells(cells);
        bubbleSound();
    }, [colorMap, currentCategory, grid, gridSize]);

    const removeUnusedLetters = useCallback(() => {
        const usedLetters = new Set(currentCategory.flatMap(word => word.split('')));

        setGrid(prev => prev.map(row =>
            row.map(cell => ({
                ...cell,
                animate: usedLetters.has(cell.letter) ? '' : 'remove'
            }))
        ));

        setTimeout(() => {
            setGrid(prev => prev.map(row =>
                row.map(cell => ({
                    ...cell,
                    letter: usedLetters.has(cell.letter) ? cell.letter : '',
                    animate: ''
                }))
            ));
            bubbleSound();
        }, 1500);
    }, [currentCategory]);

    const displayOneWord = useCallback(() => {
        if (maskedWords.length === 0) return;

        const randomIndex = Math.floor(Math.random() * maskedWords.length);
        const wordToReveal = maskedWords[randomIndex];

        setRevealedWord(wordToReveal);
        setTimeout(() => {
            setMaskedWords(prev => prev.filter(word => word !== wordToReveal));
            setRevealedWord(null);
            newCategorySound();
        }, 800);
    }, [maskedWords]);

    // Ad handlers
    const handleWatchAdRequest = useCallback((action: string) => {
        setCurrentAction(action);
        setShowAdPopup(true);
    }, []);

    const handleConfirmAd = useCallback(() => {
        if (currentAction) {
            setTries(prev => {
                // Type guard to ensure currentAction is a valid key
                const validKeys: (keyof TriesState)[] = ['revealFirst', 'removeLetters', 'revealWord'];
                if (validKeys.includes(currentAction as keyof TriesState)) {
                    return {
                        ...prev,
                        [currentAction]: 2
                    };
                }
                return prev;
            });
        }
        setShowAdPopup(false);
    }, [currentAction]);

    return (
        <div className="word-finder-container">
            <Header
                level={currentCategoryIndex + 1}
                coins={60}
            />

            {celebrateCategory && (
                <div className="celebration-container">
                    <Lottie
                        animationData={celebrationLottie}
                        play
                        loop={false}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            )}

            <div className="word-finder-content">
                <div className="word-finder-words">
                    {currentCategory.map((word) => {
                        const isFound = foundWords.some(w => w.word === word);
                        const color = foundWords.find(w => w.word === word)?.color || 'rgba(0, 0, 0, 0.1)';
                        const txtColor = isFound ? '#ffffff' : '#2c3e50';
                        const displayWord = getMaskedWordDisplay(word);

                        return (
                            <div
                                key={word}
                                className={`word-finder-word ${isFound ? 'word-found' : ''}`}
                                style={{
                                    backgroundColor: isFound ? color : 'rgba(164, 164, 164, 0.1)',
                                    color: txtColor,
                                }}
                            >
                                <span className="word-text">{displayWord}</span>
                            </div>
                        );
                    })}
                </div>

                <div
                    className="selected-letters"
                    style={{
                        background: `linear-gradient(145deg, ${colorMap.get(selectedLetters.map(c => c.letter).join('')) || '#ff9a3d'}, ${colorMap.get(selectedLetters.map(c => c.letter).join('')) || '#ff6b6b'})`,
                        color: '#ffffff'
                    }}
                >
                    {selectedLetters.length > 0 ? (
                        selectedLetters.map((cell, i) => <span key={i}>{cell.letter}</span>)
                    ) : (
                        <span style={{ opacity: 0.7 }}>ابحث عن كلمة</span>
                    )}
                </div>

                <div
                    ref={gridRef}
                    className="word-finder-grid"
                    style={{ '--grid-size': gridSize } as React.CSSProperties}
                    onTouchStart={e => e.preventDefault()}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <svg ref={pathRef} className="word-finder-path">
                        {completedPaths.map(({ path, color }, i) => (
                            <path key={i} d={path} stroke={color} className="completed-path" />
                        ))}
                        <path
                            d={generateSmoothPath()}
                            stroke={colorMap.get(selectedLetters.map(c => c.letter).join('')) || 'rgba(179,179,179,0.31)'}
                            className="active-path"
                        />
                    </svg>

                    {grid.map((row, y) => (
                        <div key={y} className="word-finder-row">
                            {row.map((cell, x) => {
                                const isSelected = selectedLetters.some(s => s.x === x && s.y === y);
                                const firstLetterCell = firstLetterCells.find(fl => fl.x === x && fl.y === y);

                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        className={`word-finder-cell ${isSelected ? 'cell-selected' : ''}`}
                                        style={{
                                            color: cell.color ? '#ffffff' : '#2c3e50',
                                        }}
                                        onTouchStart={e => handleTouchStart(e, cell)}
                                    >
                                        {firstLetterCell && (
                                            <div
                                                className="first-letter-circle"
                                                style={{ backgroundColor: firstLetterCell.color }}
                                            />
                                        )}
                                        <span className={`cell-letter ${cell.animate ? `cell-letter-${cell.animate}` : ''}`}>
                      {cell.letter}
                    </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {showAdPopup && (
                    <WatchAdPopup
                        onClose={() => setShowAdPopup(false)}
                        onConfirm={handleConfirmAd}
                    />
                )}

                <Footer
                    revealFirst={{
                        count: tries.revealFirst,
                        onAction: () => {
                            displayFirstLettersInsideGrid();
                            setTries(prev => ({
                                ...prev,
                                revealFirst: Math.max(0, prev.revealFirst - 1)
                            }));
                        }
                    }}
                    removeLetters={{
                        count: tries.removeLetters,
                        onAction: () => {
                            removeUnusedLetters();
                            setTries(prev => ({
                                ...prev,
                                removeLetters: Math.max(0, prev.removeLetters - 1)
                            }));
                        }
                    }}
                    revealWord={{
                        count: tries.revealWord,
                        onAction: () => {
                            displayOneWord();
                            setTries(prev => ({
                                ...prev,
                                revealWord: Math.max(0, prev.revealWord - 1)
                            }));
                        }
                    }}
                    onWatchAdRequest={handleWatchAdRequest}
                />
            </div>

            {revealedWord && (
                <div className="word-reveal-animation">
                    {revealedWord.split('').map((letter, i) => (
                        <span
                            key={i}
                            className="word-reveal-letter"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
              {letter}
            </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WordFinder;