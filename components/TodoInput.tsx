import React, { useState, useMemo, useRef } from 'react';
import { PlusIcon, TrashIcon } from './icons';
import { Priority } from '../types';

interface TodoInputProps {
  onAddTodo: (data: { 
    text: string; 
    dueDate: string | null; 
    priority: Priority; 
    duration: number | null;
    subtasks: Array<{ text: string; duration?: number }>;
  }) => void;
}

const TodoInput: React.FC<TodoInputProps> = ({ onAddTodo }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');

  const [subtasks, setSubtasks] = useState<{ text: string; duration?: number }[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newSubtaskDuration, setNewSubtaskDuration] = useState('');
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  const totalDurationInMinutes = useMemo(() => {
    if (!durationValue) return 0;
    const numericDuration = parseInt(durationValue, 10);
    if (isNaN(numericDuration) || numericDuration < 0) return 0;
    return durationUnit === 'hours' 
      ? numericDuration * 60 
      : numericDuration;
  }, [durationValue, durationUnit]);
  
  const allocatedDuration = useMemo(() => {
    return subtasks.reduce((sum, sub) => sum + (sub.duration || 0), 0);
  }, [subtasks]);

  const remainingDuration = totalDurationInMinutes - allocatedDuration;
  const newSubtaskDurationValue = newSubtaskDuration ? parseInt(newSubtaskDuration, 10) : 0;
  
  let subtaskDurationError: string | null = null;
  if (newSubtaskDurationValue > 0) {
      if (totalDurationInMinutes === 0) {
          subtaskDurationError = "Set a total task duration first.";
      } else if (newSubtaskDurationValue > remainingDuration) {
          subtaskDurationError = `Exceeds remaining ${remainingDuration} min.`;
      }
  }

  const canAddSubtask = newSubtaskText.trim() !== '' && !subtaskDurationError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      let finalDueDate = dueDate;
      if (!finalDueDate) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        finalDueDate = `${year}-${month}-${day}`;
      }
      
      if (allocatedDuration > totalDurationInMinutes && totalDurationInMinutes > 0) {
        alert("The sum of subtask durations cannot exceed the total task duration.");
        return;
      }

      onAddTodo({ 
        text: text.trim(), 
        dueDate: finalDueDate, 
        priority, 
        duration: totalDurationInMinutes > 0 ? totalDurationInMinutes : null,
        subtasks: subtasks
      });
      
      setText('');
      setDueDate('');
      setPriority(Priority.MEDIUM);
      setDurationValue('');
      setDurationUnit('minutes');
      setSubtasks([]);
      setNewSubtaskText('');
      setNewSubtaskDuration('');
    }
  };

  const unitButtonClass = (unit: 'minutes' | 'hours') => {
    const base = 'px-3 py-2 border text-xs font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
    if (unit === durationUnit) {
      return `${base} bg-blue-600 text-white border-blue-600`;
    }
    return `${base} bg-white dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600`;
  }

  const handleAddSubtask = () => {
    if (!canAddSubtask) return;
    const newSubtask = {
        text: newSubtaskText.trim(),
        duration: newSubtaskDurationValue > 0 ? newSubtaskDurationValue : undefined,
    };
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskText('');
    setNewSubtaskDuration('');
    subtaskInputRef.current?.focus();
  };
  
  const handleDeleteSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };
  
  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSubtask();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 transition duration-200 flex items-center justify-center"
          aria-label="Add new todo"
          title="Add new todo"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
            <label htmlFor="due-date" className="block mb-1 font-medium text-slate-600 dark:text-slate-400">Due Date</label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-slate-800 dark:text-slate-200"
            />
        </div>
        <div>
            <label htmlFor="priority" className="block mb-1 font-medium text-slate-600 dark:text-slate-400">Priority</label>
            <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-slate-800 dark:text-slate-200"
            >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
            </select>
        </div>
        <div>
            <label htmlFor="duration" className="block mb-1 font-medium text-slate-600 dark:text-slate-400">Duration</label>
            <div className="flex">
                <input
                  id="duration"
                  type="number"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  placeholder={durationUnit === 'hours' ? 'e.g., 2' : 'e.g., 30'}
                  min="0"
                  className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-slate-800 dark:text-slate-200 z-10"
                />
                <button type="button" onClick={() => setDurationUnit('minutes')} className={`${unitButtonClass('minutes')} -ml-px`}>min</button>
                <button type="button" onClick={() => setDurationUnit('hours')} className={`${unitButtonClass('hours')} rounded-r-lg`}>hr</button>
            </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <div className="flex justify-between items-center mb-2">
            <label className="block font-medium text-slate-600 dark:text-slate-400 text-sm">Subtasks</label>
            {totalDurationInMinutes > 0 && (
                <div className={`text-xs font-mono p-1 px-2 rounded-full ${remainingDuration < 0 ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
                    <span>{allocatedDuration} / {totalDurationInMinutes} min</span>
                </div>
            )}
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 mb-2">
            {subtasks.map((sub, index) => (
            <div key={index} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md animate-fade-in">
                <span className="flex-grow text-slate-800 dark:text-slate-200 text-sm">{sub.text}</span>
                {sub.duration && (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded-full whitespace-nowrap">
                    {sub.duration} min
                </span>
                )}
                <button
                type="button"
                onClick={() => handleDeleteSubtask(index)}
                className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                aria-label={`Delete subtask: ${sub.text}`}
                >
                <TrashIcon className="h-4 w-4" />
                </button>
            </div>
            ))}
        </div>
        <div className="flex gap-2">
            <input
                ref={subtaskInputRef}
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={handleSubtaskKeyDown}
                placeholder="Add a new subtask..."
                className="flex-grow p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm text-slate-800 dark:text-slate-200"
            />
            <input
                type="number"
                value={newSubtaskDuration}
                onChange={(e) => setNewSubtaskDuration(e.target.value)}
                onKeyDown={handleSubtaskKeyDown}
                placeholder="min"
                min="0"
                className="w-24 p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm text-slate-800 dark:text-slate-200"
                aria-label="Subtask duration in minutes"
            />
            <button
                type="button"
                onClick={handleAddSubtask}
                disabled={!canAddSubtask}
                className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 p-2 rounded-lg shadow-sm hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add subtask"
            >
                <PlusIcon className="h-5 w-5" />
            </button>
        </div>
        {subtaskDurationError && (
            <p className="text-xs text-red-500 mt-1">{subtaskDurationError}</p>
        )}
      </div>

    </form>
  );
};

export default TodoInput;