const handleSubmit = async () => {
  if (!content.trim() && !audioFile) {
    toast.error('Sube un audio o pega el chat de la clase');
    return;
  }

  setIsProcessing(true);
  
  // 1. Validamos la Key antes de disparar
  const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.error("ERROR: VITE_GOOGLE_AI_KEY no detectada. Revisa Vercel Settings y haz Redeploy.");
    toast.error("Error de configuración: API Key no encontrada.");
    setIsProcessing(false);
    return;
  }

  try {
    let requestBody;
    const prompt = "Actúa como un profesor de Preply. Analiza el contenido de la clase y genera un PDF de repaso en español que incluya: 1. Título dinámico. 2. Resumen de gramática. 3. Vocabulario nuevo. 4. Errores detectados y su corrección. 5. Tarea. Usa un tono motivador.";

    if (audioFile) {
      toast.info("Procesando audio... Esto puede tardar hasta 1 minuto para clases largas.", { duration: 8000 });
      const base64Audio = await fileToBase64(audioFile);
      requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: audioFile.type, data: base64Audio } }
          ]
        }]
      };
    } else {
      requestBody = {
        contents: [{ parts: [{ text: `${prompt} Texto de la clase: ${content}` }] }]
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    // 2. Si Google responde error, lo capturamos aquí
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de Google API:", errorData);
      throw new Error(errorData.error?.message || 'Error en la API de Google');
    }

    const data = await response.json();
    
    // 3. Validamos que la respuesta tenga contenido
    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
      throw new Error('La IA no pudo generar una respuesta clara.');
    }

    const resultText = data.candidates[0].content.parts[0].text;

    // Generación del PDF
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(resultText, 180);
    doc.setFontSize(11);
    doc.text(splitText, 15, 20);
    doc.save(`Material_Repaso_Preply_${new Date().getTime()}.pdf`);
    
    toast.success('¡Material de repaso generado!');
    
  } catch (error: any) {
    console.error("Detalle del error:", error);
    toast.error(`Error: ${error.message || 'El audio es demasiado pesado o la conexión falló'}`);
  } finally {
    setIsProcessing(false);
  }
};
