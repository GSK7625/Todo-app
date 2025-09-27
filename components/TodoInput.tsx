import React, { useState } from 'react';
import { PlusIcon } from './icons';
import { Priority } from '../types';

interface TodoInputProps {
  onAddTodo: (data: { text: string; dueDate: string | null; priority: Priority; duration: number | null }) => void;
}

const TodoInput: React.FC<TodoInputProps> = ({ onAddTodo }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');


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

      const numericDuration = durationValue ? parseInt(durationValue, 10) : 0;
      const totalDurationInMinutes = durationUnit === 'hours' 
        ? numericDuration * 60 
        : numericDuration;

      onAddTodo({ 
        text: text.trim(), 
        dueDate: finalDueDate, 
        priority, 
        duration: totalDurationInMinutes > 0 ? totalDurationInMinutes : null 
      });
      
      setText('');
      setDueDate('');
      setPriority(Priority.MEDIUM);
      setDurationValue('');
      setDurationUnit('minutes');
    }
  };

  const unitButtonClass = (unit: 'minutes' | 'hours') => {
    const base = 'px-3 py-2 border text-xs font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
    if (unit === durationUnit) {
      return `${base} bg-blue-600 text-white border-blue-600`;
    }
    return `${base} bg-white dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600`;
  }

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
    </form>
  );
};

export default TodoInput;