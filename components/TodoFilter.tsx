import React from 'react';
import { Filter, SortOption } from '../types';
import { TrophyIcon } from './icons';

interface TodoFilterProps {
  currentFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onShowAchievements: () => void;
}

const TodoFilter: React.FC<TodoFilterProps> = ({ currentFilter, onFilterChange, currentSort, onSortChange, onShowAchievements }) => {
  const filters = [
    { key: Filter.ALL, label: 'All' },
    { key: Filter.ACTIVE, label: 'Active' },
    { key: Filter.COMPLETED, label: 'Completed' },
  ];

  const getButtonClass = (isActive: boolean) => {
    const baseClass = 'px-4 py-2 rounded-lg transition duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900';
    if (isActive) {
      return `${baseClass} bg-indigo-600 text-white`;
    }
    return `${baseClass} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700`;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 mt-6 border-t border-slate-200 dark:border-slate-800">
      <div className="flex w-full sm:w-auto justify-stretch sm:justify-start space-x-2" role="group" aria-label="Filter tasks">
        {filters.map(({ key, label }) => (
          <button key={key} onClick={() => onFilterChange(key)} className={`${getButtonClass(key === currentFilter)} flex-grow sm:flex-grow-0`}>
            {label}
          </button>
        ))}
        <button 
          onClick={onShowAchievements} 
          className="py-2 sm:px-4 px-3 rounded-lg transition duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
          title="View Achievements"
        >
          <TrophyIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Achievements</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort by:</label>
        <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 text-slate-800 dark:text-slate-200 text-sm"
        >
            <option value={SortOption.CREATED_DESC}>Newest First</option>
            <option value={SortOption.CREATED_ASC}>Oldest First</option>
            <option value={SortOption.DUE_DATE}>Due Date</option>
            <option value={SortOption.PRIORITY}>Priority</option>
            <option value={SortOption.DURATION_DESC}>Duration (Longest)</option>
            <option value={SortOption.DURATION_ASC}>Duration (Shortest)</option>
        </select>
      </div>
    </div>
  );
};

export default TodoFilter;