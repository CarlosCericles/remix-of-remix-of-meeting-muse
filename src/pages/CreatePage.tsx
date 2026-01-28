import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, FileAudio } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

const CreatePage = () => {
  const [content, setContent] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('audio/')) {
      setAudioFile(file);
      setContent('');
      toast.success(`Audio detectado: ${file.name}`);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !audioFile) {
      toast.error('Sube un audio o pega el texto');
      return;
    }

    setIsProcessing(true);
    
    // PONES TU CLAVE AQUÍ ABAJO:
    const apiKey = "AIzaSyB6qxAoJtXleLIG0Y5tu-cNBjaZUKi3S7Q";

    try {
      let requestBody;
      const prompt = "Actúa como profesor de Preply. Analiza el contenido y genera un resumen en español con: 1. Gramática, 2. Vocabulario, 3. Errores comunes, 4. Tarea.";

      if (audioFile) {
        toast.info("Procesando audio con Gemini 3...");
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

      // ACTUALIZADO A GEMINI 3 FLASH PREVIEW (Versión v1beta según docs)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.error) {
        alert("Google Gemini 3 dice: " + data.error.message);
        setIsProcessing(false);
        return;
      }

      const resultText = data.candidates[0].content.parts[0].text;

      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(resultText, 180);
      doc.setFontSize(11);
      doc.text(splitText, 15, 20);
      doc.save(`Repaso_Preply_G3_${new Date().getTime()}.pdf`);
      toast.success('¡PDF generado con Gemini 3!');
      
    } catch (error: any) {
      console.error(error);
      alert("Error crítico: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-blue-500">Material Carlos Rosatti</h1>
          <p className="text-gray-400">Potenciado por Gemini 3 Flash</p>
        </header>

        <div className="grid gap-6 border border-gray-800 p-6 rounded-2xl bg-zinc-900">
          <div className="space-y-2">
            <Label>Audio de la clase (Gemini 3 lo analiza mejor)</Label>
            <Input type="file" accept="audio/*" onChange={handleFileChange} className="bg-zinc-800 border-zinc-700" />
            {audioFile && <p className="text-sm text-blue-400">{audioFile.name}</p>}
          </div>

          <div className="space-y-2">
            <Label>O pega el texto del chat</Label>
            <Textarea 
              placeholder="Escribe o pega aquí..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] bg-zinc-800 border-zinc-700"
            />
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            Generar PDF con Gemini 3
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
