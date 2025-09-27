export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string | null;
  priority?: Priority;
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
}
