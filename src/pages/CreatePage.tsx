const handleSubmit = async () => {
    if (!content.trim() && !audioFile) {
      toast.error('Sube un audio o pega el texto');
      return;
    }

    setIsProcessing(true);
    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;

    try {
      let requestBody;
      // Prompt optimizado para clases largas de Preply
      const prompt = "Analiza estos 50 minutos de clase de idiomas. Genera un PDF de repaso para el alumno con: 1. Resumen de la gramática vista. 2. Lista de vocabulario nuevo con traducción al español. 3. Errores comunes que el alumno cometió y sus correcciones. 4. Tarea personalizada para la próxima sesión.";

      if (audioFile) {
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
          contents: [{ parts: [{ text: `${prompt} Texto: ${content}` }] }]
        };
      }

      // Añadimos un aviso de paciencia para clases largas
      toast.info("Procesando 50 min de audio... Esto puede tardar hasta un minuto.", { duration: 10000 });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('El archivo es demasiado grande o la API falló');

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;

      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(resultText, 180);
      doc.setFontSize(11);
      doc.text(splitText, 15, 20);
      doc.save(`Resumen_Clase_Larga_${new Date().getTime()}.pdf`);
      toast.success('¡PDF de 50 min generado con éxito!');
      
    } catch (error) {
      console.error(error);
      toast.error('Error: El audio es muy pesado. Intenta grabarlo en menor calidad o convertirlo a MP3 pequeño.');
    } finally {
      setIsProcessing(false);
    }
  };
