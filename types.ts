
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export enum Filter {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}
