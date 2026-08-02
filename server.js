// ---------------------------------------------------------------------------
// server.js  —  ServeConnect application entry point
//
// With the MVC restructure, this file only wires the app together: it sets up
// the view engine and static files, mounts the routes, and defines the 404 and
// 500 handlers. The actual request handling lives in the controllers, and the
// route definitions live in src/routes.js.
// ---------------------------------------------------------------------------

// Must be first: src/models/db.js reads process.env.DB_URL at import time, so
// the environment has to be loaded before any other import runs.
import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import router from './src/routes.js';
import { testConnection } from './src/models/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// --- View engine ---------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// --- Static assets -------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes --------------------------------------------------------------
app.use('/', router);

// --- 404 fallback --------------------------------------------------------
// Reached only when no route above matched the request.
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// --- 500 error handler ---------------------------------------------------
// Express recognizes this as the error handler by its four parameters. Any
// error passed to next(error) in a controller lands here.
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
