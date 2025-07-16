/** @jsxRuntime classic */
import * as React from 'react';
import { LifePlan } from '../types.ts';
import { useNotification } from '../contexts/NotificationContext.tsx';

interface PurposeProps {
  lifePlan: LifePlan;
  setLifePlan: (plan: LifePlan) => void;
}

const Purpose = ({ lifePlan, setLifePlan }: PurposeProps) => {
  const [localPlan, setLocalPlan] = React.useState<LifePlan>(lifePlan);
  const { showNotification } = useNotification();

  const handlePurposeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPlan({ ...localPlan, purpose: e.target.value });
  };
  
  const handleVisionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPlan({ ...localPlan, vision: e.target.value });
  };
  
  const handleValuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPlan({ ...localPlan, values: e.target.value.split(',').map(v => v.trim()) });
  };

  const handleSaveChanges = () => {
    setLifePlan(localPlan);
    showNotification('¡Plan de Vida actualizado con éxito!', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">Define Tu "Porqué"</h2>
        <p className="text-brand-tertiary mt-2">Un propósito claro es la base de una vida significativa. Es la brújula que guía tus metas y acciones.</p>
      </div>
      
      <div className="bg-brand-secondary p-6 md:p-8 rounded-lg border border-brand-border space-y-6">
        <div>
          <label htmlFor="purpose" className="block text-base md:text-lg font-semibold mb-2">Mi Declaración de Propósito</label>
          <textarea
            id="purpose"
            value={localPlan.purpose}
            onChange={handlePurposeChange}
            className="w-full bg-brand-primary border border-brand-border rounded-md p-3 focus:ring-2 focus:ring-brand-accent focus:outline-none"
            rows={4}
            placeholder="Ej: Inspirar la creatividad y empoderar a otros para que construyan sus sueños."
          />
        </div>
        
        <div>
          <label htmlFor="values" className="block text-base md:text-lg font-semibold mb-2">Mis Valores Fundamentales</label>
          <input
            id="values"
            type="text"
            value={localPlan.values.join(', ')}
            onChange={handleValuesChange}
            className="w-full bg-brand-primary border border-brand-border rounded-md p-3 focus:ring-2 focus:ring-brand-accent focus:outline-none"
            placeholder="Ej: Creatividad, Integridad, Crecimiento, Compasión"
          />
          <p className="text-xs text-brand-tertiary mt-1">Separa los valores con una coma.</p>
        </div>
        
        <div>
          <label htmlFor="vision" className="block text-base md:text-lg font-semibold mb-2">Mi Visión a Largo Plazo</label>
          <textarea
            id="vision"
            value={localPlan.vision}
            onChange={handleVisionChange}
            className="w-full bg-brand-primary border border-brand-border rounded-md p-3 focus:ring-2 focus:ring-brand-accent focus:outline-none"
            rows={4}
            placeholder="Describe tu futuro ideal en 5-10 años. ¿Cómo es tu vida?"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={handleSaveChanges}
          className="px-6 py-2 bg-brand-accent hover:bg-blue-500 rounded-md text-white font-bold transition-colors w-full md:w-auto"
        >
          Guardar Plan de Vida
        </button>
      </div>
    </div>
  );
};

export default Purpose;