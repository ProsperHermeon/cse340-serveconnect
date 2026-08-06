import bcrypt from 'bcrypt';

import { createUser, authenticateUser, getAllUsers } from '../models/users.js';

const SALT_ROUNDS = 10;

// --- Registration --------------------------------------------------------

const showUserRegistrationForm = async (req, res) => {
    res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Never store the plain-text password - hash it first.
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        await createUser(name, email, passwordHash);

        req.flash('success', 'Registration successful! You can now log in.');
        res.redirect('/login');
    } catch (error) {
        // A duplicate email trips the UNIQUE constraint (Postgres code 23505).
        if (error.code === '23505') {
            req.flash('error', 'An account with that email already exists.');
            return res.redirect('/register');
        }
        next(error);
    }
};

// --- Login / Logout ------------------------------------------------------

const showLoginForm = async (req, res) => {
    res.render('login', { title: 'Log In' });
};

const processLoginForm = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await authenticateUser(email, password);

        if (user) {
            // Store the user (name, email, role_name - no password hash) on the
            // session so the server remembers them across requests.
            req.session.user = user;
            req.flash('success', 'Login successful!');
            console.log('User logged in:', user);
            return res.redirect('/dashboard');
        }

        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
    } catch (error) {
        next(error);
    }
};

const processLogout = async (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error);
        }
        res.redirect('/login');
    });
};

// --- Access-control middleware -------------------------------------------

/**
 * Blocks a route unless a user is logged in. Runs before the route handler;
 * calls next() to continue, or redirects to the login page.
 */
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to view that page.');
        return res.redirect('/login');
    }
    next();
};

/**
 * A middleware FACTORY: it takes the required role and RETURNS a middleware
 * function. This is necessary because Express middleware only receives
 * (req, res, next) - there is no slot for a role argument - so we close over
 * `role` and return a middleware that remembers it.
 *
 * Not logged in -> login page. Logged in but wrong role -> dashboard with a
 * message. Correct role -> continue.
 */
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error', 'You must be logged in to view that page.');
            return res.redirect('/login');
        }
        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to view that page.');
            return res.redirect('/dashboard');
        }
        next();
    };
};

// --- Dashboard + Users list ----------------------------------------------

const showDashboard = async (req, res) => {
    const { name, email } = req.session.user;
    res.render('dashboard', { title: 'Dashboard', name, email });
};

const showUsersPage = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.render('users', { title: 'Registered Users', users });
    } catch (error) {
        next(error);
    }
};

export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard,
    showUsersPage
};
