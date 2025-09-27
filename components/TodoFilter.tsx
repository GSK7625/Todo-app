
import React from 'react';
import { Filter } from '../types';

interface TodoFilterProps {
  currentFilter: Filter;
  onFilterChange: (filter: Filter) => void;
}

const TodoFilter: React.FC<TodoFilterProps> = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { key: Filter.ALL, label: 'All' },
    { key: Filter.ACTIVE, label: 'Active' },
    { key: Filter.COMPLETED, label: 'Completed' },
  ];

  const getButtonClass = (filter: Filter) => {
    const baseClass = 'px-4 py-2 rounded-lg transition duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900';
    if (filter === currentFilter) {
      return `${baseClass} bg-blue-600 text-white`;
    }
    return `${baseClass} bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600`;
  };

  return (
    <div className="flex justify-center space-x-2 p-2 bg-slate-200 dark:bg-slate-800 rounded-lg mt-6">
      {filters.map(({ key, label }) => (
        <button key={key} onClick={() => onFilterChange(key)} className={getButtonClass(key)}>
          {label}
        </button>
      ))}
    </div>
  );
};

export default TodoFilter;
