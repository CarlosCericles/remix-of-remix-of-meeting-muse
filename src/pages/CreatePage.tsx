import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Sparkles, Loader2, Zap, FileAudio, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

const CreatePage = () => {
  const [content, setContent] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('audio/')) {
      setAudioFile(file);
      setContent('');
      toast.success(`Audio detectado: ${file.name}`);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      file.text().then(text => setContent(text));
      setAudioFile(null);
      toast.success('Texto cargado');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });

  const handleSubmit = async () => {
    if (!content.trim() && !audioFile) {
      toast.error('Por favor, sube un audio o pega el texto de la clase');
      return;
    }

    setIsProcessing(true);
    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;

    try {
      let requestBody;
      const prompt = "Actúa como un profesor experto. Crea un resumen de clase profesional en español. Incluye: 1. Título dinámico, 2. Conceptos clave discutidos, 3. Vocabulario nuevo con definiciones, 4. Ejercicios breves de repaso para el alumno. Formatea todo para que quede bien en un PDF.";

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
          contents: [{ parts: [{ text: `${prompt} Basado en este texto: ${content}` }] }]
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
      doc.setFontSize(12);
      doc.text(splitText, 15, 20);
      doc.save(`Repaso_Clase_${new Date().toLocaleDateString()}.pdf`);
      toast.success('¡Resumen PDF generado!');
      
    } catch (error) {
      console.error(error);
      toast.error('Error al procesar. Verifica el tamaño del audio o la API Key.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Material de Repaso Preply</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sube la grabación de tu clase o pega el chat para generar un PDF de estudio automático.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="glass-card p-8 glow-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Label htmlFor="audio-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-xl p-6 cursor-pointer hover:bg-primary/5 transition-all">
              <FileAudio className="w-10 h-10 mb-2 text-primary" />
              <span className="text-sm font-medium">Subir Audio Clase</span>
              <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
              {audioFile && <span className="text-xs mt-2 text-accent">{audioFile.name}</span>}
            </Label>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 opacity-50">
              <FileText className="w-10 h-10 mb-2" />
              <span className="text-sm font-medium">Texto detectado</span>
            </div>
          </div>

          <Textarea 
            placeholder="O pega el transcript aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] bg-secondary/20"
          />

          <Button 
            className="w-full h-14 text-lg font-bold" 
            onClick={handleSubmit} 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <><Loader2 className="animate-spin mr-2" /> Procesando con IA...</>
            ) : (
              <><Sparkles className="mr-2" /> Generar Resumen PDF</>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CreatePage;
