export const bubbleSound = () => {
    const clickAudio = new Audio('/assets/sounds/bubble.mp3');
    clickAudio.play();
};
export const popSound = () => {
    const popAudio = new Audio('/assets/sounds/ui-pop.mp3');
    popAudio.play();
};

export const newCategorySound = () => {
    const clickAudio = new Audio('/assets/sounds/new-cat.mp3');
    clickAudio.play();
};

export const foundAudio = () => {
    const foundAudio = new Audio('/assets/sounds/found.mp3');
    foundAudio.play();
}