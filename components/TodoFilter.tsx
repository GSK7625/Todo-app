import React from 'react';
import { Filter, SortOption } from '../types';

interface TodoFilterProps {
  currentFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const TodoFilter: React.FC<TodoFilterProps> = ({ currentFilter, onFilterChange, currentSort, onSortChange }) => {
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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-2 bg-slate-200 dark:bg-slate-800 rounded-lg mt-6">
      <div className="flex justify-center space-x-2" role="group" aria-label="Filter tasks">
        {filters.map(({ key, label }) => (
          <button key={key} onClick={() => onFilterChange(key)} className={getButtonClass(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort by:</label>
        <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-slate-800 dark:text-slate-200 text-sm"
        >
            <option value={SortOption.CREATED_DESC}>Newest First</option>
            <option value={SortOption.CREATED_ASC}>Oldest First</option>
            <option value={SortOption.DUE_DATE}>Due Date</option>
            <option value={SortOption.PRIORITY}>Priority</option>
        </select>
      </div>
    </div>
  );
};

export default TodoFilter;
