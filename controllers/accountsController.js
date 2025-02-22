
import db from '../config/database.js'; // Assuming your DB connection is set up correctly
import express from 'express';
const router = express.Router();  // Correcting the router initialization

// Get all accounts
export const getAccounts = async (req, res, next) => {
    try {
        const [results] = await db.execute('SELECT * FROM accounts');  // Using `execute` method for queries
        res.json(results);  // Send the accounts as JSON response
    } catch (err) {
        const error = new Error(`Unable to fetch posts`);
        error.status = 404;
        res.status(500).json({ error: err.message });
        return next(error);
    }
};

export default router;

