
import React, { useState, useEffect, useMemo } from 'react';
import { Todo, Filter, Priority, SortOption } from './types';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import TodoFilter from './components/TodoFilter';

type ActiveTimer = {
  todoId: number;
  timeLeft: number; // in seconds
  isRunning: boolean;
};

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
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
       console.error("Failed to save todos to localStorage", error);
    }
  }, [todos]);

  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return;

    if (activeTimer.timeLeft <= 0) {
      const todo = todos.find(t => t.id === activeTimer.todoId);
      alert(`Time's up for task: "${todo?.text}"! Time for a break.`);
      setActiveTimer(null);
      // Optionally mark task as complete
      // if (todo) {
      //   toggleTodo(todo.id);
      // }
      return;
    }

    const intervalId = setInterval(() => {
        setActiveTimer(prev => (prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeTimer, todos]);


  const addTodo = (data: { text: string; dueDate: string | null; priority: Priority; duration: number | null }) => {
    const newTodo: Todo = {
      id: Date.now(),
      text: data.text,
      completed: false,
      createdAt: Date.now(),
      dueDate: data.dueDate,
      priority: data.priority,
      duration: data.duration,
    };
    setTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
     // Stop timer if task is completed
    if (activeTimer && activeTimer.todoId === id) {
        setActiveTimer(null);
    }
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    // Stop timer if task is deleted
    if (activeTimer && activeTimer.todoId === id) {
        setActiveTimer(null);
    }
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

  const handleStartTimer = (todoId: number, duration: number) => {
    setActiveTimer({
        todoId,
        timeLeft: duration * 60,
        isRunning: true,
    });
  };

  const handlePauseTimer = () => {
    setActiveTimer(prev => (prev ? { ...prev, isRunning: !prev.isRunning } : null));
  };
  
  const handleStopTimer = () => {
      setActiveTimer(null);
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
            case SortOption.DURATION_DESC:
                return (b.duration ?? -1) - (a.duration ?? -1);
            case SortOption.DURATION_ASC:
                return (a.duration ?? Infinity) - (b.duration ?? Infinity);
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
              activeTimer={activeTimer}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
              onStopTimer={handleStopTimer}
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
