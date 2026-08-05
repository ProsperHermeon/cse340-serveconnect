// ---------------------------------------------------------------------------
// server.js  —  ServeConnect application entry point
//
// Wires the app together: sessions, flash messages, body parsing, static
// files, routes, and the 404/500 handlers. Request handling lives in the
// controllers; route definitions live in src/routes.js.
// ---------------------------------------------------------------------------

// Must be first: src/models/db.js reads process.env.DB_URL at import time.
import 'dotenv/config';

import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import flash from './src/middleware/flash.js';
import router from './src/routes.js';
import { testConnection } from './src/models/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const SESSION_SECRET = process.env.SESSION_SECRET;

// --- View engine ---------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// --- Session management --------------------------------------------------
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // Session expires after 1 hour of inactivity
}));

// --- Flash messages ------------------------------------------------------
app.use(flash);

// --- Parse POST data -----------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Static assets -------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes --------------------------------------------------------------
app.use('/', router);

// --- 404 fallback --------------------------------------------------------
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// --- 500 error handler ---------------------------------------------------
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
