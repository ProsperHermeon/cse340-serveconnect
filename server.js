// ---------------------------------------------------------------------------
// server.js  —  ServeConnect application entry point
// ---------------------------------------------------------------------------

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getOrganizations,
  getProjects,
  getCategories
} from './models/siteData.js';

// Load variables from .env into process.env (PORT, etc.).
dotenv.config();

// ES modules do not provide __dirname/__filename, so we rebuild them from the
// module URL. We need an absolute path to point Express at /views and /public.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Render injects its own PORT; locally we fall back to 3000 from .env.
const port = process.env.PORT || 3000;

// --- View engine ---------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Static assets -------------------------------------------------------
// Serves everything in /public at the site root, so /css/styles.css and
// /images/*.svg resolve automatically.
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes --------------------------------------------------------------
app.get('/', async (req, res) => {
  res.render('index', { title: 'Home' });
});

app.get('/organizations', async (req, res) => {
  const organizations = await getOrganizations();
  res.render('organizations', { title: 'Organizations', organizations });
});

app.get('/projects', async (req, res) => {
  const projects = await getProjects();
  res.render('projects', { title: 'Service Projects', projects });
});

app.get('/categories', async (req, res) => {
  const categories = await getCategories();
  res.render('categories', { title: 'Service Project Categories', categories });
});

// --- 404 fallback --------------------------------------------------------
// Any request that did not match a route above lands here.
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// --- Start server --------------------------------------------------------
app.listen(port, () => {
  console.log(`ServeConnect is running at http://localhost:${port}`);
});
