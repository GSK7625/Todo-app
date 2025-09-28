
import React from 'react';
import { Todo } from '../types';
import { PlayIcon, PauseIcon } from './icons';

interface ActiveTimer {
    todoId: number;
    remainingSeconds: number;
    isRunning: boolean;
}

interface FocusModeViewProps {
  task: Todo;
  timer: ActiveTimer;
  onPauseTimer: () => void;
  onExit: () => void;
}

const formatTime = (seconds: number): string => {
    const totalSeconds = Math.max(0, seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};


const FocusModeView: React.FC<FocusModeViewProps> = ({ task, timer, onPauseTimer, onExit }) => {
    
    return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-8 z-40 animate-fade-in">
            <button
                onClick={onExit}
                className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition duration-200"
            >
                Exit
            </button>

            <div className="text-center">
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-4">Focusing on:</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-12 break-words">
                    {task.text}
                </h1>
                
                <div className="text-7xl sm:text-8xl md:text-9xl font-mono font-bold text-slate-900 dark:text-white mb-12 tracking-wider">
                    {formatTime(timer.remainingSeconds)}
                </div>

                <button 
                    onClick={onPauseTimer} 
                    className="w-24 h-24 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 transition-transform transform hover:scale-105"
                    aria-label={timer.isRunning ? 'Pause timer' : 'Resume timer'}
                    title={timer.isRunning ? 'Pause timer' : 'Resume timer'}
                >
                    {timer.isRunning ? <PauseIcon className="h-12 w-12"/> : <PlayIcon className="h-12 w-12"/>}
                </button>
            </div>
        </div>
    );
};

export default FocusModeView;