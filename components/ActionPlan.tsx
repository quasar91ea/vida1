/** @jsxRuntime classic */
import * as React from 'react';
import { Task, Goal, TaskStatus } from '../types.ts';
import { useNotification } from '../contexts/NotificationContext.tsx';

interface ActionPlanProps {
  tasks: Task[];
  goals: Goal[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const ActionPlan = ({ tasks, goals, onAddTask, onUpdateTask, onDeleteTask }: ActionPlanProps) => {
  const [newTask, setNewTask] = React.useState({
    content: '',
    goalId: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });
  const { showNotification } = useNotification();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.content || !newTask.goalId) {
        showNotification('Por favor, introduce el contenido de la tarea y selecciona una meta.', 'error');
        return;
    }

    // --- Validación de solapamiento ---
    if (newTask.startDate && newTask.startTime && newTask.endTime) {
        const parseDate = (dateString: string) => {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day);
        };

        const newStart = parseDate(newTask.startDate);
        const newEnd = newTask.endDate ? parseDate(newTask.endDate) : newStart;

        let conflictFound = false;

        // Iterar a través de cada día del rango de la nueva tarea
        for (let d = new Date(newStart); d <= newEnd; d.setDate(d.getDate() + 1)) {
            // Comprobar contra todas las tareas existentes
            for (const existingTask of tasks) {
                if (existingTask.status === TaskStatus.Completed || !existingTask.startDate || !existingTask.startTime || !existingTask.endTime) {
                    continue; // Saltar tareas completadas o sin horario
                }

                const existingStart = parseDate(existingTask.startDate);
                const existingEnd = existingTask.endDate ? parseDate(existingTask.endDate) : existingStart;

                // Comprobar si la tarea existente está activa en el día actual
                if (d >= existingStart && d <= existingEnd) {
                    // Ahora comprobar si hay solapamiento de tiempo
                    const newStartTime = newTask.startTime!;
                    const newEndTime = newTask.endTime!;
                    const existingStartTime = existingTask.startTime;
                    const existingEndTime = existingTask.endTime;

                    // Condición para el solapamiento: (InicioA < FinB) y (FinA > InicioB)
                    if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
                        conflictFound = true;
                        break; // Salir del bucle interno
                    }
                }
            }
            if (conflictFound) {
                break; // Salir del bucle externo
            }
        }
        
