import React, { useState, useEffect, useMemo } from 'react';
import { Todo, Filter, Priority, SortOption } from './types';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import TodoFilter from './components/TodoFilter';
import AmbientSoundPlayer from './components/AmbientSoundPlayer';

type ActiveTimer = {
  todoId: number;
  remainingSeconds: number;
  isRunning: boolean;
};

type PersistedActiveTimer = {
  todoId: number;
  remainingSeconds: number;
  isRunning: boolean;
  timestamp: number;
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
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
       console.error("Failed to save todos to localStorage", error);
    }
  }, [todos]);

  // This effect runs once on mount to initialize the timer from localStorage.
  useEffect(() => {
    try {
        const storedTimer = localStorage.getItem('activeTimer');
        if (!storedTimer) return;

        const parsedTimer: PersistedActiveTimer = JSON.parse(storedTimer);
        const todoForTimer = todos.find(t => t.id === parsedTimer.todoId);

        // If the todo doesn't exist anymore, clean up.
        if (!todoForTimer) {
            localStorage.removeItem('activeTimer');
            return;
        }

        // If it was paused, just load it.
        if (!parsedTimer.isRunning) {
            setActiveTimer({
                todoId: parsedTimer.todoId,
                remainingSeconds: parsedTimer.remainingSeconds,
                isRunning: false,
            });
            return;
        }

        // If it was running, calculate progress.
        const secondsPassed = Math.floor((Date.now() - parsedTimer.timestamp) / 1000);
        const newRemainingSeconds = parsedTimer.remainingSeconds - secondsPassed;

        if (newRemainingSeconds <= 0) {
            // Timer finished while away. Update todo and clean up.
            const totalDurationInSeconds = (todoForTimer.duration || 0) * 60;
            setTodos(prev => prev.map(t => 
              t.id === parsedTimer.todoId ? { ...t, timeSpent: totalDurationInSeconds } : t
            ));
            localStorage.removeItem('activeTimer');
        } else {
            // Timer is still running. Set the state.
            setActiveTimer({
                todoId: parsedTimer.todoId,
                remainingSeconds: newRemainingSeconds,
                isRunning: true,
            });
        }
    } catch (error) {
        console.error("Failed to initialize timer from localStorage", error);
        localStorage.removeItem('activeTimer');
    }
  }, []); // Intentionally empty dependency array to run only once on mount

  // Persist activeTimer state to localStorage whenever it changes.
  useEffect(() => {
    if (activeTimer) {
      const dataToStore: PersistedActiveTimer = {
        ...activeTimer,
        timestamp: Date.now(),
      };
      localStorage.setItem('activeTimer', JSON.stringify(dataToStore));
    } else {
      localStorage.removeItem('activeTimer');
    }
  }, [activeTimer]);


  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) {
        return;
    }

    if (activeTimer.remainingSeconds <= 0) {
        const timedOutTodo = todos.find(t => t.id === activeTimer.todoId);
        alert(`Time's up for task: "${timedOutTodo?.text}"!`);
        handleStopTimer();
        return;
    }

    const intervalId = setInterval(() => {
        setActiveTimer(currentTimer => {
            if (!currentTimer || !currentTimer.isRunning) {
                clearInterval(intervalId);
                return currentTimer;
            }
            const newRemaining = Math.max(0, currentTimer.remainingSeconds - 1);
            return { ...currentTimer, remainingSeconds: newRemaining };
        });
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
      timeSpent: 0,
    };
    setTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id: number) => {
    if (activeTimer?.todoId === id) {
        handleStopTimer();
    }
    setTodos(prevTodos =>
        prevTodos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
    );
  };

  const deleteTodo = (id: number) => {
    if (deletingTodoId) return; // Prevent deleting while another is animating

    setDeletingTodoId(id);
    if (activeTimer && activeTimer.todoId === id) {
      setActiveTimer(null);
    }
    
    setTimeout(() => {
        setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id));
        setDeletingTodoId(null);
    }, 300); // Corresponds to animation duration
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

  const handleStartTimer = (todoId: number) => {
    // If another timer is actively RUNNING, prevent starting a new one.
    // This is a safeguard, as the UI should already prevent this.
    if (activeTimer && activeTimer.isRunning && activeTimer.todoId !== todoId) {
      return;
    }

    // If there is a PAUSED timer for a different task, we need to stop it
    // to save its progress before starting the new one.
    if (activeTimer && !activeTimer.isRunning && activeTimer.todoId !== todoId) {
      handleStopTimer(); // This saves progress and sets activeTimer to null.
    }

    const todoToStart = todos.find(t => t.id === todoId);
    if (!todoToStart || !todoToStart.duration) return;

    const totalDurationInSeconds = todoToStart.duration * 60;
    const timeSpentSoFar = todoToStart.timeSpent || 0;
    const remainingSeconds = totalDurationInSeconds - timeSpentSoFar;

    if (remainingSeconds > 0) {
        setActiveTimer({
            todoId,
            remainingSeconds,
            isRunning: true,
        });
    }
  };

  const handlePauseTimer = () => {
    setActiveTimer(prev => (prev ? { ...prev, isRunning: !prev.isRunning } : null));
  };
  
  const handleStopTimer = () => {
    if (!activeTimer) return;

    const { todoId, remainingSeconds } = activeTimer;
    const todo = todos.find(t => t.id === todoId);
    if (!todo || !todo.duration) {
        setActiveTimer(null);
        return;
    };

    const totalDurationInSeconds = todo.duration * 60;
    const newTimeSpent = totalDurationInSeconds - remainingSeconds;
    
    setTodos(prevTodos => prevTodos.map(t => 
        t.id === todoId 
        ? { ...t, timeSpent: Math.round(Math.max(0, Math.min(newTimeSpent, totalDurationInSeconds))) }
        : t
    ));

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
            You have <span key={activeCount} className="animate-count-up font-bold">{activeCount}</span> task{activeCount !== 1 ? 's' : ''} left to do.
          </p>
        </header>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl shadow-lg">
            <TodoInput onAddTodo={addTodo} />
            <TodoList 
              todos={sortedAndFilteredTodos} 
              onToggle={toggleTodo} 
              onDelete={deleteTodo}
              onEdit={editTodo}
              deletingTodoId={deletingTodoId}
              activeTimer={activeTimer}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
            />
        </div>
        
        <TodoFilter 
            currentFilter={filter} 
            onFilterChange={setFilter} 
            currentSort={sort}
            onSortChange={setSort}
        />
      </main>
      <AmbientSoundPlayer />
    </div>
  );
};

export default App;