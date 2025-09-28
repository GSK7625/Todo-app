import React, { useRef, useEffect } from 'react';

interface AmbientSoundPlayerProps {
    isPlaying: boolean;
    isMuted: boolean;
}

const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({ isPlaying, isMuted }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    
    // useRef to hold the preferred volume, so it persists across re-renders without causing them.
    // It's initialized once with a value from localStorage.
    const preferredVolume = useRef<number>((() => {
        try {
            const storedVolume = localStorage.getItem('ambientVolume');
            if (storedVolume) {
                const parsedVolume = parseFloat(storedVolume);
                // If stored volume is 0 (e.g. from a previous session where it was muted)
                // default to 0.5 to ensure sound plays when unmuted.
                return parsedVolume > 0 ? parsedVolume : 0.5;
            }
            return 0.5; // Default volume
        } catch {
            return 0.5; // Fallback default volume
        }
    })());

    // Effect to handle play/pause state changes
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        if (isPlaying) {
            // Ensure volume is set correctly before playing
            audioElement.volume = isMuted ? 0 : preferredVolume.current;
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Audio play failed:", error);
                });
            }
        } else {
            audioElement.pause();
        }
    }, [isPlaying]);

    // Effect to handle mute/unmute changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : preferredVolume.current;
        }
    }, [isMuted]);

    // This component only renders the audio tag; it's a controller, not a UI component.
    return (
        <audio
            ref={audioRef}
            src="https://www.chosic.com/wp-content/uploads/2021/07/purrple-cat-equinox.mp3"
            loop
            aria-hidden="true"
        />
    );
};

export default AmbientSoundPlayer;