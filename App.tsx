
import React, { useState, useEffect, useMemo } from 'react';
import { Todo, Filter } from './types';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import TodoFilter from './components/TodoFilter';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      return storedTodos ? JSON.parse(storedTodos) : [];
    } catch (error) {
      console.error("Failed to parse todos from localStorage", error);
      return [];
    }
  });

  const [filter, setFilter] = useState<Filter>(Filter.ALL);

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
       console.error("Failed to save todos to localStorage", error);
    }
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };
  
  const editTodo = (id: number, text: string) => {
    if (!text) {
        deleteTodo(id);
        return;
    }
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case Filter.ACTIVE:
        return todos.filter((todo) => !todo.completed);
      case Filter.COMPLETED:
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const activeCount = useMemo(() => todos.filter(todo => !todo.completed).length, [todos]);

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <main className="max-w-xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Todo List</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            You have {activeCount} task{activeCount !== 1 ? 's' : ''} left to do.
          </p>
        </header>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl shadow-lg">
            <TodoInput onAddTodo={addTodo} />
            <TodoList 
              todos={filteredTodos} 
              onToggle={toggleTodo} 
              onDelete={deleteTodo}
              onEdit={editTodo} 
            />
        </div>
        
        <TodoFilter currentFilter={filter} onFilterChange={setFilter} />
      </main>
    </div>
  );
};

export default App;
