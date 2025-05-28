// En [TuProyectoNextJS]/app/api/internal/generate-ai-content/route.ts

import { type NextRequest, NextResponse } from 'next/server';
// Asegúrate de que esta ruta de importación sea correcta desde la ubicación de este archivo API:
import {
    generateTopicContent, // Esta es la función que exportaste
    type GenerateTopicContentInput,
    type GenerateTopicContentOutput
} from '@/ai/flows/generate-topic-content-flow'; // Usando alias '@/' si lo tienes configurado

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener los datos de entrada del cuerpo de la solicitud
    const inputJson = await request.json();

    // 2. Validar la entrada (puedes usar Zod aquí si quieres ser más estricto
    //    o simplemente verificar los campos necesarios)
    //    Basado en tu GenerateTopicContentInputSchema: topicName, description?, baseLevel
    if (!inputJson.topicName || !inputJson.baseLevel) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: topicName o baseLevel.' },
        { status: 400 }
      );
    }
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(inputJson.baseLevel)) {
         return NextResponse.json(
             { error: 'Valor de baseLevel inválido. Debe ser Beginner, Intermediate, o Advanced.' },
             { status: 400 }
         );
    }

    const input: GenerateTopicContentInput = {
        topicName: inputJson.topicName,
        description: inputJson.description, // description es opcional en tu schema
        baseLevel: inputJson.baseLevel,
    };

    console.log('[Next.js API] Recibida solicitud para generar contenido IA:', input);

    // 3. Llamar a tu flujo de Genkit/Gemini
    const output: GenerateTopicContentOutput = await generateTopicContent(input);

    console.log('[Next.js API] Contenido IA generado:', output);

    // 4. Devolver la salida generada por la IA
    return NextResponse.json(output, { status: 200 });

  } catch (error: any) {
    console.error('[Next.js API] Error en la generación de contenido IA:', error);
    return NextResponse.json(
      {
        error: 'Falló la generación de contenido IA.',
        details: error.message || 'Error desconocido',
      },
      { status: 500 }
    );
  }
}