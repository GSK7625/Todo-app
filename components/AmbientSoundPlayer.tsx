import React, { useState, useRef, useEffect } from 'react';
import { MusicalNoteIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './icons';

const AmbientSoundPlayer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [volume, setVolume] = useState(() => {
        try {
            const storedVolume = localStorage.getItem('ambientVolume');
            return storedVolume ? parseFloat(storedVolume) : 0.5;
        } catch {
            return 0.5;
        }
    });

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 300); // Delay appearance for a smoother page load
        return () => clearTimeout(timer);
    }, []);

    // Effect to control audio playback
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(error => {
                    console.error("Audio play failed:", error);
                    // Autoplay is often blocked, we can't force it.
                    setIsPlaying(false);
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Effect to control volume and save it
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        try {
            localStorage.setItem('ambientVolume', String(volume));
        } catch (error) {
            console.error("Failed to save volume to localStorage", error);
        }
    }, [volume]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Using a royalty-free lofi track from Chosic, which has permissive CORS headers. */}
            <audio ref={audioRef} src="https://www.chosic.com/wp-content/uploads/2021/07/purrple-cat-equinox.mp3" loop aria-hidden="true" />

            {/* Player controls pop-up */}
            <div 
                className={`
                    absolute bottom-full right-0 mb-4 p-4 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600
                    transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] origin-bottom-right
                    ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                `}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePlay}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        aria-label={isPlaying ? 'Pause music' : 'Play music'}
                        title={isPlaying ? 'Pause music' : 'Play music'}
                    >
                        {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <SpeakerXMarkIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            aria-label="Volume control"
                        />
                        <SpeakerWaveIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Floating Action Button to toggle the player controls */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex items-center justify-center
                ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                aria-label="Toggle ambient sound player"
                title="Toggle ambient sound player"
            >
                <MusicalNoteIcon className="h-7 w-7" />
            </button>
        </div>
    );
};

export default AmbientSoundPlayer;