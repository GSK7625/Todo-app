
import React, { useState, useRef, useEffect } from 'react';
import { Todo, Priority } from '../types';
import { PencilIcon, TrashIcon, CheckIcon, PlayIcon, PauseIcon, StopIcon } from './icons';

interface ActiveTimer {
    todoId: number;
    timeLeft: number;
    isRunning: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
  activeTimer: ActiveTimer | null;
  onStartTimer: (id: number, duration: number) => void;
  onPauseTimer: () => void;
  onStopTimer: () => void;
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};


const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit, activeTimer, onStartTimer, onPauseTimer, onStopTimer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const isTimerActiveForThisTodo = activeTimer?.todoId === todo.id;
  const isAnyTimerActive = activeTimer !== null;

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

  const renderTimerControls = () => {
    if (isTimerActiveForThisTodo) {
        const totalDurationInSeconds = (todo.duration ?? 0) * 60;
        const progress = totalDurationInSeconds > 0 ? ((totalDurationInSeconds - activeTimer.timeLeft) / totalDurationInSeconds) * 100 : 0;
        return (
            <div className="flex items-center justify-between gap-4 w-full p-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
                <div className="flex items-center gap-3 flex-grow">
                    <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-cyan-400 to-blue-600 h-3 rounded-full transition-all duration-500 ease-linear" 
                            style={{ width: `${progress}%` }}>
                        </div>
                    </div>
                    <span className="text-base font-semibold font-mono text-slate-700 dark:text-slate-200 w-16 text-right">
                        {formatTime(activeTimer.timeLeft)}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={onPauseTimer} 
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label={activeTimer.isRunning ? 'Pause timer' : 'Resume timer'}
                    >
                        {activeTimer.isRunning ? <PauseIcon className="h-5 w-5"/> : <PlayIcon className="h-5 w-5"/>}
                    </button>
                     <button 
                        onClick={onStopTimer} 
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Stop timer"
                     >
                        <StopIcon className="h-5 w-5"/>
                    </button>
                </div>
            </div>
        )
    }

    if (todo.duration && !isEditing && !todo.completed) {
        return (
             <button
                onClick={() => onStartTimer(todo.id, todo.duration!)}
                disabled={isAnyTimerActive}
                className="p-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Start timer"
            >
                <PlayIcon className="h-5 w-5" />
            </button>
        )
    }

    return null;
  }

  return (
    <li
      className={`flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-lg transition-colors duration-200 ${
        todo.completed ? 'bg-slate-200 dark:bg-slate-800 opacity-70' : 'bg-white dark:bg-slate-700'
      } shadow-sm gap-2`}
    >
        <div className="flex items-center w-full">
          <button
            onClick={() => onToggle(todo.id)}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center mr-4 flex-shrink-0 ${
              todo.completed
                ? 'bg-green-500 border-green-500'
                : 'border-slate-300 dark:border-slate-500 hover:border-green-500'
            }`}
            aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
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
              className={`flex-grow text-left ${
                todo.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {todo.text}
            </span>
          )}
        </div>


      <div className="flex items-center ml-auto space-x-3 pl-4 sm:pl-0 w-full sm:w-auto justify-end">
        {isTimerActiveForThisTodo ? (
            renderTimerControls()
        ) : (
             <>
                {todo.duration && !isEditing && (
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">
                        {formatDuration(todo.duration)}
                    </span>
                )}
                 {todo.dueDate && !isEditing && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline">
                      {new Date(todo.dueDate + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                )}
                {todo.priority && !isEditing && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityClass(todo.priority)}`}>
                    {todo.priority}
                  </span>
                )}

                {renderTimerControls()}

                <button
                  onClick={handleEdit}
                  className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                  aria-label={isEditing ? 'Save changes' : 'Edit todo'}
                >
                  {isEditing ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                  aria-label="Delete todo"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
            </>
        )}
      </div>
    </li>
  );
};

export default TodoItem;
