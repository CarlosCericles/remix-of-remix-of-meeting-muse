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
    
    // PONES TU CLAVE AQUÍ ABAJO (Manten las comillas):
    const apiKey = "AIzaSyB6qxAoJtXleLIG0Y5tu-cNBjaZUKi3S7Q";

    try {
      let requestBody;
      const prompt = "Actúa como profesor de Preply. Crea un resumen PDF: 1. Gramática, 2. Vocabulario, 3. Errores y correcciones, 4. Tarea.";

      if (audioFile) {
        toast.info("Procesando audio...");
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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;

      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(resultText, 180);
      doc.setFontSize(11);
      doc.text(splitText, 15, 20);
      doc.save(`Repaso_Preply_${new Date().getTime()}.pdf`);
      toast.success('¡PDF generado!');
      
    } catch (error) {
      console.error(error);
      toast.error('Error. Revisa que la API Key sea correcta.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <section className="py-10 text-center">
        <h1 className="text-4xl font-bold mb-4 gradient-text">Material Preply</h1>
      </section>

      <section className="max-w-3xl mx-auto space-y-6">
        <div className="glass-card p-6 glow-border space-y-4 border rounded-xl bg-card">
          <Label htmlFor="audio-upload" className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl
