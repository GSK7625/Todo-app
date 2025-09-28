

import React from 'react';
import { Todo, SortOption } from '../types';
import TodoItem from './TodoItem';

interface ActiveTimer {
    todoId: number;
    subtaskId?: number;
    remainingSeconds: number;
    isRunning: boolean;
}

interface GroupedTodos {
  title: string;
  todos: Todo[];
  totalDuration: number;
}

interface TodoListProps {
  todos: Todo[] | GroupedTodos[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
  deletingTodoId: number | null;
  activeTimer: ActiveTimer | null;
  onStartTimer: (todoId: number, subtaskId?: number) => void;
  onPauseTimer: () => void;
  onToggleSubtask: (todoId: number, subtaskId: number) => void;
}

const formatTotalDuration = (minutes: number): string => {
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

const TodoList: React.FC<TodoListProps> = ({ 
    todos, 
    onToggle, 
    onDelete, 
    onEdit, 
    deletingTodoId,
    activeTimer,
    onStartTimer,
    onPauseTimer,
    onToggleSubtask,
}) => {
  const isGrouped = todos.length > 0 && 'title' in todos[0] && Array.isArray((todos[0] as GroupedTodos).todos);
  const totalTodos = isGrouped 
    ? (todos as GroupedTodos[]).reduce((sum, group) => sum + group.todos.length, 0) 
    : (todos as Todo[]).length;

  if (totalTodos === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <p className="text-slate-500 dark:text-slate-400">No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  if (isGrouped) {
    return (
      <div className="space-y-6">
        {(todos as GroupedTodos[]).map(group => (
          <section key={group.title} aria-labelledby={`group-header-${group.title.replace(/\s/g, '-')}`}>
            <h2 
              id={`group-header-${group.title.replace(/\s/g, '-')}`} 
              className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 mb-2 border-b-2 border-slate-200 dark:border-slate-700 flex justify-between items-center"
            >
              <span>{group.title}</span>
              <div className="flex items-center gap-2">
                {group.totalDuration > 0 && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    group.totalDuration > 1440 ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200 font-bold' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>
                    {formatTotalDuration(group.totalDuration)}
                  </span>
                )}
                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0.5">{group.todos.length}</span>
              </div>
            </h2>
            <ul className="space-y-3">
              {group.todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  isDeleting={deletingTodoId === todo.id}
                  activeTimer={activeTimer}
                  onStartTimer={onStartTimer}
                  onPauseTimer={onPauseTimer}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {(todos as Todo[]).map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          isDeleting={deletingTodoId === todo.id}
          activeTimer={activeTimer}
          onStartTimer={onStartTimer}
          onPauseTimer={onPauseTimer}
          onToggleSubtask={onToggleSubtask}
        />
      ))}
    </ul>
  );
};

export default TodoList;
