import express from 'express';
import { routerLogin } from './routes/index.js';
import { configurePassport } from './config/passport.js';
import session from 'express-session';
import pkg from 'pg';
import dotenv from 'dotenv';


dotenv.config();

const { Pool } = pkg;
const app = express();



app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))
configurePassport(app);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ia_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});


app.get('/', (req, res) => {
  res.render('inicio', { user: req.user || null });;  
});

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');  // Redirige al inicio después de cerrar sesión
  });
});

app.get('/categorias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categoria');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    res.status(500).json({ error: 'Error al obtener categorías.' });
  }
});

app.get('/soluciones', async (req, res) => {
  const { categoria, precio, keyword } = req.query;
  let query = 'SELECT * FROM solucion_ia WHERE 1=1';
  const params = [];

  if (categoria) {
    params.push(categoria);
    query += ` AND categoria_id = $${params.length}`;
  }

  if (precio) {
    params.push(precio);
    query += ` AND precio = $${params.length}`;
  }

  if (keyword) {
    params.push(`%${keyword}%`);
    query += ` AND (nombre ILIKE $${params.length} OR descripcion ILIKE $${params.length})`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener soluciones:', err);
    res.status(500).json({ error: 'Error al obtener soluciones.' });
  }
});

app.post('/historial', async (req, res) => {
  const { usuario, busqueda } = req.body;
  try {
    await pool.query('INSERT INTO historial_busquedas (usuario, busqueda) VALUES ($1, $2)', [usuario, busqueda]);
    res.json({ message: 'Historial de búsquedas actualizado con éxito.' });
  } catch (err) {
    console.error('Error al guardar en el historial de búsquedas:', err);
    res.status(500).json({ error: 'Error al guardar en el historial de búsquedas.' });
  }
});

app.post('/clicks', async (req, res) => {
  const { usuario, solucion_id } = req.body;
  try {
    await pool.query('INSERT INTO historial_recomendaciones (usuario, solucion_id) VALUES ($1, $2)', [usuario, solucion_id]);
    res.json({ message: 'Clic registrado con éxito.' });
  } catch (err) {
    console.error('Error al registrar clic:', err);
    res.status(500).json({ error: 'Error al registrar clic.' });
  }
});

app.get('/recomendaciones', async (req, res) => {
  const usuario = req.query.usuario || 'guest';
  try {
    const result = await pool.query(
      `SELECT s.nombre, s.descripcion, s.enlace
       FROM historial_recomendaciones h
       JOIN solucion_ia s ON h.solucion_id = s.id
       WHERE h.usuario = $1
       ORDER BY h.fecha DESC
       LIMIT 5`,
      [usuario]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener recomendaciones:', err);
    res.status(500).json({ error: 'Error al obtener recomendaciones.' });
  }
});

// Endpoint para obtener descripción ampliada
app.get('/descripcion_ampliada/:solucionId', async (req, res) => {
  const { solucionId } = req.params;
  try {
    const result = await pool.query(
      'SELECT descripcion_ampliada FROM descripcion_ampliada WHERE solucion_id = $1',
      [solucionId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró la descripción ampliada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener descripción ampliada:', err);
    res.status(500).json({ error: 'Error al obtener descripción ampliada.' });
  }
});


routerLogin(app)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
