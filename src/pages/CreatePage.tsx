import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Sparkles, FileText, Loader2, ArrowRight, Zap } from 'lucide-react';
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
      toast.error('Por ahora usa archivos .txt o pega el texto directamente');
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      toast.error('Pega el texto de tu clase primero');
      return;
    }

    setIsProcessing(true);
    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;

    if (!apiKey) {
      toast.error("Falta la API Key en Vercel (VITE_GOOGLE_AI_KEY)");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Actúa como un profesor experto de Preply. Crea una lección educativa basada en el siguiente texto. Estructura la respuesta con: 1. Título, 2. Objetivos de la clase, 3. Vocabulario clave (5 palabras con ejemplos), 4. Resumen didáctico, 5. Tres preguntas de comprensión. Texto: ${transcript}` 
            }] 
          }]
        })
      });

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;

      // Generar PDF
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(content, 180);
      doc.setFont("helvetica", "bold");
      doc.text("Lección de Preply - Generada por IA", 15, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(splitText, 15, 25);
      
      doc.save(`Clase_Preply_${new Date().getTime()}.pdf`);
      toast.success('¡PDF Generado y descargado!');
      
    } catch (error) {
      console.error(error);
      toast.error('Error al conectar con la IA');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-background">
      <section ref={heroRef} className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-fade-in-down inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Preply AI Assistant</span>
          </div>
          <h1 className="animate-fade-in-up text-4xl md:text-6xl font-bold mb-6">
            De texto a <span className="gradient-text">Lección PDF</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Pega tus notas o el transcript de una charla y descarga una lección lista para tu alumno.
          </p>
        </div>
      </section>

      <section className="relative py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 glow-border">
            <div className="space-y-6">
              <Label htmlFor="file-upload" className="cursor-pointer block border-2 border-dashed border-border/50 rounded-2xl p-6 text-center hover:
