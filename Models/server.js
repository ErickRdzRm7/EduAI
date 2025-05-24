// /Users/erick/Documents/proyecto/EduAI/Models/server.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
// const crypto = require('crypto'); // Descomenta si implementas forgot-password
// const nodemailer = require('nodemailer'); // Descomenta si implementas forgot-password

// Middleware de autenticación
// Asegúrate de que la ruta sea correcta y que authMiddleware.js esté funcionando.
const authMiddleware = require('../Middleware/authMiddleware');

// Configuración del Pool de PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Función para probar la conexión a la BD
async function testConnection() {
  let client;
  try {
    console.log('Intentando conectar a la base de datos PostgreSQL...');
    client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Conexión exitosa a PostgreSQL! Hora actual del servidor de BD:', res.rows[0].now);
  } catch (err) {
    console.error('Error al conectar o ejecutar consulta en PostgreSQL:', err);
  } finally {
    if (client) {
      client.release();
      console.log('Cliente liberado.');
    }
  }
}

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:9002', // O el puerto de tu app Next.js (ej. 3000)
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Por favor, ingrese correo y contraseña.' });
  }
  try {
    const userQuery = await pool.query('SELECT id, email, password_hash, name FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciales inválidas. Usuario no encontrado.' });
    }
    const user = userQuery.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas. Contraseña incorrecta.' });
    }
    const payload = { user: { id: user.id, email: user.email, name: user.name } }; // user.id aquí es BIGINT
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('Error al firmar el token JWT:', err);
        return res.status(500).json({ msg: 'Error al generar el token de autenticación.' });
      }
      res.json({ msg: 'Login exitoso!', token, user: { id: user.id, name: user.name, email: user.email } });
    });
  } catch (err) {
    console.error('[Express Backend] Error en /api/auth/login:', err.message, err.stack);
    res.status(500).send('Error del servidor');
  }
});

app.post('/api/auth/register', async (req, res) => {
  console.log('[Express Backend] --- Inicia /api/auth/register ---');
  const { name, email, password } = req.body;
  console.log('[Express Backend] Datos recibidos para registro:', { name, email, password_length: password?.length });

  if (!name || !email || !password) {
    console.log('[Express Backend] Registro: Validación fallida - campos faltantes');
    return res.status(400).json({ msg: 'Por favor, ingrese todos los campos: nombre, correo y contraseña.' });
  }
  if (password.length < 6) {
    console.log('[Express Backend] Registro: Validación fallida - contraseña corta');
    return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres.' });
  }
  try {
    console.log('[Express Backend] Registro Paso 1: Verificando si el usuario existe...');
    const existingUserQuery = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    console.log('[Express Backend] Registro: Resultado de existingUserQuery.rows.length:', existingUserQuery.rows.length);

    if (existingUserQuery.rows.length > 0) {
      console.log('[Express Backend] Registro Error: El correo ya está registrado.');
      return res.status(400).json({ msg: 'El correo electrónico ya está registrado.' });
    }
    console.log('[Express Backend] Registro Paso 2: Hasheando contraseña...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('[Express Backend] Registro: Contraseña hasheada (longitud):', hashedPassword?.length);

    console.log('[Express Backend] Registro Paso 3: Insertando nuevo usuario en la BD...');
    const newUserQuery = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );
    console.log('[Express Backend] Registro: Resultado completo de newUserQuery:', JSON.stringify(newUserQuery.rows[0], null, 2));

    if (newUserQuery.rows && newUserQuery.rows.length > 0) {
      const newUser = newUserQuery.rows[0];
      console.log('[Express Backend] Registro: Nuevo usuario insertado:', newUser);
      res.status(201).json({
        msg: 'Usuario registrado exitosamente.',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at }
      });
    } else {
      console.error('[Express Backend] Registro Error: INSERT no devolvió filas.');
      res.status(500).json({ msg: 'Error al registrar el usuario, la inserción no devolvió datos.' });
    }
  } catch (err) {
    console.error('[Express Backend] Error en el bloque catch de /api/auth/register:', err.message, err.stack);
    res.status(500).send('Error del servidor');
  }
  console.log('[Express Backend] --- Finaliza /api/auth/register ---');
});

// --- RUTAS DE TEMAS ---

/**
 * POST /api/topics
 * Crea metadatos para un nuevo tema, llama a la API de Next.js para generar el contenido con IA,
 * y guarda todo en la base de datos. Requiere autenticación.
 */
