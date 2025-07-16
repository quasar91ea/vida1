/** @jsxRuntime classic */
import * as React from 'react';
import ChartComponent from './common/Chart.tsx';

const InfoView = () => {
    const [activePhase, setActivePhase] = React.useState('forethought');
    const [activeTactic, setActiveTactic] = React.useState('eisenhower');

    // --- Data Definitions ---
    const phasesData = {
        forethought: {
            title: '1. Fase de Previsión (Antes de actuar)',
            description: 'Es la fase de planificación estratégica. Aquí se establecen metas específicas derivadas del plan de vida, se diseñan estrategias y se gestiona el tiempo. Es un proceso proactivo que prepara el terreno para la acción.',
            points: ['<strong>Análisis de la Tarea:</strong> Descomponer metas complejas en pasos manejables.', '<strong>Autoeficacia:</strong> La creencia en la propia capacidad para tener éxito es un predictor clave del compromiso con metas desafiantes.', '<strong>Base Neurobiológica:</strong> El córtex prefrontal (PFC), el "CEO del cerebro", es crucial para la planificación a largo plazo, la toma de decisiones y la inhibición de impulsos.']
        },
        performance: {
            title: '2. Fase de Ejecución (Durante la acción)',
            description: 'Implementas las estrategias planificadas. Esta fase no es una ejecución ciega; requiere un monitoreo constante del progreso y del entorno para hacer ajustes en tiempo real.',
            points: ['<strong>Auto-observación:</strong> Prestar atención deliberada al propio rendimiento para recopilar datos sobre qué funciona y qué no.', '<strong>Control Volitivo:</strong> Esfuerzo consciente para mantener el enfoque en la tarea y resistir distracciones internas y externas.', '<strong>Base Neurobiológica:</strong> Los ganglios basales son fundamentales, usando la vía "GO" para iniciar acciones relevantes para la meta y la vía "NO GO" para inhibir las irrelevantes.']
        },
        reflection: {
            title: '3. Fase de Autorreflexión (Después de actuar)',
            description: 'Es la fase de aprendizaje y adaptación. Se evalúa el rendimiento comparándolo con la meta, lo que genera reacciones emocionales y juicios cognitivos que informarán el siguiente ciclo.',
            points: ['<strong>Autoevaluación:</strong> Comparación del resultado con el estándar de la meta.', '<strong>Atribuciones Causales:</strong> Analizar las causas del éxito o fracaso (¿fue mi esfuerzo, la estrategia, la suerte?). Atribuciones correctas son clave para el aprendizaje.', '<strong>Base Neurobiológica:</strong> La Red Neuronal por Defecto (DMN) se activa durante el descanso y la introspección, siendo vital para consolidar la memoria, la introspección y la planificación futura.']
        }
    };
    
    const tacticsData = {
        eisenhower: {
            title: 'Matriz de Eisenhower',
            principle: 'Priorización basada en la distinción entre urgencia e importancia.',
            application: 'Clasifica las tareas en 4 cuadrantes (Urgente/Importante, No Urgente/Importante, etc.) para enfocarte en lo estratégico (Cuadrante II) y evitar la "tiranía de lo urgente".',
            strength: 'Fortaleza: Excelente para la planificación estratégica y para diferenciar el trabajo reactivo del proactivo.',
            limit: 'Limitación: La distinción puede ser subjetiva y cambiar con el contexto, requiriendo reevaluación constante.'
        },
        pareto: {
            title: 'Principio de Pareto (80/20)',
            principle: 'La mayoría de los resultados (80%) proviene de una minoría de esfuerzos (20%).',
            application: 'Identifica y concéntrate en las actividades de mayor impacto que generan la mayoría de tus resultados deseados. Es un principio de enfoque.',
            strength: 'Fortaleza: Promueve una alta eficiencia al concentrar recursos en lo que realmente importa.',
            limit: 'Limitación: Identificar el 20% vital no siempre es sencillo y puede requerir un análisis de datos previo.'
        },
        pomodoro: {
            title: 'Técnica Pomodoro',
            principle: 'Gestión de la atención y la fatiga cognitiva mediante intervalos de trabajo y descanso.',
            application: 'Trabaja en bloques de 25 minutos de alta concentración, seguidos de breves descansos (5 min). Después de 4 bloques, toma un descanso más largo.',
            strength: 'Fortaleza: Combate la procrastinación, mejora el enfoque y previene el agotamiento mental.',
            limit: 'Limitación: Las interrupciones externas pueden romper el flujo; menos ideal para tareas que requieren colaboración constante.'
        },
        alpen: {
            title: 'Método ALPEN',
            principle: 'Planificación diaria estructurada y realista que incorpora tiempo para imprevistos.',
            application: 'Un proceso de 5 pasos: 1. Listar Actividades. 2. Estimar Longitud. 3. Planificar Búfer (planificar solo ~60% del tiempo). 4. Establecer prioridades. 5. Notas para el día siguiente.',
            strength: 'Fortaleza: Reduce la frustración de no completar la lista de tareas al ser inherentemente realista.',
            limit: 'Limitación: Requiere una disciplina diaria rigurosa para ser efectivo a largo plazo.'
        }
    };

    // --- Chart Configurations ---
    const textColors = '#8B949E';
    const gridColors = '#30363D';
    const accentColor = '#58A6FF';
    const accentColorLight = 'rgba(88, 166, 255, 0.2)';
    const secondaryColor = '#3272d8';
    const secondaryColorLight = 'rgba(50, 114, 216, 0.2)';
    const riskColor = '#F87171';
    
    const gstPrinciplesConfig = {
        type: 'bar',
        data: {
            labels: ['Claridad', 'Desafío', 'Compromiso', 'Retroalimentación', 'Complejidad'],
            datasets: [{
                label: 'Impacto en la Motivación',
                data: [8, 10, 9, 8.5, 7],
                backgroundColor: [accentColor, secondaryColor, accentColor, secondaryColor, textColors],
                borderColor: '#161B22', borderWidth: 2, borderRadius: 5,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, max: 10, ticks: { color: textColors }, grid: { color: gridColors } }, y: { ticks: { color: textColors }, grid: { color: gridColors } } }
        }
    };

    const goalEffectivenessConfig = {
        type: 'bar',
        data: {
            labels: ['Metas Vagas', 'Metas Específicas y Desafiantes'],
            datasets: [
                { label: 'Rendimiento', data: [40, 90], backgroundColor: secondaryColor, borderRadius: 5 },
                { label: 'Bienestar / Satisfacción', data: [65, 80], backgroundColor: accentColor, borderRadius: 5 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { color: textColors } } },
            scales: { x: { ticks: { color: textColors }, grid: { color: gridColors } }, y: { beginAtZero: true, max: 100, ticks: { color: textColors }, grid: { color: gridColors } } }
        }
    };
    
    const goalRisksConfig = {
        type: 'doughnut',
        data: {
            labels: ['Enfoque Estrecho', 'Agotamiento (Burnout)', 'Comportamiento No Ético'],
            datasets: [{
                label: 'Riesgos Potenciales', data: [40, 35, 25],
                backgroundColor: [riskColor, secondaryColor, textColors], borderColor: '#161B22', borderWidth: 4,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: textColors } } }
        }
    };

    const culturalMotivationConfig = {
        type: 'radar',
        data: {
            labels: ['Logro Personal', 'Autonomía', 'Armonía Grupal', 'Obligación Social', 'Aprobación Social'],
            datasets: [{
                label: 'Cultura Individualista', data: [9, 8.5, 4, 3, 5],
                backgroundColor: accentColorLight, borderColor: accentColor, pointBackgroundColor: accentColor
            }, {
                label: 'Cultura Colectivista', data: [6, 5.5, 9.5, 9, 8],
                backgroundColor: secondaryColorLight, borderColor: secondaryColor, pointBackgroundColor: secondaryColor
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { color: textColors } } },
            scales: { r: { angleLines: { color: gridColors }, grid: { color: gridColors }, pointLabels: { color: textColors, font: { size: 11 } }, ticks: { display: false, beginAtZero: true, max: 10 } } }
        }
    };
    
    const phaseIcons = ['🤔', '🏃‍♀️', '📈'];
    const phaseKeys = Object.keys(phasesData);

    return (
        <div className="animate-fade-in space-y-12">
            {/* Framework Section */}
            <section id="framework">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">La Jerarquía de la Efectividad</h2>
                    <p className="mt-2 max-w-3xl mx-auto text-brand-tertiary">La efectividad surge de alinear tus acciones diarias con un propósito superior, creando una sinergia entre el porqué, el qué y el cómo.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border flex flex-col hover:border-brand-accent transition-colors">
                        <div className="text-5xl mb-4">🧭</div>
                        <h3 className="text-xl font-bold text-white mb-2">1. Plan de Vida (El "Porqué")</h3>
                        <p className="text-sm text-brand-tertiary flex-grow">Es tu brújula interna. Define un propósito que organiza y estimula metas, gestiona comportamientos y proporciona un sentido de significado.</p>
                    </div>
                    <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border flex flex-col hover:border-brand-accent transition-colors">
                        <div className="text-5xl mb-4">🎯</div>
                        <h3 className="text-xl font-bold text-white mb-2">2. Metas (El "Qué")</h3>
                        <p className="text-sm text-brand-tertiary flex-grow">Traducen el "porqué" en un "qué" específico y medible. Deben ser desafiantes para dirigir la atención, movilizar el esfuerzo y aumentar la persistencia.</p>
                    </div>
                    <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border flex flex-col hover:border-brand-accent transition-colors">
                        <div className="text-5xl mb-4">⚙️</div>
                        <h3 className="text-xl font-bold text-white mb-2">3. Gestión del Tiempo (El "Cómo")</h3>
                        <p className="text-sm text-brand-tertiary flex-grow">Las herramientas de ejecución para estructurar, proteger y adaptar el tiempo. Incluye la planificación, priorización y organización de tareas.</p>
                    </div>
                </div>
            </section>
            
            {/* Engine Section */}
            <section id="engine">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">El Motor Psicológico: Autorregulación</h2>
                    <p className="mt-2 max-w-3xl mx-auto text-brand-tertiary">Este sistema es impulsado por un proceso cíclico. Haz clic en cada fase para explorar sus componentes.</p>
                </div>
                <div className="flex flex-col lg:flex-row items-stretch gap-6">
                    <div className="w-full lg:w-1/3 flex lg:flex-col justify-around gap-4">
                        {phaseKeys.map((key, index) => (
                            <div key={key} onClick={() => setActivePhase(key)} className={`flex-1 flex flex-col items-center justify-center text-center p-4 bg-brand-secondary rounded-lg border border-brand-border cursor-pointer transition-all duration-300 ${activePhase === key ? 'ring-2 ring-brand-accent scale-105' : 'hover:border-brand-tertiary'}`}>
                                <div className="text-4xl mb-2">{phaseIcons[index]}</div>
                                <h4 className={`font-bold ${activePhase === key ? 'text-white' : 'text-brand-tertiary'}`}>{(phasesData as any)[key].title.split(' ')[1]}</h4>
                            </div>
                        ))}
                    </div>
                    <div className="w-full lg:w-2/3 bg-brand-secondary p-6 rounded-lg border border-brand-border min-h-[300px] animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-3">{(phasesData as any)[activePhase].title}</h3>
                        <p className="text-brand-tertiary mb-4">{(phasesData as any)[activePhase].description}</p>
                        <ul className="space-y-3 text-sm text-brand-tertiary">
                            {(phasesData as any)[activePhase].points.map((p: string, i: number) => (
                                <li key={i} className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span><span dangerouslySetInnerHTML={{ __html: p }}></span></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
            
            {/* Anatomy Section */}
            <section id="anatomy">
                 <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">Anatomía de una Meta Efectiva</h2>
                    <p className="mt-2 max-w-3xl mx-auto text-brand-tertiary">No todas las metas son iguales. El tipo de meta debe equilibrar el rendimiento con el bienestar.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
                        <h3 className="text-lg font-semibold text-center mb-4 text-white">Principios Fundamentales (GST)</h3>
                        <div className="h-80"><ChartComponent id="gstPrinciplesChart" config={gstPrinciplesConfig as any} /></div>
                    </div>
                     <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
                        <h3 className="text-lg font-semibold text-center mb-4 text-white">Efectividad vs. Bienestar</h3>
                        <div className="h-80"><ChartComponent id="goalEffectivenessChart" config={goalEffectivenessConfig as any} /></div>
                    </div>
                </div>
            </section>

            {/* Tactics Section */}
            <section id="tactics">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">Tácticas de Gestión del Tiempo</h2>
                    <p className="mt-2 max-w-2xl mx-auto text-brand-tertiary">Explora diferentes modelos. Cada uno se basa en un principio psicológico distinto.</p>
                </div>
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {Object.keys(tacticsData).map(key => (
                             <button key={key} onClick={() => setActiveTactic(key)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeTactic === key ? 'bg-brand-accent text-white' : 'bg-brand-secondary text-brand-tertiary hover:bg-brand-border'}`}>
                                {(tacticsData as any)[key].title}
                            </button>
                        ))}
                    </div>
                    <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border min-h-[180px] animate-fade-in">
                        <h3 className="text-lg font-bold text-white mb-2">{(tacticsData as any)[activeTactic].title}</h3>
                        <p className="text-sm mb-2"><strong className="text-brand-tertiary">Principio:</strong> {(tacticsData as any)[activeTactic].principle}</p>
                        <p className="text-sm mb-2"><strong className="text-brand-tertiary">Aplicación:</strong> {(tacticsData as any)[activeTactic].application}</p>
                        <p className="text-xs text-green-400 mb-1">✓ {(tacticsData as any)[activeTactic].strength}</p>
                        <p className="text-xs text-red-400">✗ {(tacticsData as any)[activeTactic].limit}</p>
                    </div>
                </div>
            </section>
            
             {/* Nuances Section */}
            <section id="nuances">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-accent">Matices y Consideraciones Críticas</h2>
                    <p className="mt-2 max-w-3xl mx-auto text-brand-tertiary">La ciencia también advierte sobre los riesgos de un enfoque simplista.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
                        <h3 className="text-lg font-semibold text-center mb-4 text-white">Riesgos de Metas Mal Establecidas</h3>
                        <div className="h-80"><ChartComponent id="goalRisksChart" config={goalRisksConfig as any} /></div>
                    </div>
                     <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
                        <h3 className="text-lg font-semibold text-center mb-4 text-white">Motivación y Contexto Cultural</h3>
                        <div className="h-80"><ChartComponent id="culturalMotivationChart" config={culturalMotivationConfig as any} /></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default InfoView;