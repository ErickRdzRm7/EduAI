// /Users/erick/Documents/proyecto/EduAI/Models/server.js

// --- INICIO: MANEJADORES GLOBALES DE ERRORES ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('*******************************************************************');
  console.error('ERROR GLOBAL: Promesa Rechazada No Manejada (Unhandled Rejection)');
  console.error('Razón del Rechazo:', reason);
  console.error('*******************************************************************');
  
});
process.on('uncaughtException', (error) => {
  console.error('****************************************************************');
  console.error('ERROR GLOBAL: Excepción No Capturada (Uncaught Exception)');
  console.error('Error:', error);
  console.error('Stack del Error:', error.stack);
  console.error('****************************************************************');
  process.exit(1);
});
// --- FIN: MANEJADORES GLOBALES DE ERRORES ---

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); // Para autenticación de usuarios
const cors = require('cors');
const fs = require('fs').promises; // Para leer/escribir el archivo JSON de temas
const path = require('path');
const crypto = require('crypto'); // Para generar IDs únicos para temas
require('dotenv').config();

// Middleware de autenticación (asume que existe y funciona)
const authMiddleware = require('../Middleware/authMiddleware');
// --- INICIALIZACIÓN DE EXPRESS ---
const app = express();

// --- CONFIGURACIÓN DEL POOL DE POSTGRESQL (Para la tabla 'users') ---
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// --- LÓGICA PARA MANEJAR TOPICS CON ARCHIVO JSON ---
const TOPICS_FILE_PATH = path.join(__dirname, '../data/topics.json');

async function readTopicsFromFile() {
  console.log(`[JSON Topics] Intentando leer archivo: ${TOPICS_FILE_PATH}`);
  let topicsArray = [];
  try {
    await fs.access(TOPICS_FILE_PATH);
    const fileContent = await fs.readFile(TOPICS_FILE_PATH, 'utf8');
    if (fileContent.trim() === '') {
      console.log(`[JSON Topics] Archivo ${TOPICS_FILE_PATH} está vacío. Retornando [].`);
    } else {
      const parsedData = JSON.parse(fileContent);
      if (Array.isArray(parsedData)) {
        topicsArray = parsedData;
        console.log(`[JSON Topics] Archivo leído y parseado. Temas cargados: ${topicsArray.length}`);
      } else {
        console.warn(`[JSON Topics] Contenido de ${TOPICS_FILE_PATH} no es un array JSON válido. Se recibió tipo: ${typeof parsedData}, valor:`, parsedData, ". Retornando [].");
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`[JSON Topics] Archivo ${TOPICS_FILE_PATH} no encontrado. Retornando [] y se intentará crear al guardar.`);
    } else {
      console.error(`[JSON Topics] Error al leer o parsear ${TOPICS_FILE_PATH}:`, error.message, ". Retornando [].");
    }
  }
  return topicsArray;
}

async function writeTopicsToFile(topicsArray) {
  console.log(`[JSON Topics] Intentando escribir ${topicsArray.length} temas en: ${TOPICS_FILE_PATH}`);
  try {
    await fs.mkdir(path.dirname(TOPICS_FILE_PATH), { recursive: true });
    await fs.writeFile(TOPICS_FILE_PATH, JSON.stringify(topicsArray, null, 2), 'utf8');
    console.log(`[JSON Topics] Escritura exitosa en ${TOPICS_FILE_PATH}.`);
  } catch (error) {
    console.error(`[JSON Topics] Error crítico al escribir en ${TOPICS_FILE_PATH}:`, error);
    throw new Error('No se pudo guardar la información de los temas en el archivo JSON.');
  }
}

// --- MIDDLEWARES DE EXPRESS ---
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:9002',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
console.log('[Express Backend] Middlewares CORS y JSON aplicados.');

// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email y password son requeridos.' });
    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userQuery.rows.length === 0) return res.status(400).json({ msg: 'Usuario no encontrado.' });
        const user = userQuery.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta.' });
        const payload = { user: { id: user.id.toString(), name: user.name, email: user.email } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ msg: 'Login exitoso', token, user: payload.user });
    } catch (err) {
        console.error('[Express Backend] Error en login:', err.stack);
        if (!res.headersSent) {
            return res.status(500).json({ msg: 'Error del servidor en login' });
        }
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Nombre, email y password son requeridos.' });
    if (password.length < 6) return res.status(400).json({ msg: 'Password debe tener al menos 6 caracteres.' });
    try {
        const existingUserQuery = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
        if (existingUserQuery.rows.length > 0) return res.status(400).json({ msg: 'Email ya registrado.' });
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUserQuery = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashedPassword]
        );
        const newUser = newUserQuery.rows[0];
        const userResponse = { ...newUser, id: newUser.id.toString() };
        return res.status(201).json({ msg: 'Usuario registrado exitosamente.', user: userResponse });
    } catch (err) {
        console.error('[Express Backend] Error en register:', err.stack);
        if (!res.headersSent) {
            return res.status(500).json({ msg: 'Error del servidor en registro' });
        }
    }
});

// --- RUTAS DE TEMAS (usan archivo JSON) ---

// GET: Listar todos los temas
app.get('/api/topics', async (req, res) => {
  console.log('[Express Backend JSON] Solicitud GET para /api/topics (listar todos)');
  try {
    const topics = await readTopicsFromFile();
    console.log(`[Express Backend JSON] Devolviendo ${topics.length} temas.`);
    return res.status(200).json(topics);
  } catch (err) {
    console.error(`[Express Backend JSON] Error en GET /api/topics (listar todos):`, err.message, err.stack);
    if (!res.headersSent) {
      return res.status(500).json({ msg: 'Error interno del servidor al obtener la lista de temas.', details: err.message });
    }
  }
});

// POST: Crear un nuevo tema
app.post('/api/topics', authMiddleware, async (req, res) => {
  console.log('[Express Backend JSON] Ruta POST /api/topics alcanzada.');
  const userId = req.user.id;
  const { title, description, level } = req.body;
  let currentTitleForErrorLog = title || 'Título no proporcionado';

  console.log(`[Express Backend JSON] Solicitud de creación de tema por usuario ${userId}: Título "${currentTitleForErrorLog}", Nivel "${level}"`);

  if (!title || !level) {
    return res.status(400).json({ msg: 'Título (nombre) y nivel son requeridos.' });
  }
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
    return res.status(400).json({ msg: 'Nivel inválido. Debe ser Beginner, Intermediate, o Advanced.' });
  }

  let slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  if (!slug) {
    return res.status(400).json({ msg: 'El título no es válido para generar un slug.' });
  }
  currentTitleForErrorLog = title;

  try {
    let topics = await readTopicsFromFile();
    console.log(`[Express Backend JSON] Temas leídos antes de añadir. Total actual: ${topics?.length}`);
    console.log('[Express Backend JSON] Es "topics" un array?:', Array.isArray(topics));

    let slugExists = topics.some(topic => topic.slug === slug); 
    let counter = 1;
    const originalSlug = slug;
    while (slugExists) {
      slug = `${originalSlug}-${counter}`;
      counter++;
      slugExists = topics.some(topic => topic.slug === slug);
      if (counter > 10) {
        console.warn('[Express Backend JSON] No se pudo generar slug único tras 10 intentos para:', originalSlug);
        return res.status(400).json({ msg: 'No se pudo generar un slug único. Intenta con un título ligeramente diferente.' });
      }
    }
    console.log(`[Express Backend JSON] Slug final generado: ${slug}`);

    const newTopic = {
      id: crypto.randomUUID(),
      slug: slug,
      title: title,
      description: description || null,
      level: level,
      content: { Beginner: [], Intermediate: [], Advanced: [] },
      user_id: userId.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log('[Express Backend JSON] Objeto newTopic preparado:', newTopic);

    topics.push(newTopic);
    console.log('[Express Backend JSON] Nuevo tema añadido al array. Total ahora:', topics.length, 'Escribiendo en archivo...');
    await writeTopicsToFile(topics);

    console.log(`[Express Backend JSON] Tema creado y guardado en topics.json: ID ${newTopic.id}, Título "${newTopic.title}"`);
    return res.status(201).json(newTopic);

  } catch (err) {
    console.error(`[Express Backend JSON] Error en POST /api/topics ("${currentTitleForErrorLog}"):`, err.message, err.stack);
    if (!res.headersSent) {
      return res.status(500).json({ msg: 'Error del servidor al crear el tema.', details: err.message });
    }
  }
});

