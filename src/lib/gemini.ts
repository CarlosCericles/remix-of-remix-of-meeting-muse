// Este código conecta tu app con la llave que pusiste en Vercel
export const generateLessonContent = async (userInput: string) => {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    Actúa como profesor de Preply. Transforma el siguiente texto en una lección estructurada:
    1. Título y Objetivos.
    2. Vocabulario clave (5 palabras).
    3. Resumen didáctico.
    4. 3 preguntas de práctica.
    Texto: ${userInput}
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  // Retorna el texto generado por la IA
  return data.candidates[0].content.parts[0].text;
};
