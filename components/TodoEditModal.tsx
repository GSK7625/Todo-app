import React, { useState, useEffect, useRef } from 'react';
import { Todo, Priority } from '../types';

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

  const modalRef = useRef<HTMLDivElement>(null);

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
    const numericDuration = durationValue ? parseInt(durationValue, 10) : 0;
    const totalDurationInMinutes = durationUnit === 'hours' 
      ? numericDuration * 60 
      : numericDuration;

    onSave({
      id: todo.id,
      text: text.trim(),
      dueDate: dueDate || null,
      priority,
      duration: totalDurationInMinutes > 0 ? totalDurationInMinutes : null
    });
  };

  const unitButtonClass = (unit: 'minutes' | 'hours') => {
    const base = 'px-3 py-2 border text-xs font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
    if (unit === durationUnit) {
      return `${base} bg-blue-600 text-white border-blue-600`;
    }
    return `${base} bg-white dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600`;
  }

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
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transition-transform transform duration-300 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 id="edit-todo-title" className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Task</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    <label htmlFor="edit-duration" className="block mb-1 font-medium text-slate-600 dark:text-slate-400">Duration</label>
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
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition duration-200"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default TodoEditModal;