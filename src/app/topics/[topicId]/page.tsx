// /path/to/your/TopicPage.tsx (e.g., app/topic/[topicId]/page.tsx)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageCircle, Moon, Sun, Loader2, Pencil, Trash2, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import AiTutor from '@/components/ai-tutor'; // Asegúrate que la ruta es correcta
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast'; // Asegúrate que la ruta es correcta
import { generateQuiz, type GenerateQuizInput, type GenerateQuizOutput, type QuizQuestion } from '@/ai/flows/generate-quiz-flow'; // Asegúrate que la ruta es correcta
import QuizDisplay from '@/components/quiz-display'; // Asegúrate que la ruta es correcta
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditTopicDialog from '@/components/edit-topic-dialog'; // Asegúrate que la ruta es correcta
import TopicContentDisplay from '@/components/topic-content-display'; // Asegúrate que la ruta es correcta


// --- Topic Data Interface ---
interface TopicDetail {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
  content: Record<string, string[]>; // Ejemplo: { "Beginner": ["Contenido A"], "Intermediate": ["..."] }
  // created_at y updated_at podrían venir de la API, puedes añadirlos si los necesitas mostrar
  created_at?: string;
  updated_at?: string;
}

// --- localStorage functions for Edit/Delete (TEMPORALMENTE, se migrarán a API) ---
const LOCAL_STORAGE_DETAILS_KEY = 'eduai-topic-details';
const LOCAL_STORAGE_DELETED_TOPICS_KEY = 'eduai-deleted-topics';

const getTopicDetailsFromStorage = (): Record<string, TopicDetail> => {
  if (typeof window === 'undefined') return {};
  try {
    const storedDetails = localStorage.getItem(LOCAL_STORAGE_DETAILS_KEY);
    return storedDetails ? JSON.parse(storedDetails) : {};
  } catch (error) {
    console.error("Error accessing localStorage for topic details:", error);
    return {};
  }
};

const saveTopicDetailsToStorage = (details: Record<string, TopicDetail>) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_DETAILS_KEY, JSON.stringify(details));
      window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_STORAGE_DETAILS_KEY }));
    } catch (error) {
      console.error("Error saving topic details to localStorage:", error);
    }
  }
};

const deleteProgressData = (topicId: string) => {
  if (typeof window !== 'undefined') {
    const progressKey = `eduai-progress-${topicId}`;
    try {
      localStorage.removeItem(progressKey);
      console.log(`Removed progress data for topic: ${topicId}`);
    } catch (error) {
      console.error(`Error removing progress data for ${topicId}:`, error);
    }
  }
};
// --- Fin localStorage functions ---


export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const topicId = params.topicId as string;

  const [topicData, setTopicData] = useState<TopicDetail | null>(null);
  const [topicLevel, setTopicLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showQuizConfirmation, setShowQuizConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [numQuestions, setNumQuestions] = useState(3);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5433';

  const loadTopicData = useCallback(async () => {
    setLoading(true);
    setTopicData(null);
    setTopicLevel(null);

    console.log(`Cargando datos del tema con ID: ${topicId} desde la API: ${API_URL}/api/topics/${topicId}`);

    if (!topicId) {
      console.warn("ID del tema no disponible para cargar datos.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/topics/${topicId}`);
      
      if (response.ok) {
        const data: TopicDetail = await response.json();
        setTopicData(data);
        setTopicLevel(data.level);
        console.log("Datos del tema cargados desde API:", data);
      } else {
        const errorData = await response.json().catch(() => ({ msg: 'Error al cargar el tema.' }));
        console.error(`Error al cargar el tema ${topicId}: Status ${response.status}`, errorData.msg);
        toast({
          title: 'Error al Cargar Tema',
          description: errorData.msg || `No se pudo cargar el tema (status: ${response.status}).`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Error de red o fetch al cargar el tema:", error);
      toast({
        title: 'Error de Conexión',
        description: 'No se pudo conectar con el servidor para cargar el tema.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [topicId, API_URL, toast]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        document.documentElement.classList.add('dark'); // Default to dark
      }
    }
    // Solo llamar a loadTopicData si topicId está presente
    if (topicId) {
        loadTopicData();
    } else {
        setLoading(false); // No hay topicId, no hay nada que cargar
        console.log("TopicPage: No topicId found in params.");
    }
  }, [topicId, loadTopicData]); // loadTopicData ahora está en la lista de dependencias

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleStartQuizGeneration = useCallback(async () => {
    if (!topicData || !topicLevel) return;
    setShowQuizConfirmation(false);
    setIsGeneratingQuiz(true);
    setQuizQuestions([]);
    try {
      const input: GenerateQuizInput = {
        topic: topicData.title,
        level: topicLevel,
        numQuestions: numQuestions,
      };
      const output: GenerateQuizOutput = await generateQuiz(input);
      if (output.quiz && output.quiz.length > 0) {
        setQuizQuestions(output.quiz);
        setShowQuiz(true);
      } else {
        toast({
          title: 'Quiz Generation Failed',
          description: 'Could not generate quiz questions. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      const errorMsg = error instanceof Error && error.message.includes('API key not valid')
        ? 'Invalid or missing API key for quiz generation.'
        : 'An error occurred while generating the quiz.';
      toast({
        title: 'Error Generating Quiz',
        description: errorMsg + ' Displaying simulated quiz data instead.',
        variant: 'destructive',
      });
      const fallbackOutput: GenerateQuizOutput = {
        quiz: Array.from({ length: numQuestions }, (_, i) => ({
          question: `Simulated Question ${i + 1} for ${topicData.title} (${topicLevel})?`,
          options: [`Option A${i}`, `Option B${i}`, `Option C${i}`, `Option D${i}`],
          correctAnswer: `Option B${i}`,
        }))
      };
      setQuizQuestions(fallbackOutput.quiz);
      setShowQuiz(true);
    } finally {
      setIsGeneratingQuiz(false);
    }
  }, [topicData, topicLevel, numQuestions, toast]);

  const handleOpenQuizConfirmation = useCallback(() => {
    setShowQuizConfirmation(true);
  }, []);

  const handleOpenEditDialog = useCallback(() => {
    if (!topicData) return;
    setShowEditDialog(true);
  }, [topicData]);

  // !!! ESTA FUNCIÓN TODAVÍA USA localStorage - SE ACTUALIZARÁ LUEGO !!!
  const handleSaveTopic = useCallback((updatedTitle: string, updatedDescription: string) => {
    if (!topicData || !topicLevel) return;
    console.log(`Saving topic (localStorage): ${updatedTitle} (ID: ${topicId})`);
    const currentDetails = getTopicDetailsFromStorage();
    if (currentDetails[topicId]) {
      currentDetails[topicId] = {
        ...currentDetails[topicId],
        title: updatedTitle,
        description: updatedDescription,
        level: topicLevel, // Level is part of topicData, not directly editable here
        // content: currentDetails[topicId].content // Content no se edita aquí
      };
      saveTopicDetailsToStorage(currentDetails);
    } else {
      console.warn(`Attempted to save details for non-existent topic ID (localStorage): ${topicId}`);
      return;
    }
    setTopicData(prevData => prevData ? { ...prevData, title: updatedTitle, description: updatedDescription } : null);
    toast({
      title: 'Topic Updated (Locally)',
      description: `"${updatedTitle}" has been updated locally. API integration pending.`,
    });
    setShowEditDialog(false);
  }, [topicData, topicLevel, topicId, toast]);

  // !!! ESTA FUNCIÓN TODAVÍA USA localStorage - SE ACTUALIZARÁ LUEGO !!!
  const handleDeleteTopic = useCallback(() => {
    if (!topicData) return;
    console.log(`Deleting topic (localStorage): ${topicData.title} (ID: ${topicId})`);

    const currentDetails = getTopicDetailsFromStorage();
    delete currentDetails[topicId];
    saveTopicDetailsToStorage(currentDetails);
    deleteProgressData(topicId);

    if (typeof window !== 'undefined') {
      const deletedTopicIdsString = localStorage.getItem(LOCAL_STORAGE_DELETED_TOPICS_KEY);
      const deletedTopicIds: string[] = deletedTopicIdsString ? JSON.parse(deletedTopicIdsString) : [];
      if (!deletedTopicIds.includes(topicId)) {
        deletedTopicIds.push(topicId);
        localStorage.setItem(LOCAL_STORAGE_DELETED_TOPICS_KEY, JSON.stringify(deletedTopicIds));
        window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_STORAGE_DELETED_TOPICS_KEY }));
      }
    }
    toast({
      title: 'Topic Deleted (Locally)',
      description: `"${topicData.title}" has been deleted locally. API integration pending.`,
      variant: 'destructive'
    });
    setShowDeleteConfirmation(false);
    router.push('/');
  }, [topicData, topicId, toast, router]);

  const openAiTutor = useCallback(() => setShowAiTutor(true), []);
  const closeAiTutor = useCallback(() => setShowAiTutor(false), []);
  const closeEditDialog = useCallback(() => setShowEditDialog(false), []);
  const closeQuizDisplay = useCallback(() => {
    setShowQuiz(false);
    setQuizQuestions([]);
  }, []);

  if (loading) {
    return ( /* ... Tu JSX para el estado de carga (Skeleton) ... */ 
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
        <header className="flex items-center justify-between flex-wrap gap-4 p-4 bg-secondary rounded-md header-border">
           <div className="flex items-center gap-4">
             <Skeleton className="h-8 w-8 rounded-md" />
             <Skeleton className="h-8 w-48 rounded-md" />
           </div>
           <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
             <Skeleton className="h-8 w-8 rounded-md" />
             <Skeleton className="h-8 w-8 rounded-md" />
             <Skeleton className="h-8 w-8 rounded-full" />
             <Skeleton className="h-9 w-20 sm:w-28 rounded-md" />
           </div>
        </header>
        <div className="p-4 space-y-4 flex-grow">
            <Skeleton className="h-6 w-24 mb-4 rounded-md" />
             <div className="space-y-4">
                 <Card className="border-border shadow-sm">
                   <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-32 mb-2" />
                       <Skeleton className="h-2 w-full" />
                   </CardHeader>
                   <CardContent className="space-y-3 pt-4">
                       <div className="flex items-center space-x-3">
                         <Skeleton className="h-4 w-4" />
                         <Skeleton className="h-4 w-4/5" />
                       </div>
                       <div className="flex items-center space-x-3">
                         <Skeleton className="h-4 w-4" />
                         <Skeleton className="h-4 w-3/4" />
                       </div>
                        <div className="flex items-center space-x-3">
                         <Skeleton className="h-4 w-4" />
                         <Skeleton className="h-4 w-5/6" />
                       </div>
                   </CardContent>
                </Card>
             </div>
            <div className="mt-6">
                 <Skeleton className="h-10 w-36 rounded-md"/>
            </div>
        </div>
         <footer className="p-4 mt-auto text-center">
           <Skeleton className="h-4 w-1/2 mx-auto rounded-md"/>
         </footer>
      </div>
    );
  }

  if (!topicData) { // Simplificado: si no hay topicData después de cargar, no se encontró o hubo error
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center gap-6 min-h-screen text-center">
        <h1 className="text-2xl font-bold text-destructive">Tema No Encontrado</h1>
        <p className="text-muted-foreground">El tema que solicitaste ({topicId}) podría haber sido eliminado o no existe.</p>
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
          </Button>
        </Link>
      </div>
    );
  }
  
  // Si topicData existe, topicLevel también debería existir (cargado en loadTopicData)
  // Pero por seguridad, podrías añadir un chequeo para topicLevel aquí si fuera necesario
  // if (!topicLevel) return <p>Error: Nivel del tema no definido.</p>;


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
      <header className="flex items-center justify-between flex-wrap gap-y-4 p-4 bg-secondary rounded-md header-border">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink min-w-0 mr-4">
          <Link href="/" passHref>
            <Button variant="outline" size="icon" aria-label="Go back home" className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold break-words">
            {topicData.title}
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={handleOpenEditDialog} aria-label="Edit topic">
            <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Delete topic" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente el tema
                  "{topicData.title}" y todo el progreso asociado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowDeleteConfirmation(false)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTopic} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Eliminar Tema
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>

          <Button variant="outline" size="sm" onClick={openAiTutor}>
            <MessageCircle className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Preguntar al Tutor IA</span>
            <span className="sm:hidden">IA</span>
          </Button>
        </div>
      </header>

      <section className="p-4 flex-grow space-y-6">
        <div className="mb-4">
          {/* Asegurarse que topicData.level exista antes de mostrarlo */}
          {topicData.level && <span className="level-badge">{topicData.level}</span>}
        </div>

        <TopicContentDisplay
          topicId={topicId}
          content={topicData.content}
          initialLevel={topicData.level} // Usar topicData.level que viene de la API
        />

        <div className="mt-6">
          <Button variant="outline" onClick={handleOpenQuizConfirmation} disabled={isGeneratingQuiz}>
            {isGeneratingQuiz ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando Quiz...
              </>
            ) : (
              <>
                <ClipboardCheck className="mr-2 h-4 w-4" /> Tomar un Quiz
              </>
            )}
          </Button>
        </div>
      </section>

      {topicData && topicData.level && (
        <AiTutor
          isOpen={showAiTutor}
          onClose={closeAiTutor}
          topic={topicData.title}
          level={topicData.level}
        />
      )}

      {topicData && (
        <EditTopicDialog
          isOpen={showEditDialog}
          onClose={closeEditDialog}
          topicTitle={topicData.title}
          topicDescription={topicData.description ?? ''}
          onSave={handleSaveTopic}
        />
      )}

      {topicData && topicData.level && (
        <AlertDialog open={showQuizConfirmation} onOpenChange={setShowQuizConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Generar Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                Selecciona el número de preguntas para tu quiz de {topicData.level} sobre {topicData.title}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="num-questions">Número de Preguntas (1-10):</Label>
              <Select
                value={String(numQuestions)}
                onValueChange={(value) => setNumQuestions(parseInt(value))}
              >
                <SelectTrigger id="num-questions" className="w-[180px] mt-2">
                  <SelectValue placeholder="Seleccionar número" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowQuizConfirmation(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleStartQuizGeneration} disabled={isGeneratingQuiz}>
                {isGeneratingQuiz ? (
                  <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando... </>
                ) : ( "Iniciar Quiz" )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {topicData && quizQuestions.length > 0 && topicData.level && (
        <QuizDisplay
          isOpen={showQuiz}
          onClose={closeQuizDisplay}
          questions={quizQuestions}
          topic={topicData.title}
          level={topicData.level}
        />
      )}

      <footer className="p-4 mt-auto text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EduAI. Todos los derechos reservados.
      </footer>
    </div>
  );
}