
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast'; // Asegúrate que esta ruta es correcta
import { ArrowLeft } from 'lucide-react';

// EduAILogo component (sin cambios)
const EduAILogo = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-primary">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 13v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.5 7L8 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M14.5 7L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M8 13l1.5 -2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M16 13l-1.5 -2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(''); // Para mostrar errores debajo del formulario si es necesario

  // API URL - idealmente desde variables de entorno
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5433';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    if (password !== confirmPassword) {
      toast({
        title: 'Las contraseñas no coinciden',
        description: 'Por favor, asegúrate de que ambas contraseñas sean idénticas.',
        variant: 'destructive',
      });
      // También podrías usar setError('Las contraseñas no coinciden');
      return;
    }
    if (!fullName || !email || !password) {
      toast({
        title: 'Campos Faltantes',
        description: 'Por favor, completa todos los campos requeridos.',
        variant: 'destructive',
      });
      // También podrías usar setError('Por favor, completa todos los campos.');
      return;
    }
    if (password.length < 6) {
        toast({
            title: 'Contraseña Corta',
            description: 'La contraseña debe tener al menos 6 caracteres.',
            variant: 'destructive',
        });
        // También podrías usar setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    setIsSubmitting(true);
    console.log(`Intentando registrar: ${fullName}, ${email}`);
    // --- INICIO DE LA LLAMADA REAL A LA API ---
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName, // El backend espera 'name'
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) { // El backend debería responder con 201 Created
        toast({
          title: '¡Cuenta Creada Exitosamente!',
          description: `Bienvenido a EduAI, ${fullName}. Por favor, inicia sesión.`,
        });
        router.push('/login'); // Redirigir a la página de login
      } else {
        // Error del backend (ej. email ya existe, error de validación)
        toast({
          title: 'Fallo en el Registro',
          description: data.msg || 'No se pudo crear tu cuenta. Intenta de nuevo.',
          variant: 'destructive',
        });
        setError(data.msg || 'No se pudo crear tu cuenta.');
      }
    } catch (err) {
      console.error("Error en la solicitud de registro del frontend:", err);
      toast({
        title: 'Error de Conexión',
        description: 'No se pudo conectar con el servidor. Intenta más tarde.',
        variant: 'destructive',
      });
      setError('Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
    // --- FIN DE LA LLAMADA REAL A LA API ---
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <EduAILogo />
          <CardTitle className="text-2xl font-bold">Crea Tu Cuenta en EduAI</CardTitle>
          <CardDescription>
            Únete a EduAI para comenzar tu viaje de aprendizaje personalizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Opcional: Mostrar errores en línea */}
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creando Cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm underline text-muted-foreground hover:text-primary inline-flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              ¿Ya tienes una cuenta? Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}