import React, { useState, useRef, useEffect } from 'react';
import { Todo, Priority } from '../types';
import { PencilIcon, TrashIcon, CheckIcon, PlayIcon, PauseIcon, StopIcon, ArrowPathIcon, HourglassIcon } from './icons';

interface ActiveTimer {
    todoId: number;
    remainingSeconds: number;
    isRunning: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
  isDeleting: boolean;
  activeTimer: ActiveTimer | null;
  onStartTimer: (id: number) => void;
  onPauseTimer: () => void;
}

const getPriorityClass = (priority?: Priority) => {
  switch (priority) {
    case Priority.HIGH:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case Priority.MEDIUM:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case Priority.LOW:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200';
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


const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit, isDeleting, activeTimer, onStartTimer, onPauseTimer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isTimerActiveForThisTodo = activeTimer?.todoId === todo.id;
  const isAnotherTimerRunning = !!(activeTimer?.isRunning && activeTimer?.todoId !== todo.id);
  
  const hasProgress = (todo.timeSpent || 0) > 0;
  const totalDurationInSeconds = (todo.duration ?? 0) * 60;

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
        setIsMounted(true);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(todo.id, editText.trim());
    }
    setIsEditing(!isEditing);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(todo.text);
    }
  };

  const renderTimerUI = () => {
    // Highest priority: if a timer is active for this item, show it.
    if (isTimerActiveForThisTodo) {
      const timeSpent = totalDurationInSeconds - activeTimer.remainingSeconds;
      const progress = totalDurationInSeconds > 0 ? (timeSpent / totalDurationInSeconds) * 100 : 0;
      return (
        <>
            <div className="flex items-center justify-between gap-4 flex-grow p-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    {totalDurationInSeconds > 0 && (
                        <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-cyan-400 to-blue-600 h-3 rounded-full transition-all duration-200 ease-linear" 
                                style={{ width: `${Math.min(progress, 100)}%` }}>
                            </div>
                        </div>
                    )}
                    <div className={`flex items-center gap-1.5 ${totalDurationInSeconds > 0 ? 'w-24 justify-end' : 'flex-grow'}`}>
                        <HourglassIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-base font-semibold font-mono text-slate-700 dark:text-slate-200">
                            {formatTime(activeTimer.remainingSeconds)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button 
                        onClick={onPauseTimer} 
                        disabled={isDeleting}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        aria-label={activeTimer.isRunning ? 'Pause timer' : 'Resume timer'}
                        title={activeTimer.isRunning ? 'Pause timer' : 'Resume timer'}
                    >
                        {activeTimer.isRunning ? <PauseIcon className="h-5 w-5"/> : <PlayIcon className="h-5 w-5"/>}
                    </button>
                </div>
            </div>
            <button
              onClick={handleEdit}
              disabled={isDeleting}
              className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              aria-label="Edit todo"
              title="Edit todo"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              disabled={isDeleting}
              className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              aria-label="Delete todo"
              title="Delete todo"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
        </>
      );
    }
    
    // If not actively timing THIS item, check if we are in editing mode.
    if (isEditing) {
      const remainingSeconds = totalDurationInSeconds - (todo.timeSpent ?? 0);
      return (
        <>
          {hasProgress && (
             <div className="flex items-center gap-1.5 flex-grow p-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg justify-end">
                <HourglassIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-base font-semibold font-mono text-slate-700 dark:text-slate-200">
                    {formatTime(remainingSeconds)}
                </span>
             </div>
          )}
          <button
            onClick={handleEdit}
            disabled={isDeleting}
            className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
            aria-label="Save changes"
            title="Save changes"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            disabled={isDeleting}
            className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
            aria-label="Delete todo"
            title="Delete todo"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </>
      );
    }

    // If not editing and not actively timing...
    
    // Show saved progress with interactive controls (resume/reset)
    if (hasProgress && !todo.completed) {
       const progress = totalDurationInSeconds > 0 ? (todo.timeSpent! / totalDurationInSeconds) * 100 : 0;
       const remainingSeconds = totalDurationInSeconds - todo.timeSpent!;
       return (
        <>
            <div className="flex items-center justify-between gap-4 flex-grow p-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                     {totalDurationInSeconds > 0 && (
                        <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-cyan-400 to-blue-600 h-3 rounded-full" 
                                style={{ width: `${Math.min(progress, 100)}%` }}>
                            </div>
                        </div>
                     )}
                    <div className={`flex items-center gap-1.5 ${totalDurationInSeconds > 0 ? 'w-24 justify-end' : 'flex-grow'}`}>
                        <HourglassIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-base font-semibold font-mono text-slate-700 dark:text-slate-200">
                            {formatTime(remainingSeconds)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button 
                        onClick={() => onStartTimer(todo.id)} 
                        disabled={isAnotherTimerRunning || !todo.duration || isDeleting}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={todo.duration ? "Resume timer" : "Set a duration to start timer"}
                        title={todo.duration ? "Resume timer" : "Set a duration to start timer"}
                    >
                        <PlayIcon className="h-5 w-5"/>
                    </button>
                </div>
            </div>
            <button
              onClick={handleEdit}
              disabled={isDeleting}
              className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              aria-label="Edit todo"
              title="Edit todo"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              disabled={isDeleting}
              className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              aria-label="Delete todo"
              title="Delete todo"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
        </>
      );
    }

    // Fallback: Not editing, no active timer, no saved progress, or completed.
    // This is the default view for a new or completed task.
    return (
        <>
            {todo.duration && (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">
                    Est: {formatDuration(todo.duration)}
                </span>
            )}
             {todo.dueDate && (
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline">
                  {new Date(todo.dueDate + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            )}
            {todo.priority && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityClass(todo.priority)}`}>
                {todo.priority}
              </span>
            )}

            {!todo.completed && (
                <button
                    onClick={() => onStartTimer(todo.id)}
                    disabled={isAnotherTimerRunning || !todo.duration || isDeleting}
                    className="p-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={todo.duration ? "Start timer" : "Set a duration to start timer"}
                    title={todo.duration ? "Start timer" : "Set a duration to start timer"}
                >
                    <PlayIcon className="h-5 w-5" />
                </button>
            )}

            <button
              onClick={handleEdit}
              disabled={isDeleting}
              className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              aria-label="Edit todo"
              title="Edit todo"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              disabled={isDeleting}
              className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              aria-label="Delete todo"
              title="Delete todo"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
        </>
    );
  }

  return (
    <li
      className={`flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-lg transition-all duration-300 ease-out shadow-sm gap-2 ${
        todo.completed ? 'bg-slate-200 dark:bg-slate-800 opacity-70' : 'bg-white dark:bg-slate-700'
      } ${isDeleting ? 'opacity-0 scale-95' : isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >
        <div className="flex items-center w-full">
          <button
            onClick={() => onToggle(todo.id)}
            disabled={isDeleting}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center mr-4 flex-shrink-0 disabled:opacity-50 ${
              todo.completed
                ? 'bg-green-500 border-green-500'
                : 'border-slate-300 dark:border-slate-500 hover:border-green-500'
            }`}
            aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {todo.completed && <CheckIcon className="h-4 w-4 text-white" />}
          </button>
          
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={handleKeyDown}
              className="flex-grow bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
            />
          ) : (
            <span
                className={`relative flex-grow text-left transition-colors duration-300 ease-in-out after:content-[''] after:absolute after:top-1/2 after:left-0 after:h-[1.5px] after:w-full after:origin-left after:bg-current after:transition-transform after:duration-300 after:ease-in-out ${
                    todo.completed
                    ? 'text-slate-500 dark:text-slate-400 after:scale-x-100'
                    : 'text-slate-800 dark:text-slate-200 after:scale-x-0'
                }`}
            >
              {todo.text}
            </span>
          )}
        </div>


      <div className="flex items-center ml-auto space-x-3 pl-4 sm:pl-0 w-full sm:w-auto justify-end">
        {renderTimerUI()}
      </div>
    </li>
  );
};

export default TodoItem;