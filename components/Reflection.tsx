/** @jsxRuntime classic */
import * as React from 'react';
import { ReflectionEntry } from '../types.ts';
import { Icon } from './icons/Icon.tsx';

const reflectionPrompts = [
  "¿Cuál fue el mayor desafío que enfrentaste hoy y cómo lo manejaste?",
  "¿Qué pequeña victoria o momento de alegría celebraste hoy?",
  "¿Qué aprendiste sobre ti mismo o sobre tus metas hoy?",
  "Si pudieras hacer una cosa de manera diferente hoy, ¿qué sería y por qué?",
  "¿De qué te sientes más agradecido en este momento?",
  "¿Qué acción tomaste hoy que te acerca a la persona que quieres ser?",
  "Describe un momento en el que te sentiste completamente enfocado o 'en la zona'.",
  "¿Qué obstáculo inesperado surgió y qué estrategia usaste para superarlo?",
  "¿Cómo has aplicado tus valores fundamentales en tus acciones de hoy?",
  "¿Qué conversación o interacción de hoy te dejó pensando?",
];

interface ReflectionProps {
  entries: ReflectionEntry[];
  onAddEntry: (entry: Omit<ReflectionEntry, 'id'|'date'>) => void;
}

const Reflection = ({ entries, onAddEntry }: ReflectionProps) => {
  const [newEntry, setNewEntry] = React.useState<{ content: string; imageUrl: string | null }>({ content: '', imageUrl: null });
  const [prompt, setPrompt] = React.useState('¿Qué aprendiste hoy?');

  const fetchPrompt = React.useCallback(() => {
    const randomIndex = Math.floor(Math.random() * reflectionPrompts.length);
    setPrompt(reflectionPrompts[randomIndex]);
  }, []);
  
  React.useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEntry(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.content.trim() || newEntry.imageUrl) {
      onAddEntry({ content: newEntry.content, imageUrl: newEntry.imageUrl ?? undefined });
      setNewEntry({ content: '', imageUrl: null });
      fetchPrompt();
    }
  };

  const groupedEntries = React.useMemo(() => {
    const groups = new Map<string, ReflectionEntry[]>();
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const monthYearKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!groups.has(monthYearKey)) {
            groups.set(monthYearKey, []);
        }
        groups.get(monthYearKey)!.push(entry);
    });
    return new Map([...groups.entries()].sort().reverse());
  }, [entries]);

  const [openMonth, setOpenMonth] = React.useState<string | null>(null);

  React.useEffect(() => {
      const firstMonthKey = groupedEntries.keys().next().value;
      setOpenMonth(firstMonthKey || null);
  }, [groupedEntries]);

  const formatMonthKey = (key: string) => {
      const [year, month] = key.split('-');
      const date = new Date(Number(year), Number(month) - 1, 2);
      const formatted = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">El Motor: Autorregulación y Reflexión</h2>
            <p className="text-brand-tertiary mt-2">Aprende de tu viaje. Reflexiona sobre tu progreso, desafíos y éxitos para adaptarte y crecer.</p>
        </div>
        
        <div className="bg-brand-secondary p-6 md:p-8 rounded-lg border border-brand-border">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">Nueva Entrada de Reflexión</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-base md:text-lg font-medium text-brand-tertiary italic">"{prompt}"</label>
                <textarea 
                    value={newEntry.content} 
                    onChange={(e) => setNewEntry(prev => ({...prev, content: e.target.value}))} 
                    placeholder="Escribe tus pensamientos aquí..." 
                    className="w-full bg-brand-primary p-3 rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    rows={6}
                />

                {newEntry.imageUrl && (
                  <div className="my-2 text-center">
                      <img src={newEntry.imageUrl} alt="Vista previa de la reflexión" className="max-h-48 rounded-lg mx-auto border-2 border-brand-border" />
                      <button type="button" onClick={() => setNewEntry(prev => ({ ...prev, imageUrl: null }))} className="text-xs text-red-500 hover:text-red-400 mt-2">
                          Quitar imagen
                      </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-brand-accent hover:bg-blue-500 rounded-md text-white font-bold transition-colors">Guardar Entrada</button>
                    <div className="flex items-center gap-4">
                        <label htmlFor="reflection-image-upload" className="cursor-pointer text-sm text-brand-tertiary hover:text-white flex items-center gap-2 transition-colors">
                           <Icon>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           </Icon>
                            Añadir foto
                        </label>
                        <input 
                            id="reflection-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        <button type="button" onClick={fetchPrompt} className="text-sm text-brand-tertiary hover:text-white">Nueva pregunta</button>
                    </div>
                </div>
            </form>
        </div>
        
        <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-center">Reflexiones Pasadas</h3>
            {entries.length > 0 ? (
                <div className="max-h-[40rem] overflow-y-auto p-2 space-y-2">
                    {Array.from(groupedEntries.entries()).map(([monthKey, monthEntries]) => {
                        const isOpen = openMonth === monthKey;
                        return (
                            <div key={monthKey} className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
                                <button 
                                    onClick={() => setOpenMonth(prev => prev === monthKey ? null : monthKey)}
                                    className="w-full flex justify-between items-center p-4 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <span className="font-semibold text-lg text-brand-accent">{formatMonthKey(monthKey)}</span>
                                    <Icon className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </Icon>
                                </button>
                                <div className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="p-4 border-t border-brand-border space-y-4">
                                            {monthEntries.map(entry => (
                                                <div key={entry.id} className="bg-brand-primary p-4 rounded-lg">
                                                    <p className="text-sm text-brand-tertiary mb-3">{new Date(entry.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                                                    {entry.imageUrl && (
                                                      <img src={entry.imageUrl} alt={`Reflexión visual del ${new Date(entry.date).toLocaleDateString()}`} className="rounded-lg mb-3 max-h-72 w-auto mx-auto border-2 border-brand-border" />
                                                    )}
                                                    {entry.content && (
                                                      <p className="whitespace-pre-wrap text-brand-tertiary">{entry.content}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-brand-tertiary">Aún no hay entradas de reflexión. Empieza respondiendo a la pregunta de arriba.</p>
            )}
        </div>
    </div>
  );
};

export default Reflection;