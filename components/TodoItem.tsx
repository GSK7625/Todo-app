import React, { useState, useEffect, useRef } from 'react';
import { Todo, Priority, Subtask } from '../types';
import { PencilIcon, TrashIcon, CheckIcon, PlayIcon, PauseIcon, HourglassIcon } from './icons';

interface ActiveTimer {
    todoId: number;
    subtaskId?: number;
    remainingSeconds: number;
    isRunning: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
  isDeleting: boolean;
  activeTimer: ActiveTimer | null;
  onStartTimer: (todoId: number, subtaskId?: number) => void;
  onPauseTimer: () => void;
  onToggleSubtask: (todoId: number, subtaskId: number) => void;
}

const getPriorityClass = (priority?: Priority) => {
  switch (priority) {
    case Priority.HIGH:
      return 'bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-400';
    case Priority.MEDIUM:
      return 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
    case Priority.LOW:
      return 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200';
  }
};

const getPriorityIndicatorClass = (priority?: Priority) => {
  switch (priority) {
    case Priority.HIGH:
      return 'bg-red-400';
    case Priority.MEDIUM:
      return 'bg-amber-400';
    case Priority.LOW:
      return 'bg-sky-400';
    default:
      return 'bg-slate-400';
  }
};


const formatDuration = (minutes?: number | null): string => {
  if (!minutes || minutes <= 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (mins > 0) {
    parts.push(`${mins}m`);
  }

  return parts.join(' ');
};

const formatTime = (seconds: number): string => {
    const totalSeconds = Math.max(0, seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

interface SubtaskItemProps {
    todoId: number;
    subtask: Subtask; 
    onToggle: () => void; 
    isParentCompleted: boolean;
    activeTimer: ActiveTimer | null;
    onStartTimer: (todoId: number, subtaskId?: number) => void;
    onPauseTimer: () => void;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({ 
    todoId,
    subtask, 
    onToggle, 
    isParentCompleted,
    activeTimer,
    onStartTimer,
    onPauseTimer,
}) => {
    const isTimerActiveForThisSubtask = activeTimer?.subtaskId === subtask.id;
    const isAnotherTimerRunning = !!(activeTimer?.isRunning && !isTimerActiveForThisSubtask);

    const totalDurationInSeconds = (subtask.duration || 0) * 60;
    const hasProgress = (subtask.timeSpent || 0) > 0;
    
    const prevCompleted = useRef(subtask.completed);
    const [isAnimatingComplete, setIsAnimatingComplete] = useState(false);

    useEffect(() => {
        if (subtask.completed && !prevCompleted.current) {
            setIsAnimatingComplete(true);
            const timer = setTimeout(() => setIsAnimatingComplete(false), 500); // Animation duration
            return () => clearTimeout(timer);
        }
        prevCompleted.current = subtask.completed;
    }, [subtask.completed]);

    const renderTimerControls = () => {
        if (!subtask.duration) return null;

        if (isTimerActiveForThisSubtask) {
            return (
                 <button 
                    onClick={onPauseTimer} 
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label={activeTimer.isRunning ? 'Pause timer' : 'Resume timer'}
                    title={activeTimer.isRunning ? 'Pause timer' : 'Resume timer'}
                >
                    {activeTimer.isRunning ? <PauseIcon className="h-4 w-4"/> : <PlayIcon className="h-4 w-4"/>}
                </button>
            )
        }
        
        return (
            <button 
                onClick={() => onStartTimer(todoId, subtask.id)} 
                disabled={isAnotherTimerRunning}
                className="p-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Start subtask timer"
                title="Start subtask timer"
            >
                <PlayIcon className="h-4 w-4"/>
            </button>
        )
    };

    const renderTimeInfo = () => {
        if (isTimerActiveForThisSubtask) {
            return (
                <span className="text-sm font-semibold font-mono text-slate-700 dark:text-slate-200">
                    {formatTime(activeTimer.remainingSeconds)}
                </span>
            )
        }
        if (hasProgress && !subtask.completed) {
            const remaining = totalDurationInSeconds - subtask.timeSpent!;
            return (
                <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                    {formatTime(remaining)}
                </span>
            )
        }
        if (subtask.duration) {
            return (
                 <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                    {formatDuration(subtask.duration)}
                </span>
            )
        }
        return null;
    }

    return (
        <div className="flex items-center gap-3">
        <button
            onClick={onToggle}
            className={`w-6 h-6 rounded border-2 transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
            subtask.completed
                ? 'bg-indigo-500 border-indigo-500'
                : `border-slate-400 dark:border-slate-500 ${isParentCompleted ? '' : 'hover:border-indigo-500'}`
            }`}
            aria-label={subtask.completed ? 'Mark subtask as incomplete' : 'Mark subtask as complete'}
            disabled={isParentCompleted}
        >
            {subtask.completed && <CheckIcon className={`h-4 w-4 text-white ${isAnimatingComplete ? 'animate-checkmark-flourish' : ''}`} />}
        </button>
        <span className={`flex-grow text-sm transition-colors ${
            subtask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'
        }`}>
            {subtask.text}
        </span>
        <div className="flex items-center gap-2">
            {renderTimeInfo()}
            {renderTimerControls()}
        </div>
        </div>
    );
};


const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit, isDeleting, activeTimer, onStartTimer, onPauseTimer, onToggleSubtask }) => {
  const [isMounted, setIsMounted] = useState(false);
  const prevCompleted = useRef(todo.completed);
  const [isAnimatingComplete, setIsAnimatingComplete] = useState(false);

  const isTimerActiveForThisTask = activeTimer?.todoId === todo.id && !activeTimer?.subtaskId;
  const isTimerActiveForASubtask = activeTimer?.todoId === todo.id && !!activeTimer?.subtaskId;
  const isAnotherTimerRunning = !!(activeTimer?.isRunning && activeTimer?.todoId !== todo.id);
  const isThisTaskTimerRunning = isTimerActiveForThisTask && !!activeTimer?.isRunning;
  
  const totalTimeSpentOnSubtasks = todo.subtasks?.reduce((sum, s) => sum + (s.timeSpent || 0), 0) ?? 0;
  const totalTimeSpent = todo.subtasks && todo.subtasks.length > 0 ? totalTimeSpentOnSubtasks : (todo.timeSpent || 0);

  const hasProgress = totalTimeSpent > 0;
  const totalDurationInSeconds = (todo.duration ?? 0) * 60;
  const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
  const hasSubtasksWithDurations = hasSubtasks && todo.subtasks!.some(s => s.duration);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
        setIsMounted(true);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    if (todo.completed && !prevCompleted.current) {
        setIsAnimatingComplete(true);
        const timer = setTimeout(() => setIsAnimatingComplete(false), 500);
        return () => clearTimeout(timer);
    }
    prevCompleted.current = todo.completed;
  }, [todo.completed]);

  const renderTimerOrMetadata = () => {
    const isTimerAssociatedWithThisTask = activeTimer?.todoId === todo.id;
    const shouldShowTimerUI = isTimerAssociatedWithThisTask || (hasProgress && !todo.completed);

    if (shouldShowTimerUI) {
        let currentTotalTimeSpent = 0;
        let totalRemainingSeconds = 0;

        if (isTimerActiveForASubtask) {
            const activeSubtask = todo.subtasks!.find(s => s.id === activeTimer!.subtaskId)!;
            const timeSpentOnActiveSubtask = ((activeSubtask.duration || 0) * 60) - activeTimer!.remainingSeconds;
            const timeSpentOnOtherSubtasks = todo.subtasks!.filter(s => s.id !== activeTimer!.subtaskId).reduce((sum, s) => sum + (s.timeSpent || 0), 0);
            currentTotalTimeSpent = timeSpentOnActiveSubtask + timeSpentOnOtherSubtasks;
            totalRemainingSeconds = totalDurationInSeconds - currentTotalTimeSpent;
        } else if (isTimerActiveForThisTask) {
            currentTotalTimeSpent = totalDurationInSeconds - activeTimer!.remainingSeconds;
            totalRemainingSeconds = activeTimer!.remainingSeconds;
        } else { // hasProgress but no active timer for this task
            currentTotalTimeSpent = totalTimeSpent;
            totalRemainingSeconds = totalDurationInSeconds - totalTimeSpent;
        }

        const progress = totalDurationInSeconds > 0 ? (currentTotalTimeSpent / totalDurationInSeconds) * 100 : 0;

        return (
            <div className="flex items-center justify-between gap-4 flex-grow">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    {totalDurationInSeconds > 0 ? (
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-8 relative flex items-center overflow-hidden" title={`Progress: ${Math.round(progress)}%`}>
                            <div 
                                className="bg-gradient-to-r from-violet-500 to-indigo-600 h-full absolute top-0 left-0 rounded-full transition-all duration-200 ease-linear" 
                                style={{ width: `${Math.min(progress, 100)}%` }} 
                            />
                            <div className="relative w-full flex justify-between items-center z-10 px-3">
                                <span className="font-semibold text-white/90 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.5)] truncate pr-2 flex-grow min-w-0">
                                    {isThisTaskTimerRunning ? (
                                        <span className="text-xs font-mono">{formatTime(currentTotalTimeSpent)} spent</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-sm capitalize">
                                            <span className={`w-2 h-2 rounded-full ${getPriorityIndicatorClass(todo.priority)}`}></span>
                                            <span>{todo.priority}</span>
                                        </span>
                                    )}
                                </span>
                                <span className="text-xs font-mono font-semibold text-white/90 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.5)] flex-shrink-0">
                                    {formatTime(totalRemainingSeconds)} left
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <HourglassIcon className="h-4 w-4" />
                            <span className="text-sm font-semibold font-mono">
                                {formatTime(currentTotalTimeSpent)} spent
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {!isTimerActiveForASubtask && (
                        <button 
                            onClick={isTimerActiveForThisTask ? onPauseTimer : () => onStartTimer(todo.id)}
                            disabled={isDeleting || (hasProgress && (hasSubtasksWithDurations || !todo.duration))}
                            className="p-3 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={isThisTaskTimerRunning ? 'Pause timer' : 'Resume timer'}
                            title={isThisTaskTimerRunning ? 'Pause timer' : 'Resume timer'}
                        >
                            {isThisTaskTimerRunning ? <PauseIcon className="h-5 w-5"/> : <PlayIcon className="h-5 w-5"/>}
                        </button>
                    )}
                </div>
            </div>
        );
    }
    
    // Idle state
    return (
        <>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs flex-grow">
                {todo.priority && (
                  <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${getPriorityClass(todo.priority)}`}>
                    {todo.priority}
                  </span>
                )}
                {todo.dueDate && (
                    <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(todo.dueDate + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                )}
                {todo.duration && (
                    <span className="font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                        Est: {formatDuration(todo.duration)}
                    </span>
                )}
            </div>
            {!todo.completed && (
                <button
                    onClick={() => onStartTimer(todo.id)}
                    disabled={isAnotherTimerRunning || !todo.duration || isDeleting || hasSubtasksWithDurations}
                    className="p-2 -mr-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={todo.duration ? (hasSubtasksWithDurations ? "Start subtask timers individually" : "Start timer") : "Set a duration to start timer"}
                    title={todo.duration ? (hasSubtasksWithDurations ? "Start subtask timers individually" : "Start timer") : "Set a duration to start timer"}
                >
                    <PlayIcon className="h-5 w-5" />
                </button>
            )}
        </>
    );
  }
  
  const subtaskProgress = hasSubtasks
    ? (todo.subtasks!.filter(s => s.completed).length / todo.subtasks!.length) * 100
    : 0;

  return (
    <li
      className={`flex flex-col p-3 rounded-xl transition-all duration-300 ease-out shadow-md shadow-slate-200/50 dark:shadow-black/20 gap-1 ${
        todo.completed ? 'bg-slate-100 dark:bg-slate-800/70 opacity-70' : 'bg-white/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60'
      } ${isDeleting ? 'opacity-0 scale-95' : isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >
      <div className="flex items-center">
        <div className="flex items-center flex-grow min-w-0">
          <div className="relative" title={hasSubtasks ? "Complete all subtasks to finish this task" : (todo.completed ? 'Mark as incomplete' : 'Mark as complete')}>
            <button
              onClick={() => onToggle(todo.id)}
              disabled={isDeleting || hasSubtasks}
              className={`w-7 h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center mr-4 flex-shrink-0 disabled:opacity-50 ${
                todo.completed
                  ? 'bg-indigo-500 border-indigo-500'
                  : `border-slate-300 dark:border-slate-600 ${!hasSubtasks && 'hover:border-indigo-500'}`
              } ${hasSubtasks ? 'cursor-not-allowed' : ''}`}
              aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {todo.completed && <CheckIcon className={`h-5 w-5 text-white ${isAnimatingComplete ? 'animate-checkmark-flourish' : ''}`} />}
            </button>
          </div>
          
          <span
              className={`relative flex-grow text-left transition-colors duration-300 ease-in-out truncate after:content-[''] after:absolute after:top-1/2 after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-current after:transition-transform after:duration-300 after:ease-in-out ${
                  todo.completed
                  ? 'text-slate-500 dark:text-slate-400 after:scale-x-100'
                  : 'text-slate-800 dark:text-slate-200 after:scale-x-0'
              }`}
          >
            {todo.text}
          </span>
        </div>


        <div className="flex items-center ml-auto space-x-1 pl-2 flex-shrink-0">
          <button
            onClick={() => onEdit(todo)}
            disabled={isDeleting}
            className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            aria-label="Edit todo"
            title="Edit todo"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            disabled={isDeleting}
            className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            aria-label="Delete todo"
            title="Delete todo"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="pl-11 flex items-center gap-2 min-h-[2rem]">
        {renderTimerOrMetadata()}
      </div>
      
      {hasSubtasks && (
        <div className="pl-10 pt-2 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-12 text-right">
                {todo.subtasks!.filter(s => s.completed).length}/{todo.subtasks!.length}
            </span>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${subtaskProgress}%` }}>
                </div>
            </div>
          </div>
          <div className="space-y-2">
            {todo.subtasks!.map(subtask => (
              <SubtaskItem 
                key={subtask.id} 
                todoId={todo.id}
                subtask={subtask}
                onToggle={() => onToggleSubtask(todo.id, subtask.id)}
                isParentCompleted={todo.completed}
                activeTimer={activeTimer}
                onStartTimer={onStartTimer}
                onPauseTimer={onPauseTimer}
              />
            ))}
          </div>
        </div>
      )}
    </li>
  );
};

export default TodoItem;