// GET: Obtener un tema específico por slug
app.get('/api/topics/:slug', async (req, res) => {
  const { slug } = req.params;
  console.log(`[Express Backend JSON] Solicitud GET para /api/topics/${slug}`);
  if (!slug) return res.status(400).json({ msg: 'Slug del tema no proporcionado.' });
  try {
    const topics = await readTopicsFromFile();
    console.log('[Express Backend JSON] Es "topics" en GET un array?:', Array.isArray(topics));
    const topic = topics.find(t => t.slug === slug);
    if (!topic) {
      console.log(`[Express Backend JSON] Tema no encontrado en topics.json con slug: ${slug}`);
      return res.status(404).json({ msg: 'Tema no encontrado.' });
    }
    const responsePayload = {
        ...topic,
        content: topic.content || { Beginner: [], Intermediate: [], Advanced: [] }
    };
    console.log(`[Express Backend JSON] Tema encontrado en topics.json y devuelto: ${topic.title}`);
    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error(`[Express Backend JSON] Error en GET /api/topics/${slug}:`, err.message, err.stack);
    if (!res.headersSent) {
        return res.status(500).json({ msg: 'Error interno del servidor al obtener el tema.', details: err.message });
    }
  }
});

// PUT: Actualizar un tema existente
app.put('/api/topics/:slug', authMiddleware, async (req, res) => {
  const currentUserId = req.user.id.toString();
  const { slug: targetSlug } = req.params;
  const { title, description, level } = req.body;

  console.log(`[Express Backend JSON] Solicitud PUT para /api/topics/${targetSlug} por usuario ${currentUserId}`);

  if (!title && description === undefined && !level) { // description puede ser null o ""
    return res.status(400).json({ msg: 'Se requiere al menos un campo para actualizar (title, description, level).' });
  }
  if (level && !['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
    return res.status(400).json({ msg: 'Nivel inválido.' });
  }

  try {
    let topics = await readTopicsFromFile();
    const topicIndex = topics.findIndex(t => t.slug === targetSlug);

    if (topicIndex === -1) {
      console.log(`[Express Backend JSON] PUT: Tema no encontrado con slug: ${targetSlug}`);
      return res.status(404).json({ msg: 'Tema no encontrado para actualizar.' });
    }

    const topicToUpdate = { ...topics[topicIndex] }; // Copiar para evitar modificar el original directamente en el array

    if (topicToUpdate.user_id !== currentUserId) {
      console.log(`[Express Backend JSON] PUT: Usuario ${currentUserId} no autorizado para editar tema ${targetSlug} (creador: ${topicToUpdate.user_id})`);
      return res.status(403).json({ msg: 'No tienes permiso para editar este tema.' });
    }

    let newSlug = topicToUpdate.slug;
    if (title && title !== topicToUpdate.title) {
      let potentialNewSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      if (potentialNewSlug && potentialNewSlug !== topicToUpdate.slug) {
        let slugExists = topics.some((t, index) => index !== topicIndex && t.slug === potentialNewSlug);
        let counter = 1;
        const originalPotentialSlug = potentialNewSlug;
        while (slugExists) {
          potentialNewSlug = `${originalPotentialSlug}-${counter}`;
          counter++;
          slugExists = topics.some((t, index) => index !== topicIndex && t.slug === potentialNewSlug);
          if (counter > 10) {
            return res.status(400).json({ msg: 'No se pudo generar un slug único para el nuevo título.' });
          }
        }
        newSlug = potentialNewSlug;
        console.log(`[Express Backend JSON] PUT: Nuevo slug generado: ${newSlug} para título: ${title}`);
      }
    }
    
    topics[topicIndex] = {
      ...topicToUpdate,
      title: title || topicToUpdate.title,
      slug: newSlug,
      description: description !== undefined ? description : topicToUpdate.description,
      level: level || topicToUpdate.level,
      updated_at: new Date().toISOString(),
      // content y user_id se mantienen del original
      content: topicToUpdate.content, 
      user_id: topicToUpdate.user_id
    };
    
    await writeTopicsToFile(topics);
    console.log(`[Express Backend JSON] PUT: Tema actualizado en topics.json: ${topics[topicIndex].title}`);
    return res.status(200).json(topics[topicIndex]);

  } catch (err) {
    console.error(`[Express Backend JSON] Error en PUT /api/topics/${targetSlug}:`, err.message, err.stack);
    if (!res.headersSent) {
      return res.status(500).json({ msg: 'Error del servidor al actualizar el tema.', details: err.message });
    }
  }
});

// DELETE: Eliminar un tema existente
app.delete('/api/topics/:slug', authMiddleware, async (req, res) => {
  const currentUserId = req.user.id.toString();
  const { slug: targetSlug } = req.params;

  console.log(`[Express Backend JSON] Solicitud DELETE para /api/topics/${targetSlug} por usuario ${currentUserId}`);

  try {
    let topics = await readTopicsFromFile();
    const topicIndex = topics.findIndex(t => t.slug === targetSlug);

    if (topicIndex === -1) {
      console.log(`[Express Backend JSON] DELETE: Tema no encontrado con slug: ${targetSlug}`);
      return res.status(404).json({ msg: 'Tema no encontrado para eliminar.' });
    }

    if (topics[topicIndex].user_id !== currentUserId) {
      console.log(`[Express Backend JSON] DELETE: Usuario ${currentUserId} no autorizado para eliminar tema ${targetSlug} (creador: ${topics[topicIndex].user_id})`);
      return res.status(403).json({ msg: 'No tienes permiso para eliminar este tema.' });
    }

    const deletedTopicTitle = topics[topicIndex].title;
    topics.splice(topicIndex, 1);
    
    await writeTopicsToFile(topics);
    console.log(`[Express Backend JSON] DELETE: Tema "${deletedTopicTitle}" (slug: ${targetSlug}) eliminado de topics.json.`);
    return res.status(200).json({ msg: `Tema "${deletedTopicTitle}" eliminado exitosamente.` }); // O res.status(204).send(); para no content

  } catch (err) {
    console.error(`[Express Backend JSON] Error en DELETE /api/topics/${targetSlug}:`, err.message, err.stack);
    if (!res.headersSent) {
      return res.status(500).json({ msg: 'Error del servidor al eliminar el tema.', details: err.message });
    }
  }
});

app.put('/api/profile', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ msg: 'Debes proporcionar al menos un campo para actualizar (nombre o email).' });
  }

  try {
    const updateUserQuery = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
      [name || null, email || null, userId]
    );

    if (updateUserQuery.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    const updatedUser = updateUserQuery.rows[0];
    return res.status(200).json({ msg: 'Perfil actualizado exitosamente.', user: updatedUser });

  } catch (error) {
    console.error('[Express Backend] Error al actualizar el perfil:', error.stack);
    if (!res.headersSent) {
      return res.status(500).json({ msg: 'Error del servidor al actualizar el perfil.' });
    }
  }
});


