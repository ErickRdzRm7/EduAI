const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

// Middleware de autenticación
const authMiddleware = require('../Middleware/authMiddleware'); // Asegúrate que esta ruta sea correcta

// --- INICIALIZACIÓN DE EXPRESS ---
const app = express();

// --- CONFIGURACIÓN DEL POOL DE POSTGRESQL ---
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
    console.log('[Express Backend] Intentando conectar a la base de datos PostgreSQL...');
    client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('[Express Backend] Conexión exitosa a PostgreSQL! Hora actual del servidor de BD:', res.rows[0].now);
  } catch (err) {
    console.error('[Express Backend] Error al conectar o ejecutar consulta en PostgreSQL:', err);
  } finally {
    if (client) {
      client.release();
      console.log('[Express Backend] Cliente de BD liberado.');
    }
  }
}

// --- MIDDLEWARES DE EXPRESS ---
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:9002', // O tu puerto de Next.js
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
console.log('[Express Backend] Middlewares CORS y JSON aplicados.');

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
    const payload = { user: { id: user.id, email: user.email, name: user.name } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('[Express Backend] Error al firmar el token JWT:', err);
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


// --- RUTAS DE TEMAS (METADATOS) ---

/**
 * POST /api/topics
 * Crea los METADATOS para un nuevo tema en la base de datos.
 * El contenido detallado será generado por IA desde el frontend o un endpoint de Next.js.
 * Requiere autenticación.
 */
app.post('/api/topics', authMiddleware, async (req, res) => {
  const userId = req.user.id; // user.id es BIGINT
  const { title, slug, description, level } = req.body; // No se espera 'ai_generated_content' del cliente aquí

  console.log(`[Express Backend] Intento de crear metadatos de tema por usuario ${userId}: Título "${title}", Slug "${slug}"`);

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

    // Insertar solo los metadatos. La columna 'ai_generated_content' en la BD
    // podría ser NULL o tener un valor por defecto si la IA la poblará después
    // o si el frontend la maneja sin guardarla aquí.
    // Para este ejemplo, no insertamos en 'ai_generated_content'.
    const newTopicQuery = await pool.query(
      `INSERT INTO topics (user_id, title, slug, description, level) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, title, slug, description, level, created_at, updated_at`, // No se retorna ai_generated_content
      [userId, title, slug, description || null, level]
    );

    const createdTopic = newTopicQuery.rows[0];
    console.log(`[Express Backend] Metadatos de tema creados en BD para usuario ${userId}: ID del tema ${createdTopic.id}`);
    res.status(201).json(createdTopic);

  } catch (err) {
    console.error(`[Express Backend] Error en POST /api/topics (creando metadatos de tema "${title}"):`, err.message, err.stack);
    if (err.code === '23505' && (err.constraint === 'topics_slug_key' || err.constraint === 'topics_slug_idx' /* o como se llame tu unique constraint de slug */)) { 
        return res.status(400).json({ msg: 'Este slug ya está en uso. Por favor, elige otro.'});
    }
    res.status(500).json({ msg: 'Error del servidor al crear los metadatos del tema.', details: err.message });
  }
});

/**
 * GET /api/topics/:slug
 * Obtiene los METADATOS de un tema específico por su slug desde la base de datos.
 * El frontend usará estos metadatos para luego solicitar la generación de contenido a la IA.
 */
app.get('/api/topics/:slug', async (req, res) => {
  const { slug } = req.params;
  console.log(`[Express Backend] Solicitud GET para metadatos de /api/topics/${slug}`);

  if (!slug) {
    return res.status(400).json({ msg: 'Slug del tema no proporcionado.' });
  }

  try {
    const topicQuery = await pool.query(
      // Seleccionamos solo metadatos. 'ai_generated_content' no se gestiona aquí.
      'SELECT id, slug, title, description, level, user_id, created_at, updated_at FROM topics WHERE slug = $1',
      [slug]
    );

    if (topicQuery.rows.length === 0) {
      console.log(`[Express Backend] Metadatos de tema no encontrados en BD con slug: ${slug}`);
      return res.status(404).json({ msg: 'Tema no encontrado.' });
    }

    const topicMetadata = topicQuery.rows[0];    
    console.log(`[Express Backend] Metadatos de tema encontrados en BD y devueltos: ${topicMetadata.title}`);
    res.status(200).json(topicMetadata); // Devolvemos solo los metadatos

  } catch (err) {
    console.error(`[Express Backend] Error en GET /api/topics/${slug} (metadatos):`, err.message, err.stack);
    res.status(500).json({ msg: 'Error interno del servidor al obtener los metadatos del tema.', details: err.message });
  }
});


// --- RUTA DE PRUEBA ---
app.get('/test-server', (req, res) => {
  console.log('[Express Backend] --- Solicitud GET recibida en /test-server ---');
  res.status(200).send('¡El servidor backend de Express está respondiendo!');
});

// --- INICIO DEL SERVIDOR Y LIMPIEZA ---
const PORT = process.env.API_PORT || 5433;
let serverInstance; // Definir serverInstance fuera para que sea accesible por cleanup

try {
  serverInstance = app.listen(PORT, () => {
    console.log(`[Express Backend] Servidor de API Express escuchando en el puerto ${PORT}`);
    // testConnection(); // Comentado según pruebas anteriores, puedes reactivarlo si lo deseas
  });
  console.log('[Express Backend] Llamada a app.listen() completada.');

  serverInstance.on('error', (error) => {
    console.error('****************************************************************');
    console.error('ERROR EN EL SERVIDOR HTTP (app.listen):', error);
    console.error('****************************************************************');
    process.exit(1);
  });

} catch (e) {
  console.error('****************************************************************');
  console.error('ERROR AL INTENTAR INICIAR EL SERVIDOR (catch síncrono alrededor de app.listen):', e);
  console.error('****************************************************************');
  process.exit(1);
}


console.log('[Express Backend] Fin del script server.js (parte síncrona). Node debería seguir corriendo por app.listen().');