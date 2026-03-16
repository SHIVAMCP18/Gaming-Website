const useAudio = () => {
    const playSound = (path, volume = 0.5) => {
        const audio = new Audio(path);
        audio.volume = volume;
        audio.play().catch(e => console.log("Audio play blocked", e));
    };

    const playClick = () => playSound("/audio/click.mp3", 0.3);
    const playHover = () => playSound("/audio/hover.mp3", 0.1);

    return { playClick, playHover };
};

export default useAudio;