        if (conflictFound) {
            showNotification('La nueva tarea se solapa con una tarea existente.', 'error', '¡Conflicto de Horario!');
            return;
        }
    }
    // --- Fin de la validación ---

    onAddTask({ 
        content: newTask.content, 
        goalId: newTask.goalId, 
        status: TaskStatus.Pending, 
        priority: 'Medium',
        startDate: newTask.startDate || undefined,
        endDate: newTask.endDate || undefined,
        startTime: newTask.startTime || undefined,
        endTime: newTask.endTime || undefined,
    });
    setNewTask({ content: '', goalId: '', startDate: '', endDate: '', startTime: '', endTime: '' });
  };

  const getGoalTitle = (goalId: string) => goals.find(g => g.id === goalId)?.title || 'Sin Meta';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = tasks.filter(task => {
    if (task.status !== TaskStatus.Pending) return false;
    if (!task.startDate) return false;

    const startDate = new Date(task.startDate);
    const userTimezoneOffset = startDate.getTimezoneOffset() * 60000;
    const localStartDate = new Date(startDate.getTime() + userTimezoneOffset);
    localStartDate.setHours(0,0,0,0);

    if (!task.endDate) {
        return localStartDate.getTime() === today.getTime();
    }
    
    const endDate = new Date(task.endDate);
    const localEndDate = new Date(endDate.getTime() + userTimezoneOffset);
    localEndDate.setHours(0,0,0,0);
    
    return today.getTime() >= localStartDate.getTime() && today.getTime() <= localEndDate.getTime();
  });

  const completeTask = (task: Task) => {
    onUpdateTask({ ...task, status: TaskStatus.Completed, completionDate: new Date().toISOString() });
  };

  const pendingTasks = tasks.filter(t => t.status === TaskStatus.Pending && !todayTasks.some(todayTask => todayTask.id === t.id));

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">Ejecuta Tu Plan: El "Cómo" y "Cuándo"</h2>
            <p className="text-brand-tertiary mt-2">Desglosa tus metas en tareas accionables y gestiona tu enfoque.</p>
        </div>

        <div className="bg-brand-secondary p-4 md:p-8 rounded-lg border border-brand-border space-y-8">
            <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-4">Añadir Nueva Tarea</h3>
                <form onSubmit={handleAddTask} className="space-y-4">
                    <input name="content" value={newTask.content} onChange={handleInputChange} placeholder="Introduce una nueva tarea..." className="w-full bg-brand-primary p-3 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <select name="goalId" value={newTask.goalId} onChange={handleInputChange} className="w-full bg-brand-primary p-3 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent sm:col-span-2 md:col-span-4">
                            <option value="">-- Asignar a Meta --</option>
                            {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </select>
                        <div className="sm:col-span-1">
                            <label htmlFor="startDate" className="text-xs text-brand-tertiary">Fecha Inicio</label>
                            <input id="startDate" name="startDate" type="date" value={newTask.startDate} onChange={handleInputChange} className="w-full bg-brand-primary p-2.5 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                        </div>
                        <div className="sm:col-span-1">
                            <label htmlFor="startTime" className="text-xs text-brand-tertiary">Hora Inicio</label>
                            <input id="startTime" name="startTime" type="time" value={newTask.startTime} onChange={handleInputChange} className="w-full bg-brand-primary p-2.5 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                        </div>
                         <div className="sm:col-span-1">
                            <label htmlFor="endDate" className="text-xs text-brand-tertiary">Fecha Fin</label>
                            <input id="endDate" name="endDate" type="date" value={newTask.endDate} onChange={handleInputChange} className="w-full bg-brand-primary p-2.5 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                        </div>
                         <div className="sm:col-span-1">
                            <label htmlFor="endTime" className="text-xs text-brand-tertiary">Hora Fin</label>
                            <input id="endTime" name="endTime" type="time" value={newTask.endTime} onChange={handleInputChange} className="w-full bg-brand-primary p-2.5 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                        </div>
                    </div>
                    <button type="submit" className="w-full px-4 py-3 bg-brand-accent hover:bg-blue-500 rounded-md text-white font-bold transition-colors">Añadir Tarea</button>
                </form>
            </div>

            <div>
                <h3 className="text-lg md:text-xl font-semibold mb-4 text-yellow-300">Tareas para Hoy</h3>
                {todayTasks.length > 0 ? (
                    <ul className="space-y-2">
                        {todayTasks.map(task => (
                            <li key={task.id} className="flex items-center gap-4 p-3 bg-brand-primary rounded-md group">
                                <input 
                                    type="checkbox"
                                    id={`task-today-${task.id}`}
                                    className="h-5 w-5 rounded bg-brand-secondary border-brand-border text-brand-accent focus:ring-brand-accent cursor-pointer flex-shrink-0"
                                    onChange={() => completeTask(task)}
                                    aria-label={`Marcar como completada: ${task.content}`}
                                />
                                <div className="flex-grow">
                                    <label htmlFor={`task-today-${task.id}`} className="cursor-pointer">
                                        {task.content} <span className="text-xs text-brand-tertiary ml-2">({getGoalTitle(task.goalId)})</span>
                                    </label>
                                    {task.startTime && task.endTime && (
                                        <div className="flex items-center gap-1.5 text-xs text-brand-accent mt-1">
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span>{task.startTime} - {task.endTime}</span>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => onDeleteTask(task.id)} className="text-red-600 hover:text-red-400 text-sm md:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-label={`Eliminar tarea: ${task.content}`}>Eliminar</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-brand-tertiary">¡Nada para hoy! Añade fechas a tus tareas o disfruta de tu día libre.</p>
                )}
            </div>
            
            <div className="border-t border-brand-border pt-6">
                <h3 className="text-lg md:text-xl font-semibold mb-4">Próximas Tareas Pendientes</h3>
                {pendingTasks.length > 0 ? (
                  <ul className="space-y-2">
                      {pendingTasks.map(task => (
                          <li key={task.id} className="flex items-center justify-between p-3 bg-brand-primary rounded-md group">
                              <div>
                                <p className="flex-grow">{task.content} <span className="text-xs text-brand-tertiary ml-2">({getGoalTitle(task.goalId)})</span></p>
                                {(task.startDate || task.endDate || task.startTime || task.endTime) && (
                                    <p className="text-xs text-brand-tertiary mt-1">
                                        {task.startDate ? `Inicio: ${new Date(task.startDate).toLocaleDateString()}` : ''} {task.startTime || ''}
                                        {(task.startDate || task.startTime) && (task.endDate || task.endTime) ? ' - ' : ''}
                                        {task.endDate ? `Fin: ${new Date(task.endDate).toLocaleDateString()}` : ''} {task.endTime || ''}
                                    </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => onDeleteTask(task.id)} className="text-red-500 hover:text-red-400 text-sm">Eliminar</button>
                              </div>
                          </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-brand-tertiary">No hay más tareas pendientes.</p>
                )}
            </div>
        </div>
    </div>
  );
};

export default ActionPlan;