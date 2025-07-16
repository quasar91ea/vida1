/** @jsxRuntime classic */
import * as React from 'react';

const PomodoroTimer = () => {
    const [minutes, setMinutes] = React.useState(25);
    const [seconds, setSeconds] = React.useState(0);
    const [isActive, setIsActive] = React.useState(false);
    const [isBreak, setIsBreak] = React.useState(false);
    
    const toggle = () => {
        setIsActive(!isActive);
    };

    const reset = React.useCallback(() => {
        setIsActive(false);
        setIsBreak(false);
        setMinutes(25);
        setSeconds(0);
    }, []);

    React.useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                }
                if (seconds === 0) {
                    if (minutes === 0) {
                        if (interval) clearInterval(interval);
                        
                        const newIsBreak = !isBreak;
                        setIsBreak(newIsBreak);
                        setMinutes(newIsBreak ? 5 : 25);
                        setIsActive(false);
                        new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3').play();
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                }
            }, 1000);
        } else if (!isActive && seconds !== 0) {
             if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, seconds, minutes, isBreak]);

    return (
        <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border text-center">
            <h3 className="text-xl font-semibold mb-2">{isBreak ? '¡Tiempo de Descanso!' : 'Sesión de Enfoque'}</h3>
            
            <div className="text-6xl font-bold my-4">
                {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
            <div className="flex justify-center gap-4">
                <button 
                    onClick={toggle} 
                    className="px-6 py-2 bg-brand-accent hover:bg-blue-500 rounded-md text-white font-bold transition-colors"
                >
                    {isActive ? 'Pausar' : 'Iniciar'}
                </button>
                <button onClick={reset} className="px-6 py-2 bg-brand-tertiary hover:bg-gray-500 rounded-md text-white font-bold transition-colors">
                    Reiniciar
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;