import bcrypt from 'bcryptjs';  // To hash and compare passwords securely
import jwt from 'jsonwebtoken';  // For generating JSON Web Tokens
import db from '../config/database.js';  // Import the DB connection

// Login controller
export const login = async (req, res) => {
    const { email, password } = req.body;  // Get the email and password from the request body

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password' });
    }

    try {
        // Query the database to find the user by email
        const [results] = await db.execute('SELECT * FROM accounts WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if the password matches the hashed password in the database
        const user = results[0];  // Since emails are unique, we expect only one user to be returned
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Generate a JSON Web Token (JWT) for the user
        const token = jwt.sign(
            { userId: user.Student_Number, email: user.email },  // Payload
            process.env.JWT_SECRET,  // Secret key (should be in .env file)
            { expiresIn: '1h' }  // Token expiry time
        );

        // Respond with the token and user details (optional)
        res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
