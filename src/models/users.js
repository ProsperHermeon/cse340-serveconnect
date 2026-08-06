import bcrypt from 'bcrypt';

import db from './db.js';

/**
 * Inserts a new user, assigned to the 'user' role. The caller passes an already
 * hashed password. Returns the new user_id.
 */
const createUser = async (name, email, passwordHash) => {
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = 'user'))
        RETURNING user_id;
    `;
    const queryParams = [name, email, passwordHash];
    const result = await db.query(query, queryParams);

    return result.rows[0].user_id;
};

/**
 * Looks up a user by email, joining the roles table so the returned object
 * includes role_name (used to place the role on the session at login).
 * Returns the user row, or null if not found. Not exported - used internally
 * by authenticateUser.
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1;
    `;
    const queryParams = [email];

    const result = await db.query(query, queryParams);
    if (result.rows.length === 0) {
        return null; // User not found
    }

    return result.rows[0];
};

/**
 * Compares a plain-text password against a bcrypt hash. Returns true/false.
 * Not exported - used internally by authenticateUser.
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticates a login attempt. Finds the user by email and verifies the
 * password. On success, strips the password_hash and returns the user object
 * (which includes role_name). On any failure, returns null.
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);
    if (!passwordMatches) {
        return null;
    }

    // Never keep the hash on the object we hand back to the app / session.
    delete user.password_hash;
    return user;
};

/**
 * Retrieves every registered user with their role name, for the admin-only
 * users page.
 */
const getAllUsers = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.name;
    `;
    const result = await db.query(query);

    return result.rows;
};

export { createUser, authenticateUser, getAllUsers };