app.post('/api/topics', authMiddleware, async (req, res) => {
  const userId = req.user.id; // user.id es BIGINT
  const { title, slug, description, level } = req.body;

  console.log(`[Express Backend] Intento de crear tema por usuario ${userId}: Título "${title}", Slug "${slug}"`);

  if (!title || !slug || !level) {
    return res.status(400).json({ msg: 'Título, slug y nivel son requeridos para crear un tema.' });
  }
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
    return res.status(400).json({ msg: 'Nivel inválido. Debe ser Beginner, Intermediate, o Advanced.' });
  }

  try {
    const slugCheckQuery = await pool.query('SELECT id FROM topics WHERE slug = $1', [slug]);
    if (slugCheckQuery.rows.length > 0) {
      return res.status(400).json({ msg: 'Este slug ya está en uso. Por favor, elige otro.' });
    }

    const aiInput = {
      topicName: title,
      description: description || '',
      baseLevel: level,
    };

    const nextJsBaseUrl = process.env.NEXTJS_APP_URL || 'http://localhost:9002'; // Asegúrate que este puerto sea el de tu app Next.js
    const aiApiEndpoint = `${nextJsBaseUrl}/api/internal/generate-ai-content`;
    
    console.log(`[Express Backend] Llamando a Next.js API para IA: ${aiApiEndpoint} con input:`, aiInput);
    
    const aiResponse = await fetch(aiApiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiInput),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({ error: 'Respuesta de error no JSON desde Next.js API' }));
      console.error(`[Express Backend] Error desde el endpoint de IA de Next.js (${aiResponse.status}):`, errorData.error || errorData.details || errorData);
      throw new Error(`Falló la generación de contenido IA desde Next.js: ${errorData.error || aiResponse.statusText}`);
    }

    const aiGeneratedOutput = await aiResponse.json();
    console.log(`[Express Backend] Contenido IA recibido de Next.js para "${title}"`);

    const structuredAiContent = {
      Beginner: aiGeneratedOutput.beginner || [],
      Intermediate: aiGeneratedOutput.intermediate || [],
      Advanced: aiGeneratedOutput.advanced || [],
    };

    const newTopicQuery = await pool.query(
      `INSERT INTO topics (user_id, title, slug, description, level, ai_generated_content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, title, slug, description, level, ai_generated_content, created_at, updated_at`,
      [userId, title, slug, description || null, level, structuredAiContent]
    );

    const createdTopic = newTopicQuery.rows[0];
    console.log(`[Express Backend] Tema creado y guardado en BD para usuario ${userId}: ID del tema ${createdTopic.id}`);
    res.status(201).json(createdTopic);

  } catch (err) {
    console.error(`[Express Backend] Error en POST /api/topics (creando tema "${title}"):`, err.message, err.stack);
    if (err.code === '23505' && err.constraint === 'topics_slug_key') { 
        return res.status(400).json({ msg: 'Este slug ya está en uso. Por favor, elige otro.'});
    }
    res.status(500).json({ msg: 'Error del servidor al crear el tema.', details: err.message });
  }
});

/**
 * GET /api/topics/:slug
 * Obtiene un tema específico por su slug, incluyendo el contenido generado por IA almacenado.
 */
app.get('/api/topics/:slug', async (req, res) => {
  const { slug } = req.params;
  console.log(`[Express Backend] Solicitud GET para /api/topics/${slug} (buscando por slug)`);

  if (!slug) {
    return res.status(400).json({ msg: 'Slug del tema no proporcionado.' });
  }

  try {
    const topicQuery = await pool.query(
      'SELECT id, slug, title, description, level, ai_generated_content, user_id, created_at, updated_at FROM topics WHERE slug = $1',
      [slug]
    );

    if (topicQuery.rows.length === 0) {
      console.log(`[Express Backend] Tema no encontrado en BD con slug: ${slug}`);
      return res.status(404).json({ msg: 'Tema no encontrado.' });
    }

    const topicFromDB = topicQuery.rows[0];
    const responsePayload = {
        id: topicFromDB.id, // UUID del tema
        slug: topicFromDB.slug,
        title: topicFromDB.title,
        description: topicFromDB.description,
        level: topicFromDB.level,
        content: topicFromDB.ai_generated_content || { Beginner: [], Intermediate: [], Advanced: [] },
        userId: topicFromDB.user_id, // BIGINT del creador
        created_at: topicFromDB.created_at,
        updated_at: topicFromDB.updated_at
    };
    
    console.log(`[Express Backend] Tema encontrado en BD y devuelto: ${topicFromDB.title}`);
    res.status(200).json(responsePayload);

  } catch (err) {
    console.error(`[Express Backend] Error en GET /api/topics/${slug}:`, err.message, err.stack);
    res.status(500).json({ msg: 'Error interno del servidor al obtener el tema.', details: err.message });
  }
});


// --- RUTA DE PRUEBA ---
app.get('/test-server', (req, res) => {
  console.log('[Express Backend] --- Solicitud GET recibida en /test-server ---');
  res.status(200).send('¡El servidor backend de Express está respondiendo!');
});

// --- INICIO DEL SERVIDOR Y LIMPIEZA ---
const PORT = process.env.API_PORT || 5433;
const server = app.listen(PORT, () => {
  console.log(`Servidor de API Express escuchando en el puerto ${PORT}`);
  console.log('[Express Backend] Añadiendo un log extra para confirmar inicio completo del listener.');
  testConnection();
});

const cleanup = async () => {
  console.log('[Express Backend] Cerrando el pool de conexiones de la base de datos...');
  if (pool) {
    await pool.end();
    console.log('[Express Backend] Pool de conexiones cerrado.');
  }
  if (server) {
    server.close(() => {
      console.log('[Express Backend] Servidor HTTP cerrado.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', cleanup); // Captura Ctrl+C
process.on('SIGTERM', cleanup); // Captura señales de terminación (ej. de Docker o systemd)