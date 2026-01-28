import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, PenLine, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function CreateFromScratchPage() {
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState('');

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Crear Lección Manual</h1>
          <p className="text-muted-foreground">Organiza tus temas antes de generar el material didáctico</p>
        </div>

        <div className="glass-card p-12 text-center animate-scale-in">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <PenLine className="w-12 h-12 text-primary" />
          </div>
          
          <div className="max-w-sm mx-auto space-y-4">
            <Input 
              placeholder="Título de la lección (ej: Verbos Pasados)" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-secondary/50"
            />
            <Button 
              className="w-full h-12 shimmer-button"
              onClick={() => navigate('/')} 
            >
              <Plus className="w-5 h-5 mr-2" />
              Empezar ahora
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-muted-foreground italic">
            "Tip: Usa el generador automático en la página principal para ahorrar tiempo"
          </p>
        </div>
      </div>
    </div>
  );
}
