import React, { useState } from 'react';
import { PlusIcon } from './icons';
import { Priority } from '../types';

interface TodoInputProps {
  onAddTodo: (data: { text: string; dueDate: string | null; priority: Priority }) => void;
}

const TodoInput: React.FC<TodoInputProps> = ({ onAddTodo }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo({ text: text.trim(), dueDate: dueDate || null, priority });
      setText('');
      setDueDate('');
      setPriority(Priority.MEDIUM);
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
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
            <label htmlFor="due-date" className="block mb-1 font-medium text-slate-600 dark:text-slate-400">Due Date & Time</label>
            <input
              id="due-date"
              type="datetime-local"
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
      </div>
    </form>
  );
};

export default TodoInput;