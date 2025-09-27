
import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types';
import { PencilIcon, TrashIcon, CheckIcon } from './icons';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(todo.id, editText.trim());
    }
    setIsEditing(!isEditing);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(todo.text);
    }
  };

  return (
    <li
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
        todo.completed ? 'bg-slate-200 dark:bg-slate-800' : 'bg-white dark:bg-slate-700'
      } shadow-sm`}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center mr-4 flex-shrink-0 ${
          todo.completed
            ? 'bg-green-500 border-green-500'
            : 'border-slate-300 dark:border-slate-500 hover:border-green-500'
        }`}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed && <CheckIcon className="h-4 w-4 text-white" />}
      </button>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
        />
      ) : (
        <span
          className={`flex-grow cursor-pointer ${
            todo.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'
          }`}
          onClick={() => onToggle(todo.id)}
        >
          {todo.text}
        </span>
      )}

      <div className="flex items-center ml-4 space-x-2">
        <button
          onClick={handleEdit}
          className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
          aria-label={isEditing ? 'Save changes' : 'Edit todo'}
        >
          {isEditing ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
          aria-label="Delete todo"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </li>
  );
};

export default TodoItem;
