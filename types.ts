
export enum GoalStatus {
  NotStarted = "No Iniciado",
  InProgress = "En Progreso",
  Completed = "Completado",
  OnHold = "En Pausa",
}

export enum TaskStatus {
  Pending = "Pendiente",
  Completed = "Completado",
}

export interface LifePlan {
  purpose: string;
  values: string[];
  vision: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  dueDate: string;
  relevance: string; // How it connects to the life plan
}

export interface Task {
  id:string;
  goalId: string;
  content: string;
  status: TaskStatus;
  priority: 'High' | 'Medium' | 'Low';
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  completionDate?: string;
}

export interface ReflectionEntry {
  id: string;
  date: string;
  content: string;
  imageUrl?: string;
}

export type AppView = 'dashboard' | 'purpose' | 'goals' | 'action' | 'reflection' | 'calendar' | 'statistics' | 'info';