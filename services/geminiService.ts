/** @jsxRuntime classic */
import { GoogleGenAI, Type } from "@google/genai";
import type { LifePlan } from '../types.ts';

// NOTA: Se espera que la clave de API esté disponible como una variable de entorno `process.env.API_KEY`.
// En un entorno de navegador para un sitio estático, esta gestión de claves
// necesitaría un proxy de backend seguro para evitar exponer la clave.
// Para el propósito de este entorno, asumimos que `process.env.API_KEY` está inyectado.

const getAi = () => {
    if (!process.env.API_KEY) {
        // En una aplicación real, es posible que desees deshabilitar las funciones de IA o mostrar un mensaje.
        throw new Error("La variable de entorno API_KEY no está configurada.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Definir el esquema JSON esperado para la respuesta
const goalSuggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: "Un título conciso y motivador para la meta."
            },
            description: {
                type: Type.STRING,
                description: "Una descripción detallada de la meta, explicando qué se logrará."
            }
        },
        required: ["title", "description"]
    }
};


export const suggestGoals = async (lifePlan: LifePlan): Promise<{title: string, description: string}[]> => {
    try {
        const ai = getAi();
        const prompt = `Basado en el siguiente plan de vida de un usuario, sugiere 3 metas específicas y accionables que se alineen con él.
        
        Propósito de vida: "${lifePlan.purpose}"
        Valores fundamentales: "${lifePlan.values.join(', ')}"
        Visión a largo plazo: "${lifePlan.vision}"

        Las metas deben ser inspiradoras y prácticas. Devuelve el resultado exclusivamente en formato JSON, siguiendo el esquema proporcionado.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: goalSuggestionSchema,
            },
        });
        
        let jsonText = response.text.trim();
        // Limpieza básica por si la respuesta no es un JSON perfecto
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\s*|```$/g, '');
        }
        
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error);
        // Propagar un error amigable para el usuario
        throw new Error("No se pudieron generar las sugerencias de metas. Verifica la configuración de la API o inténtalo más tarde.");
    }
};
