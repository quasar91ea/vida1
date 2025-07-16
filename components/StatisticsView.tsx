/** @jsxRuntime classic */
import * as React from 'react';
import { Task, Goal, TaskStatus, GoalStatus } from '../types.ts';

// Helper component for stat cards
const StatCard = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`bg-brand-secondary p-4 md:p-6 rounded-lg border border-brand-border ${className}`}>
        <h3 className="text-base md:text-lg font-semibold text-brand-accent mb-4">{title}</h3>
        {children}
    </div>
);

const StatisticsView = ({ tasks, goals }: { tasks: Task[], goals: Goal[] }) => {

    const stats = React.useMemo(() => {
        const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed);
        const totalTasks = tasks.length;
        const taskCompletion = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

        const completedGoals = goals.filter(g => g.status === GoalStatus.Completed);
        const totalGoals = goals.length;
        const goalCompletion = totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0;
        
        const calculateDurationInMinutes = (task: Task): number => {
            if (
                task.status !== TaskStatus.Completed ||
                !task.startDate ||
                !task.startTime ||
                !task.endTime ||
                !task.completionDate
            ) {
                return 0;
            }
        
            const timeStart = new Date(`1970-01-01T${task.startTime}`);
            const timeEnd = new Date(`1970-01-01T${task.endTime}`);
            const dailyMinutes = (timeEnd.getTime() - timeStart.getTime()) / (1000 * 60);
        
            if (dailyMinutes <= 0) {
                return 0;
            }
        
            const startDate = new Date(task.startDate + 'T00:00:00Z');
            const completionDate = new Date(task.completionDate.split('T')[0] + 'T00:00:00Z');
        
            const effectiveEndDate = task.endDate ? new Date(task.endDate + 'T00:00:00Z') : completionDate;
            const effectiveCompletionDate = new Date(Math.min(completionDate.getTime(), effectiveEndDate.getTime()));
        
            if (effectiveCompletionDate.getTime() < startDate.getTime()) {
                return 0; // Completed before it started
            }
        
            const diffTime = effectiveCompletionDate.getTime() - startDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
            return dailyMinutes * diffDays;
        };

        const completedTasksWithDuration = completedTasks
            .map(task => ({
                ...task,
                duration: calculateDurationInMinutes(task),
            }))
            .filter(t => t.duration > 0);
            
        const totalTimeSpentMinutes = completedTasksWithDuration.reduce((acc, task) => acc + task.duration, 0);

        const onTimeTasks = completedTasks.filter(t => {
            if (!t.endDate || !t.completionDate) return false;
            const endDate = t.endDate;
            const completionDate = t.completionDate.split('T')[0];
            return completionDate <= endDate;
        });
        const relevantCompletedTasks = completedTasks.filter(t => !!t.endDate).length;
        const onTimePercentage = relevantCompletedTasks > 0 ? (onTimeTasks.length / relevantCompletedTasks) * 100 : 0;
        
        const goalProgress = goals.map(goal => {
            if (goal.status === GoalStatus.Completed) {
                return { ...goal, progress: 100 };
            }
            const allGoalTasks = tasks.filter(t => t.goalId === goal.id);
            if (allGoalTasks.length === 0) {
                return { ...goal, progress: 0 };
            }
            const taskStartDates = allGoalTasks
                .map(t => t.startDate ? new Date(t.startDate).getTime() : null)
                .filter((d): d is number => d !== null);
            if (!goal.dueDate || taskStartDates.length === 0) {
                const completedTasksCount = allGoalTasks.filter(t => t.status === TaskStatus.Completed).length;
                return { ...goal, progress: (completedTasksCount / allGoalTasks.length) * 100 };
            }
            const normalizeDate = (d: Date | string): Date => {
                const date = new Date(d);
                return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
            };
            const goalStartDate = normalizeDate(new Date(Math.min(...taskStartDates)));
            const goalDueDate = normalizeDate(goal.dueDate);
            const today = normalizeDate(new Date());
            if (today < goalStartDate || goalDueDate <= goalStartDate) {
                return { ...goal, progress: 0 };
            }
            if (today > goalDueDate) {
                const completedTasksCount = allGoalTasks.filter(t => t.status === TaskStatus.Completed).length;
                return { ...goal, progress: (completedTasksCount / allGoalTasks.length) * 100 };
            }
            const DAY_MS = 1000 * 60 * 60 * 24;
            const totalDurationDays = Math.round((goalDueDate.getTime() - goalStartDate.getTime()) / DAY_MS) + 1;
            let lastOnTrackDay = new Date(goalStartDate.getTime() - DAY_MS);
            for (let d = new Date(goalStartDate); d <= today; d.setDate(d.getDate() + 1)) {
                const currentDay = normalizeDate(new Date(d));
                const tasksDueByThisDay = allGoalTasks.filter(t => t.endDate && normalizeDate(t.endDate) <= currentDay);
                
                if (tasksDueByThisDay.every(t => t.status === TaskStatus.Completed)) {
                    lastOnTrackDay = currentDay;
                } else {
                    break;
                }
            }
            const onTrackDays = Math.round((lastOnTrackDay.getTime() - goalStartDate.getTime()) / DAY_MS) + 1;
            const progress = totalDurationDays > 0 ? (Math.max(0, onTrackDays) / totalDurationDays) * 100 : 0;
            return { ...goal, progress };
        });
        
        const timePerGoal = goals.map(goal => {
            const time = completedTasksWithDuration
              .filter(t => t.goalId === goal.id)
              .reduce((acc, task) => acc + task.duration, 0);
            return {
                id: goal.id,
                title: goal.title,
                timeInMinutes: time,
            };
        });
        
        // --- Daily Stats Calculation ---
        const todayRaw = new Date();
        todayRaw.setHours(0, 0, 0, 0);

        const parseLocalDate = (dateString: string): Date => {
            const date = new Date(dateString);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() + userTimezoneOffset);
        };
        
        const todaysScheduledTasks = tasks.filter(task => {
            if (!task.startDate) return false;
            
            const localStartDate = parseLocalDate(task.startDate);
            localStartDate.setHours(0,0,0,0);
            const localEndDate = task.endDate ? parseLocalDate(task.endDate) : localStartDate;
            localEndDate.setHours(0,0,0,0);

            return todayRaw.getTime() >= localStartDate.getTime() && todayRaw.getTime() <= localEndDate.getTime();
        });

        const todaysCompletedTasks = todaysScheduledTasks.filter(t => t.status === TaskStatus.Completed);
        const dailyCompletionPercentage = todaysScheduledTasks.length > 0 ? (todaysCompletedTasks.length / todaysScheduledTasks.length) * 100 : 0;

        // --- Weekly Productivity Calculation ---
        const getWeekNumber = (d: Date) => {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
            return { year: d.getUTCFullYear(), week: weekNo };
        };

        const weeklyProductivity = new Map<string, { scheduled: Set<string>, completed: Set<string> }>();

        tasks.forEach(task => {
            if (!task.startDate) return;
            const startDate = new Date(task.startDate + 'T00:00:00Z');
            const endDate = task.endDate ? new Date(task.endDate + 'T00:00:00Z') : startDate;

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const { year, week } = getWeekNumber(new Date(d));
                const key = `${year}-W${week.toString().padStart(2, '0')}`;
                
                if (!weeklyProductivity.has(key)) {
                    weeklyProductivity.set(key, { scheduled: new Set(), completed: new Set() });
                }
                
                const weekData = weeklyProductivity.get(key)!;
                weekData.scheduled.add(task.id);
                
                if (task.status === TaskStatus.Completed) {
                    const completionWeekKey = getWeekNumber(new Date(task.completionDate!));
                    const completionKey = `${completionWeekKey.year}-W${completionWeekKey.week.toString().padStart(2, '0')}`;
                     if(weeklyProductivity.has(completionKey)){
                       weeklyProductivity.get(completionKey)!.completed.add(task.id);
                     }
                }
            }
        });
        
        // Filter for weeks with at least one completed task
        const productiveWeeks = Array.from(weeklyProductivity.entries())
            .filter(([, data]) => data.completed.size > 0);

        // Sort the productive weeks chronologically and take the last 12
        const last12ProductiveWeeks = productiveWeeks
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .slice(-12);
            
        const weeklyProductivityData = last12ProductiveWeeks.map(([key, data]) => {
            const { scheduled, completed } = data;
            const percentage = scheduled.size > 0 ? (completed.size / scheduled.size) * 100 : 0;
            return { key, percentage, completedCount: completed.size, scheduledCount: scheduled.size };
        });

        return { 
            taskCompletion, goalCompletion, onTimePercentage, goalProgress, completedTasks, completedGoals, totalTimeSpentMinutes, timePerGoal, completedTasksWithDuration,
            dailyStats: { todaysScheduledTasks, todaysCompletedTasks, dailyCompletionPercentage },
            weeklyProductivityData,
        };
    }, [tasks, goals]);

    const consistencyData = React.useMemo(() => {
        const counts = new Map<string, number>();
        const allCompletedTasks = tasks.filter(t => t.status === TaskStatus.Completed);
        allCompletedTasks.forEach(task => {
            if (task.completionDate) {
                const date = task.completionDate.split('T')[0];
                counts.set(date, (counts.get(date) || 0) + 1);
            }
        });
        return counts;
    }, [tasks]);

    const ConsistencyMap = () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 364);
        
        const days = [];
        let day = new Date(startDate);
        for (let i = 0; i < day.getDay(); i++) {
            days.push({ date: null, count: -1 });
        }
        while (day <= endDate) {
            const dateString = day.toISOString().split('T')[0];
            days.push({ date: new Date(day), count: consistencyData.get(dateString) || 0 });
            day.setDate(day.getDate() + 1);
        }

        const getColor = (count: number) => {
            if (count === 0) return 'bg-brand-primary hover:border-gray-600';
            if (count < 2) return 'bg-blue-900 hover:border-blue-700';
            if (count < 4) return 'bg-blue-800 hover:border-blue-600';
            if (count < 6) return 'bg-blue-700 hover:border-blue-500';
            return 'bg-brand-accent hover:border-blue-400';
        };
        
        return (
            <div className="overflow-x-auto pb-2">
                <div className="grid grid-rows-7 grid-flow-col gap-1 min-w-[700px]">
                    {days.map((d, i) => (
                        <div
                            key={i}
                            className={`w-full aspect-square rounded-sm border border-transparent transition-all ${d.count === -1 ? 'bg-transparent' : getColor(d.count)}`}
                            title={d.date ? `${d.date.toISOString().split('T')[0]}: ${d.count} tareas` : ''}
                        />
                    ))}
                </div>
            </div>
        );
    };
    
    const maxTimePerGoal = React.useMemo(() => Math.max(...stats.timePerGoal.map(g => g.timeInMinutes), 1), [stats.timePerGoal]);

    const formatMinutesToHHMM = (totalMinutes: number): string => {
        if (totalMinutes <= 0 || !totalMinutes) return '00:00';
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        const paddedHours = String(hours).padStart(2, '0');
        const paddedMinutes = String(minutes).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}`;
    };

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">Análisis de Progreso</h2>
                <p className="text-brand-tertiary mt-2">Visualiza tu viaje, celebra tus logros y ajusta tu rumbo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard title="Resumen General">
                    <div className="space-y-4">
                        <div>
                            <p className="flex justify-between text-sm"><span>Metas Completadas</span> <span className="font-bold">{stats.completedGoals.length}/{goals.length}</span></p>
                            <div className="w-full bg-brand-primary rounded-full h-2.5 mt-1"><div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${stats.goalCompletion.toFixed(2)}%` }}></div></div>
                        </div>
                         <div>
                            <p className="flex justify-between text-sm"><span>Tareas Completadas</span> <span className="font-bold">{stats.completedTasks.length}/{tasks.length}</span></p>
                            <div className="w-full bg-brand-primary rounded-full h-2.5 mt-1"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.taskCompletion.toFixed(2)}%` }}></div></div>
                        </div>
                    </div>
                 </StatCard>
                 <StatCard title="Rendimiento de Puntualidad">
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-4xl font-bold text-green-400">{isNaN(stats.onTimePercentage) ? 'N/A' : `${stats.onTimePercentage.toFixed(0)}%`}</div>
                        <p className="text-brand-tertiary text-sm mt-1">Tareas completadas a tiempo</p>
                    </div>
                 </StatCard>
                 <StatCard title="Desglose de Tiempo Invertido">
                    <div className="space-y-3">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-yellow-300">
                                {formatMinutesToHHMM(stats.totalTimeSpentMinutes)}
                            </span>
                            <span className="text-brand-tertiary"> (HH:MM)</span>
                        </div>
                        <div className="border-t border-brand-border pt-3">
                            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {stats.completedTasksWithDuration.length > 0 ? (
                                    stats.completedTasksWithDuration.map(task => (
                                        <li key={task.id} className="flex justify-between items-center text-sm">
                                            <span className="truncate pr-4">{task.content}</span>
                                            <span className="font-semibold text-brand-tertiary flex-shrink-0">
                                                {formatMinutesToHHMM(task.duration)}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-brand-tertiary text-center text-sm">No hay tareas completadas con horario definido.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </StatCard>
                
                <StatCard title="Foco de Hoy" className="md:col-span-2 lg:col-span-3">
                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                        <div className="text-5xl font-bold text-blue-400">
                            {stats.dailyStats.dailyCompletionPercentage.toFixed(0)}%
                        </div>
                        <p className="text-brand-tertiary text-lg">
                            {stats.dailyStats.todaysCompletedTasks.length} de {stats.dailyStats.todaysScheduledTasks.length} tareas de hoy completadas
                        </p>
                        <div className="w-full bg-brand-primary rounded-full h-4">
                            <div 
                                className="bg-blue-500 h-4 rounded-full transition-all duration-500" 
                                style={{ width: `${stats.dailyStats.dailyCompletionPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </StatCard>
            </div>

            <StatCard title="Mapa de Consistencia (Último Año)">
                <ConsistencyMap />
            </StatCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatCard title="Progreso por Meta">
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {stats.goalProgress.length > 0 ? stats.goalProgress.map(goal => (
                            <div key={goal.id}>
                                <p className="flex justify-between text-sm font-medium"><span>{goal.title}</span> <span>{goal.progress.toFixed(0)}%</span></p>
                                <div className="w-full bg-brand-primary rounded-full h-2.5 mt-1"><div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${goal.progress}%` }}></div></div>
                            </div>
                        )) : <p className="text-brand-tertiary">No hay metas para analizar.</p>}
                    </div>
                </StatCard>
                <StatCard title="Horas Invertidas por Meta">
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {stats.timePerGoal.length > 0 ? stats.timePerGoal.map(goalTime => (
                             <div key={goalTime.id}>
                                <p className="flex justify-between text-sm font-medium">
                                    <span>{goalTime.title}</span> 
                                    <span className="text-brand-tertiary">{formatMinutesToHHMM(goalTime.timeInMinutes)}</span>
                                </p>
                                <div className="w-full bg-brand-primary rounded-full h-2.5 mt-1">
                                    <div 
                                        className="bg-yellow-500 h-2.5 rounded-full" 
                                        style={{ width: `${(goalTime.timeInMinutes / maxTimePerGoal) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : <p className="text-brand-tertiary">No se ha registrado tiempo en ninguna tarea.</p>}
                    </div>
                </StatCard>
            </div>
             <StatCard title="Productividad Semanal (Ratio de Completadas)">
                <div className="overflow-x-auto pb-2">
                     <div className="flex gap-2 items-end h-48 pt-4 min-w-[500px]">
                        {stats.weeklyProductivityData.length > 0 ? stats.weeklyProductivityData.map((week) => (
                            <div 
                                key={week.key} 
                                className="flex-1 flex flex-col items-center justify-end gap-1 h-full" 
                                title={`${week.key.replace('-W', ' S')}: ${week.percentage.toFixed(0)}% (${week.completedCount}/${week.scheduledCount} tareas)`}
                            >
                                <div className="text-xs text-brand-tertiary font-bold">{week.percentage.toFixed(0)}%</div>
                                <div 
                                    className="w-full bg-brand-accent rounded-t-sm hover:bg-blue-400 transition-colors" 
                                    style={{ height: `${week.percentage}%`}}
                                ></div>
                                <div className="text-[10px] text-brand-tertiary text-center -rotate-45 -translate-y-2">
                                    <span>{week.key.replace('-W', ' S')}</span>
                                </div>
                            </div>
                        )) : <p className="text-brand-tertiary w-full text-center self-center">No hay suficientes datos semanales.</p>}
                    </div>
                </div>
            </StatCard>
        </div>
    );
}

export default StatisticsView;