app.get('/api/test-profile-route', (req, res) => {
  console.log('[Backend] GET /api/test-profile-route hit!');
  res.status(200).json({ message: 'Test route works!' });
});


// --- RUTA DE PRUEBA ---
app.get('/test-server', (req, res) => {
  console.log('[Express Backend] --- Solicitud GET recibida en /test-server ---');
  return res.status(200).send('¡El servidor backend de Express está respondiendo!');
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.API_PORT || 5433;
let serverInstance;

try {
  serverInstance = app.listen(PORT, () => {
    console.log(`[Express Backend] Servidor de API Express escuchando en el puerto ${PORT}`);
    console.log('[Express Backend] El servidor debería permanecer activo ahora.');
    // testUserDBConnection(); // Puedes descomentar esto si necesitas probar la conexión a PostgreSQL
  });
  console.log('[Express Backend] Llamada a app.listen() completada.');

  serverInstance.on('error', (error) => {
    console.error('****************************************************************');
    console.error('ERROR EN EL SERVIDOR HTTP (app.listen):', error);
    console.error('****************************************************************');
    if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso.`);
    }
    process.exit(1);
  });
} catch (e) {
  console.error('****************************************************************');
  console.error('ERROR AL INTENTAR INICIAR EL SERVIDOR:', e);
  console.error('****************************************************************');
  process.exit(1);
}
console.log('[Express Backend] Fin del script server.js (parte síncrona). Node debería seguir corriendo.');