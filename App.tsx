/** @jsxRuntime classic */
import * as React from 'react';
import { LifePlan, Goal, Task, ReflectionEntry, AppView, GoalStatus, TaskStatus } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import Purpose from './components/Purpose.tsx';
import Goals from './components/Goals.tsx';
import ActionPlan from './components/ActionPlan.tsx';
import Reflection from './components/Reflection.tsx';
import CalendarView from './components/CalendarView.tsx';
import StatisticsView from './components/StatisticsView.tsx';
import InfoView from './components/InfoView.tsx';
import { Icon } from './components/icons/Icon.tsx';

const App = () => {
  const [view, setView] = React.useState<AppView>('dashboard');
  
  // State management with localStorage persistence
  const usePersistentState = <T,>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = React.useState<T>(() => {
      try {
        const storedValue = window.localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : initialState;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return initialState;
      }
    });

    React.useEffect(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }, [key, state]);

    return [state, setState];
  };
  
  React.useEffect(() => {
    // Register the service worker for PWA offline capabilities.
    // We do this in a useEffect hook within the main App component to ensure
    // the document is in a stable state after the initial render.
    if ('serviceWorker' in navigator) {
      // We use the 'load' event to ensure registration doesn't interfere
      // with the app's initial paint and interactivity.
      window.addEventListener('load', () => {
        // Construct an absolute URL to avoid cross-origin issues.
        const swUrl = `${window.location.origin}/sw.js?v=8`;
        navigator.serviceWorker.register(swUrl)
          .then(registration => {
            console.log('Service Worker registered successfully with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []); // Empty dependency array ensures this runs only once.

  const [lifePlan, setLifePlan] = usePersistentState<LifePlan>('nq_lifePlan', {
    purpose: 'Construir una vida con propósito, crecimiento e impacto positivo.',
    values: ['Integridad', 'Aprendizaje', 'Creatividad'],
    vision: 'Ser un experto reconocido en mi campo, disfrutando de una vida equilibrada con relaciones sólidas.'
  });

  const [goals, setGoals] = usePersistentState<Goal[]>('nq_goals', []);

  const [tasks, setTasks] = usePersistentState<Task[]>('nq_tasks', []);

  const [reflections, setReflections] = usePersistentState<ReflectionEntry[]>('nq_reflections', []);

  // Handlers
  const addGoal = (goal: Omit<Goal, 'id'>) => setGoals(prev => [...prev, { ...goal, id: `g${Date.now()}` }]);
  const updateGoal = (updatedGoal: Goal) => setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  
  const addTask = (task: Omit<Task, 'id'>) => setTasks(prev => [...prev, { ...task, id: `t${Date.now()}` }]);
  const updateTask = (updatedTask: Task) => setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  
  const addReflection = (entry: Omit<ReflectionEntry, 'id'|'date'>) => setReflections(prev => [{...entry, id: `r${Date.now()}`, date: new Date().toISOString() }, ...prev]);

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard lifePlan={lifePlan} goals={goals} tasks={tasks} onNavigate={(v) => setView(v)} onUpdateTask={updateTask} />;
      case 'purpose':
        return <Purpose lifePlan={lifePlan} setLifePlan={setLifePlan} />;
      case 'goals':
        return <Goals goals={goals} lifePlan={lifePlan} onAddGoal={addGoal} onUpdateGoal={updateGoal} onDeleteGoal={deleteGoal} />;
      case 'action':
        return <ActionPlan tasks={tasks} goals={goals} onAddTask={addTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} />;
      case 'reflection':
        return <Reflection entries={reflections} onAddEntry={addReflection} />;
      case 'calendar':
        return <CalendarView tasks={tasks} goals={goals} />;
      case 'statistics':
        return <StatisticsView tasks={tasks} goals={goals} />;
      case 'info':
        return <InfoView />;
      default:
        return <Dashboard lifePlan={lifePlan} goals={goals} tasks={tasks} onNavigate={(v) => setView(v)} onUpdateTask={updateTask}/>;
    }
  };
  
    const navItems = [
    { view: 'dashboard', label: 'Panel', shortLabel: 'Panel', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></Icon> },
    { view: 'purpose', label: "Propósito", shortLabel: 'Propósito', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></Icon> },
    { view: 'goals', label: "Metas", shortLabel: 'Metas', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></Icon> },
    { view: 'action', label: "Acción", shortLabel: 'Acción', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></Icon> },
    { view: 'calendar', label: 'Calendario', shortLabel: 'Calendario', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></Icon> },
    { view: 'statistics', label: 'Estadísticas', shortLabel: 'Stats', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M12 20V10M18 20V4M6 20V16" /></Icon> },
    { view: 'reflection', label: 'Reflexión', shortLabel: 'Reflexión', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></Icon> },
    { view: 'info', label: 'Información', shortLabel: 'Info', icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon> }
  ];


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-primary">
      {/* --- DESKTOP NAVIGATION (Sidebar) --- */}
      <nav className="hidden md:flex flex-col bg-brand-secondary border-r border-brand-border p-4 w-64 shrink-0">
        <h1 className="text-2xl font-bold mb-8 text-white text-left">Nuevo Quásar</h1>
        <div className="flex flex-col gap-2">
            {navItems.map(item => (
                <button
                  key={item.view}
                  onClick={() => setView(item.view as AppView)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left ${view === item.view ? 'bg-brand-accent text-white' : 'text-brand-tertiary hover:bg-brand-secondary hover:text-white'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
            ))}
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto pb-20 md:pb-6">
        {renderView()}
      </main>

      {/* --- MOBILE NAVIGATION (Bottom Bar) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-secondary border-t border-brand-border h-16 flex justify-around items-stretch z-10">
        {navItems.map(item => (
            <button
              key={`mobile-${item.view}`}
              onClick={() => setView(item.view as AppView)}
              className={`flex flex-col items-center justify-center flex-1 p-1 text-xs transition-colors ${view === item.view ? 'text-brand-accent' : 'text-brand-tertiary'}`}
              aria-label={item.label}
            >
              {item.icon}
              <span className="mt-1">{item.shortLabel}</span>
            </button>
        ))}
      </nav>
    </div>
  );
};

export default App;