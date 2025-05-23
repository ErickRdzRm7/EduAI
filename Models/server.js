// /Users/erick/Documents/proyecto/EduAI/Models/server.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); // Import Pool from pg
const cors = require('cors');   // <--- 1. Importar CORS
require('dotenv').config();

// Define the PostgreSQL connection pool HERE
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'localhost', // Usar variable de entorno para host o default a localhost
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.DB_PORT || 5432, // Ensure this is your PostgreSQL port
});

// (Optional) Test connection function - uses the 'pool' defined above
async function testConnection() {
  let client;
  try {
    console.log('Intentando conectar a la base de datos PostgreSQL...');
    client = await pool.connect(); // Uses the 'pool' from above
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

// --- 2. Configurar y usar CORS ---
// Es importante colocarlo antes de tus rutas API
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:9002', // Ajusta según la URL de tu frontend
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// --- Fin de la configuración de CORS ---

app.use(express.json()); // Middleware to parse JSON bodies

// Login Route - uses the 'pool' defined above
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Por favor, ingrese correo y contraseña.' });
  }

  try {
    const userQuery = await pool.query(
      'SELECT id, email, password_hash, name FROM users WHERE email = $1',
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciales inválidas. Usuario no encontrado.' }); // Mensaje más específico para depuración si quieres, pero genérico para producción
    }

    const user = userQuery.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas. Contraseña incorrecta.' }); // Mensaje más específico para depuración
    }

    const payload = {
      user: { id: user.id, email: user.email, name: user.name }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Considera hacerlo configurable o más largo/corto según necesidad
      (err, token) => {
        if (err) {
          console.error('Error al firmar el token JWT:', err);
          return res.status(500).json({ msg: 'Error al generar el token de autenticación.' });
        }
        res.json({
          msg: 'Login exitoso!',
          token,
          user: { id: user.id, name: user.name, email: user.email }
        });
      }
    );
  } catch (err) {
    console.error('Error en login:', err.message, err.stack);
    res.status(500).send('Error del servidor');
  }
});

// Aquí podrías añadir más rutas (ej. registro, rutas protegidas, etc.)

// Export 'app' if you have a separate entry point file that starts the server
// module.exports = app;

// Or, if this is your main server file, start listening:
const PORT = process.env.API_PORT || 5433;
app.listen(PORT, () => {
  console.log(`Servidor de API escuchando en el puerto ${PORT}`);
  testConnection(); // Test DB connection on server start
});


// En tu Models/server.js, dentro de app.post('/api/auth/register', ...)
app.post('/api/auth/register', async (req, res) => {
  console.log('--- Inicia /api/auth/register ---'); // NUEVO LOG
  const { name, email, password } = req.body;
  console.log('Datos recibidos para registro:', { name, email, password_length: password?.length }); // NUEVO LOG

  if (!name || !email || !password) {
    console.log('Registro: Validación fallida - campos faltantes'); // NUEVO LOG
    return res.status(400).json({ msg: 'Por favor, ingrese todos los campos: nombre, correo y contraseña.' });
  }
  if (password.length < 6) {
    console.log('Registro: Validación fallida - contraseña corta'); // NUEVO LOG
    return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    console.log('Registro Paso 1: Verificando si el usuario existe...'); // NUEVO LOG
    const existingUserQuery = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    console.log('Registro: Resultado de existingUserQuery.rows.length:', existingUserQuery.rows.length); // NUEVO LOG

    if (existingUserQuery.rows.length > 0) {
      console.log('Registro Error: El correo ya está registrado.'); // NUEVO LOG
      return res.status(400).json({ msg: 'El correo electrónico ya está registrado.' });
    }

    console.log('Registro Paso 2: Hasheando contraseña...'); // NUEVO LOG
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Registro: Contraseña hasheada (longitud):', hashedPassword?.length); // NUEVO LOG

    console.log('Registro Paso 3: Insertando nuevo usuario en la BD...'); // NUEVO LOG
    const newUserQuery = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );
    // Imprime todo el objeto newUserQuery para ver su estructura completa
    console.log('Registro: Resultado completo de newUserQuery:', JSON.stringify(newUserQuery, null, 2)); // NUEVO LOG DETALLADO

    if (newUserQuery.rows && newUserQuery.rows.length > 0) {
      const newUser = newUserQuery.rows[0];
      console.log('Registro: Nuevo usuario insertado:', newUser); // NUEVO LOG
      res.status(201).json({
        msg: 'Usuario registrado exitosamente.',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at }
      });
    } else {
      console.error('Registro Error: INSERT no devolvió filas, aunque no lanzó error SQL explícito.'); // NUEVO LOG
      res.status(500).json({ msg: 'Error al registrar el usuario, la inserción no devolvió datos.' });
    }

  } catch (err) {
    console.error('Error en el bloque catch de /api/auth/register:', err.message, err.stack); // Error general
    res.status(500).send('Error del servidor');
  }
  console.log('--- Finaliza /api/auth/register ---'); // NUEVO LOG
});


// --- RUTA DE PRUEBA ---
app.get('/test-server', (req, res) => {
  console.log('--- LOG DEL BACKEND: Solicitud GET recibida en /test-server ---');
  res.status(200).send('¡El servidor backend está respondiendo!');
});

// --- FIN DE RUTA DE PRUEBA ---
  app.listen(PORT, () => {
    console.log(`Servidor de API escuchando en el puerto ${PORT}`);
    testConnection();
  });

