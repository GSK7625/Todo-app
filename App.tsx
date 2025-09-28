import React, { useState, useEffect, useMemo } from 'react';
import { Todo, Filter, Priority, SortOption, Subtask } from './types';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import TodoFilter from './components/TodoFilter';
import AmbientSoundPlayer from './components/AmbientSoundPlayer';
import TodoEditModal from './components/TodoEditModal';
import { CrosshairsIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './components/icons';
import FocusModeView from './components/FocusModeView';

type ActiveTimer = {
  todoId: number;
  subtaskId?: number;
  remainingSeconds: number;
  isRunning: boolean;
};

type PersistedActiveTimer = {
  todoId: number;
  subtaskId?: number;
  remainingSeconds: number;
  isRunning: boolean;
  timestamp: number;
};

const getGroupTitle = (dateString?: string | null): string => {
  if (!dateString) return 'No Due Date';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse YYYY-MM-DD to avoid timezone issues.
  const parts = dateString.split('-').map(s => parseInt(s, 10));
  const taskDate = new Date(parts[0], parts[1] - 1, parts[2]);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (taskDate.getTime() < today.getTime()) return 'Overdue';
  if (taskDate.getTime() === today.getTime()) return 'Today';
  if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
  
  return taskDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};


const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const storedTodos = localStorage.getItem('todos');
      return storedTodos ? JSON.parse(storedTodos) : [];
    } catch (error)
 {
      console.error("Failed to parse todos from localStorage", error);
      return [];
    }
  });

  const [filter, setFilter] = useState<Filter>(Filter.ALL);
  const [sort, setSort] = useState<SortOption>(SortOption.DUE_DATE);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

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

        if (!todoForTimer) {
            localStorage.removeItem('activeTimer');
            return;
        }

        if (!parsedTimer.isRunning) {
            setActiveTimer({
                todoId: parsedTimer.todoId,
                subtaskId: parsedTimer.subtaskId,
                remainingSeconds: parsedTimer.remainingSeconds,
                isRunning: false,
            });
            return;
        }

        const secondsPassed = Math.floor((Date.now() - parsedTimer.timestamp) / 1000);
        const newRemainingSeconds = parsedTimer.remainingSeconds - secondsPassed;

        if (newRemainingSeconds <= 0) {
            handleStopTimer(true); // Stop timer and mark as finished
            localStorage.removeItem('activeTimer');
        } else {
            setActiveTimer({
                todoId: parsedTimer.todoId,
                subtaskId: parsedTimer.subtaskId,
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
        let taskText = timedOutTodo?.text;
        if(activeTimer.subtaskId) {
            const subtask = timedOutTodo?.subtasks?.find(s => s.id === activeTimer.subtaskId);
            taskText = subtask ? `${timedOutTodo?.text} > ${subtask.text}` : timedOutTodo?.text;
        }
        
        alert(`Time's up for task: "${taskText}"!`);
        handleStopTimer(true);
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


  const addTodo = (data: { 
    text: string; 
    dueDate: string | null; 
    priority: Priority; 
    duration: number | null;
    subtasks: Array<{ text: string; duration?: number }>;
  }) => {
    const newTodo: Todo = {
      id: Date.now(),
      text: data.text,
      completed: false,
      createdAt: Date.now(),
      dueDate: data.dueDate,
      priority: data.priority,
      duration: data.duration,
      timeSpent: 0,
      subtasks: data.subtasks.map((sub, index) => ({
        id: Date.now() + index + 1, // Simple unique ID
        text: sub.text,
        completed: false,
        duration: sub.duration,
        timeSpent: 0,
      })),
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

  const toggleSubtask = (todoId: number, subtaskId: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => {
        if (todo.id === todoId) {
          let wasSubtaskCompleted = false;
          const updatedSubtasks = todo.subtasks?.map(sub => {
            if (sub.id === subtaskId) {
              wasSubtaskCompleted = !sub.completed;
              return { ...sub, completed: !sub.completed };
            }
            return sub;
          }) ?? [];
  
          if(wasSubtaskCompleted && activeTimer?.subtaskId === subtaskId) {
            handleStopTimer();
          }

          const allSubtasksCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
          
          const newCompletedStatus = updatedSubtasks.length > 0 ? allSubtasksCompleted : todo.completed;
  
          if (newCompletedStatus && !todo.completed && activeTimer?.todoId === todoId && !activeTimer?.subtaskId) {
            handleStopTimer();
          }

          return {
            ...todo,
            subtasks: updatedSubtasks,
            completed: newCompletedStatus,
          };
        }
        return todo;
      })
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

  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
  };
  
  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  const handleSaveEdit = (updatedTodoData: Partial<Todo> & { id: number }) => {
    if (!updatedTodoData.text) {
        deleteTodo(updatedTodoData.id);
        setEditingTodo(null);
        return;
    }
    
    // Stop any active timer related to this todo if durations changed
    if (activeTimer?.todoId === updatedTodoData.id) {
        handleStopTimer();
    }
      
    setTodos(todos.map(todo =>
      todo.id === updatedTodoData.id
        ? { ...todo, ...updatedTodoData }
        : todo
    ));
    setEditingTodo(null);
  };
  

  const handleStartTimer = (todoId: number, subtaskId?: number) => {
    if (activeTimer && activeTimer.isRunning) {
        if (activeTimer.todoId !== todoId || activeTimer.subtaskId !== subtaskId) {
            return; // Don't start a new timer if another is actively running
        }
    }

    if (activeTimer && (!activeTimer.isRunning || activeTimer.todoId !== todoId || activeTimer.subtaskId !== subtaskId)) {
      handleStopTimer();
    }

    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    let itemToTime: Todo | Subtask | undefined = todo;
    if (subtaskId) {
        itemToTime = todo.subtasks?.find(s => s.id === subtaskId);
    }
    
    if (!itemToTime || !itemToTime.duration) return;

    const totalDurationInSeconds = itemToTime.duration * 60;
    const timeSpentSoFar = itemToTime.timeSpent || 0;
    const remainingSeconds = totalDurationInSeconds - timeSpentSoFar;

    if (remainingSeconds > 0) {
        setActiveTimer({
            todoId,
            subtaskId,
            remainingSeconds,
            isRunning: true,
        });
    }
  };

  const handlePauseTimer = () => {
    setActiveTimer(prev => (prev ? { ...prev, isRunning: !prev.isRunning } : null));
  };
  
  const handleStopTimer = (finished: boolean = false) => {
    if (!activeTimer) return;

    const { todoId, subtaskId, remainingSeconds } = activeTimer;
    
    setTodos(prevTodos => prevTodos.map(t => {
        if (t.id === todoId) {
            let updatedTodo = { ...t };
            
            if (subtaskId) {
                let subtaskTimed: Subtask | undefined;
                updatedTodo.subtasks = updatedTodo.subtasks?.map(sub => {
                    if (sub.id === subtaskId) {
                        subtaskTimed = sub;
                        const totalDurationInSeconds = (sub.duration || 0) * 60;
                        const newTimeSpent = finished ? totalDurationInSeconds : totalDurationInSeconds - remainingSeconds;
                        return { ...sub, timeSpent: Math.round(Math.max(0, Math.min(newTimeSpent, totalDurationInSeconds))) };
                    }
                    return sub;
                });
                // Recalculate parent task's time spent
                updatedTodo.timeSpent = updatedTodo.subtasks?.reduce((sum, s) => sum + (s.timeSpent || 0), 0);

            } else {
                const totalDurationInSeconds = (t.duration || 0) * 60;
                const newTimeSpent = finished ? totalDurationInSeconds : totalDurationInSeconds - remainingSeconds;
                updatedTodo.timeSpent = Math.round(Math.max(0, Math.min(newTimeSpent, totalDurationInSeconds)));
            }
            return updatedTodo;
        }
        return t;
    }));

    setActiveTimer(null);
  };

  const sortedAndFilteredTodos = useMemo(() => {
    const filtered = todos.filter(todo => {
        if (filter === Filter.ACTIVE) return !todo.completed;
        if (filter === Filter.COMPLETED) return todo.completed;
        return true;
    });

    if (sort === SortOption.DUE_DATE) {
        const priorityOrder = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };

        const sortedByDate = [...filtered].sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        const groups = sortedByDate.reduce<{[key: string]: { todos: Todo[]; totalDuration: number }}>((acc, todo) => {
            const groupTitle = getGroupTitle(todo.dueDate);
            if (!acc[groupTitle]) {
              acc[groupTitle] = { todos: [], totalDuration: 0 };
            }
            acc[groupTitle].todos.push(todo);
            acc[groupTitle].totalDuration += todo.duration || 0;
            return acc;
        }, {});
        
        Object.values(groups).forEach(group => {
            group.todos.sort((a, b) => (priorityOrder[a.priority!] ?? 3) - (priorityOrder[b.priority!] ?? 3));
        });
        
        const groupOrder = ['Overdue', 'Today', 'Tomorrow'];
        return Object.entries(groups)
            .map(([title, { todos, totalDuration }]) => ({ title, todos, totalDuration }))
            .sort((a, b) => {
                const aIndex = groupOrder.indexOf(a.title);
                const bIndex = groupOrder.indexOf(b.title);

                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                if (a.title === 'No Due Date') return 1;
                if (b.title === 'No Due Date') return -1;
                
                const aDate = a.todos[0]?.dueDate ? new Date(a.todos[0].dueDate) : null;
                const bDate = b.todos[0]?.dueDate ? new Date(b.todos[0].dueDate) : null;
                if (!aDate) return 1;
                if (!bDate) return -1;
                return aDate.getTime() - bDate.getTime();
            });
    }

    return filtered.sort((a, b) => {
        switch (sort) {
            case SortOption.PRIORITY:
                const priorityOrder = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };
                return (priorityOrder[a.priority!] ?? 3) - (priorityOrder[b.priority!] ?? 3);
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
  
  const isSoundPlaying = useMemo(() => !!activeTimer?.isRunning, [activeTimer]);

  const enterFocusMode = () => {
    if (activeTimer) {
        setIsFocusMode(true);
    }
  };

  const exitFocusMode = () => {
    setIsFocusMode(false);
  };

  const focusedTask = useMemo(() => {
    if (!activeTimer) return null;
    const parentTask = todos.find(t => t.id === activeTimer.todoId)
    if (!parentTask) return null;

    if (activeTimer.subtaskId) {
        const subtask = parentTask.subtasks?.find(s => s.id === activeTimer.subtaskId);
        if (subtask) {
            return {
                ...subtask,
                text: `${parentTask.text} > ${subtask.text}`, // Combine text for focus view
                id: parentTask.id, // Keep parent ID for consistency
            } as Todo;
        }
    }
    return parentTask;
  }, [activeTimer, todos]);

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 py-6 px-2 sm:px-6 lg:px-8">
      {isFocusMode && focusedTask ? (
        <FocusModeView
          task={focusedTask}
          timer={activeTimer!}
          onPauseTimer={handlePauseTimer}
          onExit={exitFocusMode}
        />
      ) : (
        <main className="max-w-xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div className="text-center flex-grow">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Todo List</h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                You have <span key={activeCount} className="animate-count-up font-bold">{activeCount}</span> task{activeCount !== 1 ? 's' : ''} left to do.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(prev => !prev)}
                className="p-3 text-slate-500 bg-white dark:bg-slate-700 rounded-full shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                title={isMuted ? "Unmute sound" : "Mute sound"}
              >
                {isMuted ? <SpeakerXMarkIcon className="h-6 w-6" /> : <SpeakerWaveIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={enterFocusMode}
                disabled={!activeTimer}
                className="p-3 text-slate-500 bg-white dark:bg-slate-700 rounded-full shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-700 disabled:hover:text-slate-500"
                aria-label="Enter Focus Mode"
                title={activeTimer ? "Enter Focus Mode" : "Start a timer to use Focus Mode"}
              >
                <CrosshairsIcon className="h-6 w-6" />
              </button>
            </div>
          </header>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl shadow-lg">
              <TodoInput onAddTodo={addTodo} />
              <TodoList 
                todos={sortedAndFilteredTodos} 
                onToggle={toggleTodo} 
                onDelete={deleteTodo}
                onEdit={handleStartEdit}
                deletingTodoId={deletingTodoId}
                activeTimer={activeTimer}
                onStartTimer={handleStartTimer}
                onPauseTimer={handlePauseTimer}
                onToggleSubtask={toggleSubtask}
              />
              <TodoFilter 
                  currentFilter={filter} 
                  onFilterChange={setFilter} 
                  currentSort={sort}
                  onSortChange={setSort}
              />
          </div>
        </main>
      )}

      <AmbientSoundPlayer isPlaying={isSoundPlaying} isMuted={isMuted} />
      {editingTodo && (
        <TodoEditModal
          todo={editingTodo}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default App;