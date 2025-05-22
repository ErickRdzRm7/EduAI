// Models/server.js

const { Pool } = require('pg');
require('dotenv').config(); // Make sure this is at the very top

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'localhost', // Directly use 'localhost' or define POSTGRES_HOST in .env
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432, // The port PostgreSQL is running on (from your DATABASE_URL)
});

// Your testConnection function (seems okay from the trace)
async function testConnection() {
  let client;
  try {
    console.log('Intentando conectar a la base de datos PostgreSQL...');
    // The error happens when pool.connect() is called, due to bad pool config
    client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Conexión exitosa a PostgreSQL! Hora actual del servidor de BD:', res.rows[0].now);
  } catch (err) {
    console.error('Error al conectar o ejecutar consulta en PostgreSQL:', err); // Removed .stack for cleaner initial error
    if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
      console.error('  TROUBLESHOOTING HINT:');
      console.error('  1. Is your PostgreSQL server running?');
      console.error('  2. Is the hostname/IP address correct? (Current host being tried for connection)');
      console.error('  3. Is the port correct? (Current port being tried)');
      console.error('  4. Is there a firewall blocking the connection?');
      console.error('  5. Are your .env variables (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, host, port) correctly loaded and set in the Pool configuration?');
    }
  } finally {
    if (client) {
      client.release();
      console.log('Cliente liberado.');
    }
  }
}

testConnection();

module.exports = pool; // Export the pool for other parts of your app