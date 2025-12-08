/**
 * User model for database operations
 */

const { query } = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Create a new user
 * @param {object} userData - User data
 * @returns {Promise<object>} - Created user
 */
async function createUser({ name, email, password, role }) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
        `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash, role]
    );

    return result.rows[0];
}

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<object|null>} - User object or null
 */
async function findUserByEmail(email) {
    const result = await query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
    );

    return result.rows[0] || null;
}

/**
 * Find user by ID
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} - User object or null
 */
async function findUserById(userId) {
    const result = await query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1 AND is_active = true',
        [userId]
    );

    return result.rows[0] || null;
}

/**
 * Verify user password
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password from database
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - Success
 */
async function updatePassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, userId]
    );

    return true;
}

/**
 * Get all users (admin only)
 * @returns {Promise<array>} - List of users
 */
async function getAllUsers() {
    const result = await query(
        'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    return result.rows;
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    verifyPassword,
    updatePassword,
    getAllUsers,
};
