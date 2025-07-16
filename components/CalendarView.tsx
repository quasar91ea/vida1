/** @jsxRuntime classic */
import * as React from 'react';
import { Task, Goal } from '../types.ts';

// Helper para obtener la fecha local a partir de una cadena YYYY-MM-DD para evitar problemas de zona horaria
const parseLocalDate = (dateString: string): Date => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
};

const CalendarView = ({ tasks, goals }: { tasks: Task[], goals: Goal[] }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);

    const getGoalTitle = (goalId: string) => goals.find(g => g.id === goalId)?.title || 'Sin Meta';

    const handleDayClick = (date: Date | null) => {
        if (!date) return;
        if (selectedDay && selectedDay.getTime() === date.getTime()) {
            setSelectedDay(null); // Deseleccionar si se hace clic en el mismo día
        } else {
            setSelectedDay(date);
        }
    };

    const { calendarDays } = React.useMemo(() => {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const startingDayOfWeek = firstDay.getDay();
        const totalDaysInMonth = lastDay.getDate();
        const days = [];
        
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        for (let i = startingDayOfWeek; i > 0; i--) {
            days.push({ day: prevMonthLastDay - i + 1, isCurrentMonth: false, date: null });
        }

        for (let i = 1; i <= totalDaysInMonth; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            days.push({ day: i, isCurrentMonth: true, date });
        }

        const lastDayOfWeek = lastDay.getDay();
        for (let i = 1; i < 7 - lastDayOfWeek; i++) {
            days.push({ day: i, isCurrentMonth: false, date: null });
        }
        return { calendarDays: days };
    }, [currentDate]);

    const tasksByDate = React.useMemo(() => {
        const taskMap = new Map<string, Task[]>();
        tasks.forEach(task => {
            if (!task.startDate) return;

            const start = parseLocalDate(task.startDate);
            start.setHours(0,0,0,0);
            const end = task.endDate ? parseLocalDate(task.endDate) : start;
            end.setHours(0,0,0,0);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateString = d.toISOString().split('T')[0];
                if (!taskMap.has(dateString)) {
                    taskMap.set(dateString, []);
                }
                taskMap.get(dateString)!.push(task);
            }
        });
        
        // Ordenar tareas por hora de inicio dentro de cada día
        for (const [date, dailyTasks] of taskMap.entries()) {
            dailyTasks.sort((a, b) => (a.startTime || '23:59').localeCompare(b.startTime || '23:59'));
        }

        return taskMap;
    }, [tasks]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
        setSelectedDay(null); // Deseleccionar día al cambiar de mes
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    
    const selectedDateString = selectedDay ? selectedDay.toISOString().split('T')[0] : '';
    const tasksForSelectedDay = tasksByDate.get(selectedDateString) || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-brand-secondary p-4 sm:p-6 rounded-lg border border-brand-border">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-brand-accent">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm bg-brand-primary hover:bg-brand-tertiary rounded-md transition-colors">Hoy</button>
                        <button onClick={() => changeMonth(-1)} className="p-2 bg-brand-primary hover:bg-brand-tertiary rounded-full transition-colors" aria-label="Mes anterior">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button onClick={() => changeMonth(1)} className="p-2 bg-brand-primary hover:bg-brand-tertiary rounded-full transition-colors" aria-label="Mes siguiente">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-brand-border border-t border-l border-brand-border rounded-lg overflow-hidden mt-6">
                    {dayNames.map(day => (
                        <div key={day} className="text-center font-semibold py-2 bg-brand-secondary text-brand-tertiary text-xs sm:text-sm">
                            {day}
                        </div>
                    ))}
                    {calendarDays.map((dayInfo, index) => {
                        const dateString = dayInfo.date ? dayInfo.date.toISOString().split('T')[0] : '';
                        const dayTasks = tasksByDate.get(dateString) || [];
                        const isToday = dayInfo.isCurrentMonth && dayInfo.date?.getTime() === today.getTime();
                        const isSelected = selectedDay && dayInfo.isCurrentMonth && dayInfo.date?.getTime() === selectedDay.getTime();
                        
                        return (
                            <div 
                                key={index} 
                                onClick={() => handleDayClick(dayInfo.date)}
                                className={`relative flex flex-col p-1 sm:p-2 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] bg-brand-secondary border-b border-r border-brand-border 
                                    ${dayInfo.isCurrentMonth ? 'hover:bg-brand-primary transition-colors' : 'bg-brand-primary'}
                                    ${dayInfo.isCurrentMonth && 'cursor-pointer'}
                                    ${isSelected ? 'ring-2 ring-inset ring-brand-accent' : ''}`}
                            >
                                 <span className={`text-xs sm:text-sm font-semibold ${!dayInfo.isCurrentMonth ? 'text-brand-tertiary opacity-50' : ''} ${isToday ? 'bg-brand-accent text-white rounded-full flex items-center justify-center h-6 w-6' : 'h-6 w-6 flex items-center justify-center'}`}>
                                    {dayInfo.day}
                                </span>
                                {dayInfo.isCurrentMonth && (
                                    <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
                                        {dayTasks.slice(0, 3).map(task => (
                                            <div 
                                              key={task.id} 
                                              title={`${task.content} (${getGoalTitle(task.goalId)})${task.startTime ? ` - ${task.startTime}` : ''}`} 
                                              className="flex items-baseline gap-1 p-1 text-[10px] sm:text-xs bg-blue-900/50 hover:bg-blue-800/70 border-l-2 border-brand-accent rounded-r-sm"
                                            >
                                                {task.startTime && <span className="font-bold">{task.startTime.slice(0,5)}</span>}
                                                <span className="truncate flex-1">{task.content}</span>
                                            </div>
                                        ))}
                                        {dayTasks.length > 3 && (
                                            <div className="p-1 text-[10px] sm:text-xs text-brand-tertiary">
                                                + {dayTasks.length - 3} más
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedDay && (
                <div className="bg-brand-secondary p-4 sm:p-6 rounded-lg border border-brand-border animate-fade-in">
                    <h3 className="text-lg font-semibold text-brand-accent">
                        Actividades para el {selectedDay.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    {tasksForSelectedDay.length > 0 ? (
                        <ul className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                            {tasksForSelectedDay.map(task => (
                                <li key={task.id} className="bg-brand-primary p-3 rounded-md border-l-4 border-brand-accent">
                                    <p className="font-semibold">{task.content}</p>
                                    <p className="text-sm text-brand-tertiary mt-1">Meta: {getGoalTitle(task.goalId)}</p>
                                    {task.startTime && task.endTime && (
                                        <div className="flex items-center gap-1.5 text-sm text-yellow-300 mt-1">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span>{task.startTime} - {task.endTime}</span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 text-brand-tertiary">No hay tareas programadas para este día.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalendarView;