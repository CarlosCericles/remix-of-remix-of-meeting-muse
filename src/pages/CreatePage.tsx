import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Sparkles, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

const CreatePage = () => {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      setTranscript(text);
      toast.success('Archivo cargado');
    } else {
      toast.error('Usa archivos .txt o pega el texto');
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      toast.error('Pega el texto de tu clase');
      return;
    }

    setIsProcessing(true);
    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Actúa como un profesor experto. Crea una lección educativa: 1. Título, 2. Objetivos, 3. Vocabulario, 4. Resumen, 5. Ejercicios. Texto: ${transcript}` 
            }] 
          }]
        })
      });

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;

      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(content, 180);
      doc.text(splitText, 15, 20);
      doc.save(`Clase_Preply_${new Date().getTime()}.pdf`);
      toast.success('¡PDF descargado!');
      
    } catch (error) {
      toast.error('Error con la IA. Revisa tu API Key.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-background">
      <section ref={heroRef} className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-fade-in-down inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Preply AI Assistant</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">De texto a <span className="gradient-text">PDF</span></h1>
        </div>
      </section>

      <section className="relative py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 glow-border">
            <div className="space-y-6">
              <Label htmlFor="file-upload" className="cursor-pointer block border-2 border-dashed border-border/50 rounded-2xl p-6 text-center hover:bg-primary/5 transition-all">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p>Carga .txt o pega abajo</p>
                <Input id="file-upload" type="file" onChange={handleFileUpload} className="hidden" />
              </Label>
              <Textarea
                placeholder="Pega aquí el contenido..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[250px] bg-secondary/30 rounded-xl"
              />
              <Button className="w-full h-14 bg-gradient-to-r from-primary to-accent" onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                Generar PDF para Preply
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreatePage;
