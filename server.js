// ---------------------------------------------------------------------------
// server.js  —  ServeConnect application entry point
// ---------------------------------------------------------------------------

// IMPORTANT: this must be the FIRST import.
// ES module imports are evaluated in order, top to bottom, BEFORE any code in
// this file's body runs. src/models/db.js reads process.env.DB_URL the moment it
// is imported, so the .env file has to already be loaded by then. Importing
// 'dotenv/config' first guarantees that. Calling dotenv.config() further down in
// the file body would run too late, and the pool would be built with an
// undefined connection string.
import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllProjects } from './src/models/projects.js';
import { getAllCategories } from './src/models/categories.js';

// ES modules do not provide __dirname/__filename, so we rebuild them from the
// module URL. We need absolute paths to point Express at /src/views and /public.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// --- View engine ---------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// --- Static assets -------------------------------------------------------
// Serves everything in /public at the site root, so /css/styles.css and
// /images/*.png resolve automatically.
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes --------------------------------------------------------------
app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('index', { title });
});

app.get('/organizations', async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';

        res.render('organizations', { title, organizations });
    } catch (error) {
        next(error);
    }
});

app.get('/projects', async (req, res, next) => {
    try {
        const projects = await getAllProjects();
        const title = 'Service Projects';

        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
});

app.get('/categories', async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Project Categories';

        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
});

// --- 404 fallback --------------------------------------------------------
// No path, so it catches any request the routes above did not match.
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// --- Error handler -------------------------------------------------------
// Express identifies this as the error handler by its four parameters. Anything
// passed to next(error) above lands here instead of hanging the request.
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).render('500', { title: 'Server Error' });
});

// --- Start server --------------------------------------------------------
app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
});
