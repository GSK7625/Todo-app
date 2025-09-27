import React from 'react';
import { Todo } from '../types';
import TodoItem from './TodoItem';

interface ActiveTimer {
    todoId: number;
    remainingSeconds: number;
    isRunning: boolean;
}
interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
  deletingTodoId: number | null;
  activeTimer: ActiveTimer | null;
  onStartTimer: (id: number) => void;
  onPauseTimer: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ 
    todos, 
    onToggle, 
    onDelete, 
    onEdit, 
    deletingTodoId,
    activeTimer,
    onStartTimer,
    onPauseTimer,
}) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <p className="text-slate-500 dark:text-slate-400">No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {todos.map((todo) => (
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
        />
      ))}
    </ul>
  );
};

export default TodoList;