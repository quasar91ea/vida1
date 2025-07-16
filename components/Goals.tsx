/** @jsxRuntime classic */
import * as React from 'react';
import { Goal, GoalStatus, LifePlan } from '../types.ts';
import { useNotification } from '../contexts/NotificationContext.tsx';
import { suggestGoals } from '../services/geminiService.ts';
import Spinner from './common/Spinner.tsx';

interface GoalsProps {
  goals: Goal[];
  lifePlan: LifePlan;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

const GoalCard = ({ goal, onUpdate, onDelete }: { goal: Goal; onUpdate: (goal: Goal) => void; onDelete: (id: string) => void; }) => {
    const statusColor = {
        [GoalStatus.NotStarted]: 'border-gray-500',
        [GoalStatus.InProgress]: 'border-yellow-500',
        [GoalStatus.Completed]: 'border-green-500',
        [GoalStatus.OnHold]: 'border-purple-500',
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate({ ...goal, status: e.target.value as GoalStatus });
    };

    return (
        <div className={`bg-brand-secondary p-5 rounded-lg border-l-4 ${statusColor[goal.status]} flex flex-col justify-between`}>
            <div>
                <h3 className="text-lg md:text-xl font-bold">{goal.title}</h3>
                <p className="text-sm text-brand-tertiary mt-1 mb-2">Vence: {new Date(goal.dueDate).toLocaleDateString()}</p>
                <p className="text-base mb-4">{goal.description}</p>
                <p className="text-xs italic text-brand-tertiary mb-4">Relevancia: {goal.relevance}</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
                <select value={goal.status} onChange={handleStatusChange} className="bg-brand-primary border border-brand-border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
                    {Object.values(GoalStatus).map(status => <option key={status} value={status}>{status}</option>)}
                </select>
                <button onClick={() => onDelete(goal.id)} className="text-red-500 hover:text-red-400 text-sm font-semibold">Eliminar</button>
            </div>
        </div>
    );
};

const Goals = ({ goals, lifePlan, onAddGoal, onUpdateGoal, onDeleteGoal }: GoalsProps) => {
  const [newGoal, setNewGoal] = React.useState({ title: '', description: '', dueDate: '', relevance: '' });
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<{title: string; description: string}[]>([]);
  const { showNotification } = useNotification();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  };

  const handleGetSuggestions = async () => {
      setIsGenerating(true);
      setSuggestions([]);
      try {
          const result = await suggestGoals(lifePlan);
          setSuggestions(result);
          if (!result || result.length === 0) {
              showNotification('La IA no devolvió sugerencias. ¡Inténtalo de nuevo!', 'error', 'Sugerencias Vacías');
          }
      } catch (error) {
          showNotification(error instanceof Error ? error.message : 'Un error desconocido ocurrió.', 'error', 'Error de IA');
      } finally {
          setIsGenerating(false);
      }
  };

  const handleUseSuggestion = (suggestion: { title: string; description: string }) => {
      setNewGoal(prev => ({ ...prev, title: suggestion.title, description: suggestion.description, relevance: 'Sugerido por IA basado en mi propósito.' }));
      setSuggestions([]);
      document.getElementById('goal-form-title')?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.title && newGoal.description && newGoal.dueDate && newGoal.relevance) {
      onAddGoal({ ...newGoal, status: GoalStatus.NotStarted });
      setNewGoal({ title: '', description: '', dueDate: '', relevance: '' });
    } else {
      showNotification('Por favor, completa todos los campos.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">Traduce Tu "Porqué" en "Qué"</h2>
            <p className="text-brand-tertiary mt-2">Establece metas específicas, desafiantes y significativas que se alineen con tu propósito.</p>
        </div>
        
        <div className="bg-brand-secondary p-6 md:p-8 rounded-lg border border-brand-border">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">Añadir Nueva Meta</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input id="goal-form-title" name="title" value={newGoal.title} onChange={handleInputChange} placeholder="Título de la Meta (Específico y Desafiante)" className="w-full bg-brand-primary p-3 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                <textarea name="description" value={newGoal.description} onChange={handleInputChange} placeholder="Descripción (Resultado Medible)" className="w-full bg-brand-primary p-3 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent" rows={3}></textarea>
                <input name="relevance" value={newGoal.relevance} onChange={handleInputChange} placeholder="Relevancia (¿Cómo sirve esto a mi propósito?)" className="w-full bg-brand-primary p-3 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                <input name="dueDate" value={newGoal.dueDate} onChange={handleInputChange} type="date" className="w-full bg-brand-primary p-3 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                <div className="flex flex-col sm:flex-row gap-4">
                    <button type="submit" className="flex-1 py-3 bg-brand-accent hover:bg-blue-500 rounded-md text-white font-bold transition-colors">Añadir Meta</button>
                    <button 
                        type="button" 
                        onClick={handleGetSuggestions}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-secondary border border-brand-accent hover:bg-brand-border rounded-md text-brand-accent font-bold transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isGenerating ? <Spinner /> : '✨'}
                        <span>{isGenerating ? 'Generando...' : 'Sugerencias con IA'}</span>
                    </button>
                </div>
            </form>
        </div>

        {/* AI Suggestions Section */}
        {suggestions.length > 0 && (
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-center text-brand-tertiary">Sugerencias de la IA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestions.map((s, index) => (
                        <div key={index} className="bg-brand-primary border border-dashed border-brand-border p-4 rounded-lg flex flex-col items-start">
                            <h4 className="font-bold text-white">{s.title}</h4>
                            <p className="text-sm text-brand-tertiary mt-2 mb-4 flex-grow">{s.description}</p>
                            <button 
                                onClick={() => handleUseSuggestion(s)}
                                className="w-full mt-auto px-4 py-2 bg-brand-success/20 hover:bg-brand-success/40 text-green-400 rounded-md text-sm font-semibold transition-colors"
                            >
                                Usar esta Meta
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="space-y-4">
             <h3 className="text-xl md:text-2xl font-semibold text-center">Tus Metas</h3>
             {goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} onUpdate={onUpdateGoal} onDelete={onDeleteGoal} />
                    ))}
                </div>
             ) : (
                <p className="text-center text-brand-tertiary">Aún no hay metas. ¡Añade una arriba para empezar!</p>
             )}
        </div>
    </div>
  );
};

export default Goals;
