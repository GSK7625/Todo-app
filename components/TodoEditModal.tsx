import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Todo, Priority, Subtask } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface TodoEditModalProps {
  todo: Todo;
  onSave: (updatedTodo: Partial<Todo> & { id: number }) => void;
  onCancel: () => void;
}

const TodoEditModal: React.FC<TodoEditModalProps> = ({ todo, onSave, onCancel }) => {
  const [text, setText] = useState(todo.text);
  const [dueDate, setDueDate] = useState(todo.dueDate || '');
  const [priority, setPriority] = useState<Priority>(todo.priority || Priority.MEDIUM);
  
  const initialDuration = todo.duration || 0;
  const initialUnit = initialDuration >= 60 && initialDuration % 60 === 0 ? 'hours' : 'minutes';
  const initialDurationValue = initialUnit === 'hours' ? initialDuration / 60 : initialDuration;

  const [durationValue, setDurationValue] = useState(initialDurationValue ? String(initialDurationValue) : '');
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>(initialUnit);

  const [subtasks, setSubtasks] = useState<Subtask[]>(todo.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newSubtaskDuration, setNewSubtaskDuration] = useState('');


  const modalRef = useRef<HTMLDivElement>(null);
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
          subtaskDurationError = "Set a total task duration before adding timed subtasks.";
      } else if (newSubtaskDurationValue > remainingDuration) {
          subtaskDurationError = `Duration cannot exceed remaining ${remainingDuration} min.`;
      }
  }

  const canAddSubtask = newSubtaskText.trim() !== '' && !subtaskDurationError;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.querySelector('input')?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allocatedDuration > totalDurationInMinutes && totalDurationInMinutes > 0) {
        alert("The sum of subtask durations cannot exceed the total task duration.");
        return;
    }
    onSave({
      id: todo.id,
      text: text.trim(),
      dueDate: dueDate || null,
      priority,
      duration: totalDurationInMinutes > 0 ? totalDurationInMinutes : null,
      subtasks,
      timeSpent: subtasks.reduce((sum, s) => sum + (s.timeSpent || 0), 0),
    });
  };

  const handleAddSubtask = () => {
    if (!canAddSubtask) return;

    const durationInMinutes = newSubtaskDurationValue > 0 ? newSubtaskDurationValue : undefined;

    const newSubtask: Subtask = {
        id: Date.now(),
        text: newSubtaskText.trim(),
        completed: false,
        duration: durationInMinutes,
        timeSpent: 0,
    };
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskText('');
    setNewSubtaskDuration('');
    subtaskInputRef.current?.focus();
  };

  const handleDeleteSubtask = (subtaskId: number) => {
    setSubtasks(subtasks.filter(sub => sub.id !== subtaskId));
  }

  const unitButtonClass = (unit: 'minutes' | 'hours') => {
    const base = 'px-3 py-2 border text-xs font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
    if (unit === durationUnit) {
      return `${base} bg-blue-600 text-white border-blue-600`;
    }
    return `${base} bg-white dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600`;
  }

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSubtask();
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 animate-fade-in"
        onClick={onCancel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-todo-title"
    >
        <div 
            ref={modalRef}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transition-transform transform duration-300 animate-scale-up max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 id="edit-todo-title" className="text-2xl font-bold text-slate-900 dark:text-white p-6 pb-4 flex-shrink-0">Edit Task</h2>
            <form id="edit-form" onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 pt-2 overflow-y-auto">
                <div>
                    <label htmlFor="edit-text" className="block mb-1 font-medium text-slate-600 dark:text-slate-400">Task</label>
                    <input
                        id="edit-text"
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-slate-800 dark:text-slate-200"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <label htmlFor="edit-due-date" className="block mb-1 font-medium text-slate-600 dark:text-slate-400">Due Date</label>
                        <input
                            id="edit-due-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-priority" className="block mb-1 font-medium text-slate-600 dark:text-slate-400">Priority</label>
                        <select
                            id="edit-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                            className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-slate-800 dark:text-slate-200"
                        >
                            <option value={Priority.LOW}>Low</option>
                            <option value={Priority.MEDIUM}>Medium</option>
                            <option value={Priority.HIGH}>High</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="edit-duration" className="block mb-1 font-medium text-slate-600 dark:text-slate-400">Total Duration</label>
                    <div className="flex">
                        <input
                            id="edit-duration"
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
                    {allocatedDuration > totalDurationInMinutes && totalDurationInMinutes > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                            Total duration is less than the sum of subtask durations ({allocatedDuration} min).
                        </p>
                    )}
                </div>

                {/* Subtasks Section */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block font-medium text-slate-600 dark:text-slate-400">Subtasks</label>
                        {totalDurationInMinutes > 0 && (
                             <div className={`text-xs font-mono p-1 px-2 rounded-full ${remainingDuration < 0 ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                <span>{allocatedDuration} / {totalDurationInMinutes} min</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {subtasks.map(sub => (
                            <div key={sub.id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md">
                                <span className="flex-grow text-slate-800 dark:text-slate-200">{sub.text}</span>
                                {sub.duration && (
                                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded-full whitespace-nowrap">
                                        {sub.duration} min
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDeleteSubtask(sub.id)}
                                    className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                                    aria-label={`Delete subtask: ${sub.text}`}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                     <div className="flex gap-2 mt-3">
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
            <div className="grid grid-cols-2 sm:flex sm:justify-end gap-4 mt-auto p-6 pt-2 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition duration-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form="edit-form"
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition duration-200"
                >
                    Save Changes
                </button>
            </div>
        </div>
    </div>
  );
};

export default TodoEditModal;