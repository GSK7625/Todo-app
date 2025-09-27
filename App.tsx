import React, { useState, useEffect, useMemo } from 'react';
import { Todo, Filter, Priority, SortOption } from './types';
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
  const [sort, setSort] = useState<SortOption>(SortOption.CREATED_DESC);

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
       console.error("Failed to save todos to localStorage", error);
    }
  }, [todos]);

  const addTodo = (data: { text: string; dueDate: string | null; priority: Priority }) => {
    const newTodo: Todo = {
      id: Date.now(),
      text: data.text,
      completed: false,
      createdAt: Date.now(),
      dueDate: data.dueDate,
      priority: data.priority,
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

  const sortedAndFilteredTodos = useMemo(() => {
    const filtered = todos.filter(todo => {
        if (filter === Filter.ACTIVE) return !todo.completed;
        if (filter === Filter.COMPLETED) return todo.completed;
        return true;
    });

    return filtered.sort((a, b) => {
        switch (sort) {
            case SortOption.PRIORITY:
                const priorityOrder = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };
                return (priorityOrder[a.priority!] ?? 3) - (priorityOrder[b.priority!] ?? 3);
            case SortOption.DUE_DATE:
                if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            case SortOption.CREATED_ASC:
                return a.createdAt - b.createdAt;
            case SortOption.CREATED_DESC:
            default:
                return b.createdAt - a.createdAt;
        }
    });
  }, [todos, filter, sort]);

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
              todos={sortedAndFilteredTodos} 
              onToggle={toggleTodo} 
              onDelete={deleteTodo}
              onEdit={editTodo} 
            />
        </div>
        
        <TodoFilter 
            currentFilter={filter} 
            onFilterChange={setFilter} 
            currentSort={sort}
            onSortChange={setSort}
        />
      </main>
    </div>
  );
};

export default App;
