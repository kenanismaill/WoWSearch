import React from 'react';
import styles from './VisualSeries.module.css';
import rawSeriesData from './series.json'; // Rename import
import { useHistory } from "react-router-dom";
import { FaUserCircle, FaCog } from 'react-icons/fa';

interface SeriesItem {
    id: number;
    title: string;
    image: string;
    description: string;
    unlocked: boolean;
    persons: { name: string; description: string }[];
}

// Type assertion for imported JSON data
const seriesData = rawSeriesData as SeriesItem[];

const VisualSeries: React.FC = () => {
    const history = useHistory();

    const handleSeriesClick = (series: SeriesItem) => {
        if (series.unlocked) {
            history.push(`/puzzle/${series.id}`);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <img
                        src="/assets/wordFinder/crown-medal.png"
                        alt="App Logo"
                        className={styles.headerLogoIcon}
                    />
                    <div className={styles.logo}>Visual Series</div>
                </div>
            </header>
            <div className={styles.grid}>
                {seriesData.map((series) => (
                    <div
                        key={series.id}
                        className={`${styles.card} ${!series.unlocked ? styles.locked : ''}`}
                        onClick={() => handleSeriesClick(series)}
                    >
                        <div className={styles.circleImageContainer}>
                            <img
                                src={series.image}
                                alt={series.title}
                                className={styles.circleImage}
                            />
                            {!series.unlocked && (
                                <div className={styles.lockOverlay}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="36" height="36">
                                        <path d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className={styles.title}>{series.title}</div>
                        <div className={styles.status}>{series.unlocked ? 'Available' : 'Locked'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VisualSeries;