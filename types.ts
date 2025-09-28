export interface Subtask {
  id: number;
  text: string;
  completed: boolean;
  duration?: number; // in minutes
  timeSpent?: number; // in seconds
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number | null;
  dueDate?: string | null;
  priority?: Priority;
  duration?: number | null; // in minutes
  timeSpent?: number; // in seconds
  subtasks?: Subtask[];
}

export enum Filter {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum SortOption {
  CREATED_DESC = 'created_desc',
  CREATED_ASC = 'created_asc',
  DUE_DATE = 'due_date',
  PRIORITY = 'priority',
  DURATION_DESC = 'duration_desc',
  DURATION_ASC = 'duration_asc',
}
