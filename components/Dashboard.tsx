/** @jsxRuntime classic */
import * as React from 'react';
import { LifePlan, Goal, Task, GoalStatus, TaskStatus } from '../types.ts';

interface DashboardProps {
  lifePlan: LifePlan;
  goals: Goal[];
  tasks: Task[];
  onNavigate: (view: 'goals' | 'action') => void;
  onUpdateTask: (task: Task) => void;
}

const Dashboard = ({ lifePlan, goals, tasks, onNavigate, onUpdateTask }: DashboardProps) => {
  const inProgressGoals = goals.filter(g => g.status === GoalStatus.InProgress);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysTasks = tasks.filter(task => {
    if (task.status !== TaskStatus.Pending) return false;
    if (!task.startDate) return false;

    // Dates from input are 'YYYY-MM-DD', which new Date() parses as UTC midnight.
    // We adjust for the user's timezone to get the correct local date.
    const startDate = new Date(task.startDate);
    const userTimezoneOffset = startDate.getTimezoneOffset() * 60000;
    const localStartDate = new Date(startDate.getTime() + userTimezoneOffset);
    localStartDate.setHours(0,0,0,0);

    if (!task.endDate) {
        // If no end date, it's a "today task" if start date is today
        return localStartDate.getTime() === today.getTime();
    }
    
    const endDate = new Date(task.endDate);
    const localEndDate = new Date(endDate.getTime() + userTimezoneOffset);
    localEndDate.setHours(0,0,0,0);

    // It's a "today task" if today is between start and end date (inclusive)
    return today.getTime() >= localStartDate.getTime() && today.getTime() <= localEndDate.getTime();
  }).slice(0, 5);
  
  const getGoalTitle = (goalId: string) => goals.find(g => g.id === goalId)?.title || 'Sin Meta';

  const completeTask = (task: Task) => {
    onUpdateTask({ ...task, status: TaskStatus.Completed, completionDate: new Date().toISOString() });
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
        <h2 className="text-xl md:text-2xl font-bold text-brand-accent mb-2">Tu Propósito</h2>
        <p className="text-brand-tertiary italic">"{lifePlan.purpose || 'Define el propósito de tu vida para dar sentido a tus metas.'}"</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Metas Activas ({inProgressGoals.length})</h3>
          {inProgressGoals.length > 0 ? (
            <ul className="space-y-3">
              {inProgressGoals.map(goal => (
                <li key={goal.id} className="flex items-center justify-between p-3 bg-brand-primary rounded-md">
                  <span className="font-medium">{goal.title}</span>
                  <button onClick={() => onNavigate('goals')} className="text-sm text-brand-accent hover:underline">Ver</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-brand-tertiary">No hay metas en progreso. ¡Es hora de establecer un nuevo desafío!</p>
          )}
        </div>

        <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Tareas para Hoy ({todaysTasks.length})</h3>
          {todaysTasks.length > 0 ? (
            <ul className="space-y-3">
              {todaysTasks.map(task => (
                <li key={task.id} className="flex items-center gap-4 p-3 bg-brand-primary rounded-md group">
                   <input 
                    type="checkbox"
                    id={`task-dashboard-${task.id}`}
                    className="h-5 w-5 rounded bg-brand-secondary border-brand-border text-brand-accent focus:ring-brand-accent cursor-pointer flex-shrink-0"
                    onChange={() => completeTask(task)}
                    aria-label={`Marcar como completada: ${task.content}`}
                  />
                  <label htmlFor={`task-dashboard-${task.id}`} className="flex-grow cursor-pointer">
                    {task.content}
                    <span className="text-xs text-brand-tertiary ml-2">({getGoalTitle(task.goalId)})</span>
                  </label>
                  <button onClick={() => onNavigate('action')} className="text-sm text-brand-accent hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Ir
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-brand-tertiary">No hay tareas programadas para hoy. ¡Planifica tu día en la sección de Acción!</p>
          )}
        </div>
      </div>
      
      <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
        <h3 className="text-lg md:text-xl font-semibold mb-2">Frase para Reflexionar</h3>
        <p className="text-brand-tertiary italic">"La efectividad no se trata de hacer más cosas, sino de hacer las cosas correctas. Deja que tu propósito te guíe."</p>
      </div>
    </div>
  );
};

export default Dashboard;