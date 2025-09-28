import React, { useMemo, useRef } from 'react';
import { Todo } from '../types';

interface AchievementsModalProps {
  todos: Todo[];
  onClose: () => void;
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

const getColorClass = (value: number, max: number): string => {
  if (value === 0) return 'bg-slate-200 dark:bg-slate-700/60';
  const percentage = value / max;
  if (percentage > 0.75) return 'bg-indigo-700';
  if (percentage > 0.5) return 'bg-indigo-600';
  if (percentage > 0.25) return 'bg-indigo-500';
  return 'bg-indigo-400';
};

const AchievementsModal: React.FC<AchievementsModalProps> = ({ todos, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const currentYear = new Date().getFullYear();

    const yearlyData = useMemo(() => {
        const data = new Map<string, number>();
        let totalSeconds = 0;
        let maxSeconds = 0;

        todos.forEach(todo => {
            if (todo.completed && todo.completedAt && (todo.timeSpent || 0) > 0) {
                const completedDate = new Date(todo.completedAt);
                if (completedDate.getFullYear() === currentYear) {
                    const dateString = completedDate.toISOString().split('T')[0];
                    const currentSeconds = data.get(dateString) || 0;
                    const newTotal = currentSeconds + (todo.timeSpent || 0);
                    data.set(dateString, newTotal);
                    if (newTotal > maxSeconds) {
                        maxSeconds = newTotal;
                    }
                    totalSeconds += (todo.timeSpent || 0);
                }
            }
        });
        return { data, totalSeconds, maxSeconds };
    }, [todos, currentYear]);

    const calendarGrid = useMemo(() => {
        const yearStartDate = new Date(currentYear, 0, 1);
        const yearEndDate = new Date(currentYear, 11, 31);
        
        let dayCells = [];
        let monthLabels = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let lastMonth = -1;

        // Add padding for the first day of the year
        const startDayOfWeek = (yearStartDate.getDay() + 6) % 7; // Monday is 0
        for (let i = 0; i < startDayOfWeek; i++) {
            dayCells.push(<div key={`pad-${i}`} className="w-3 h-3 sm:w-4 sm:h-4"></div>);
        }

        for (let d = new Date(yearStartDate); d <= yearEndDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            const seconds = yearlyData.data.get(dateString) || 0;
            const colorClass = getColorClass(seconds, yearlyData.maxSeconds);
            const tooltip = `${dateString}: ${seconds > 0 ? formatTime(seconds) : 'No time logged'}`;

            dayCells.push(
                <div key={dateString} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${colorClass}`} title={tooltip}></div>
            );
            
            const currentMonth = d.getMonth();
            if (currentMonth !== lastMonth) {
                monthLabels.push(
                    <div key={monthNames[currentMonth]} className="text-xs text-slate-500 dark:text-slate-400" style={{gridColumn: 'span 4'}}>
                        {monthNames[currentMonth]}
                    </div>
                );
                lastMonth = currentMonth;
            }
        }
        return { dayCells, monthLabels };

    }, [currentYear, yearlyData]);


    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievements-title"
        >
            <div 
                ref={modalRef}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transition-transform transform duration-300 animate-scale-up max-h-[90vh] flex flex-col p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="achievements-title" className="text-xl font-bold text-slate-900 dark:text-white">Achievements: {currentYear}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition duration-200 text-sm"
                    >
                        Close
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Total time focused this year: <span className="font-bold text-slate-800 dark:text-slate-200">{formatTime(yearlyData.totalSeconds)}</span>
                    </p>
                    <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-4 pt-5 text-xs text-slate-500 dark:text-slate-400 hidden sm:flex">
                           <span>Mon</span>
                           <span className="mt-0.5">Wed</span>
                           <span className="mt-0.5">Fri</span>
                        </div>
                        <div className="overflow-x-auto w-full pb-2">
                            <div className="grid grid-rows-7 grid-flow-col gap-1">
                                {calendarGrid.dayCells}
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end items-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>Less</span>
                        <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700/60"></div>
                        <div className="w-3 h-3 rounded-sm bg-indigo-400"></div>
                        <div className="w-3 h-3 rounded-sm bg-indigo-500"></div>
                        <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-sm bg-indigo-700"></div>
                        <span>More</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AchievementsModal;