// authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware per verificare l'autenticazione
const authenticateJWT = (req, res, next) => {
    // Ottieni il token dalla header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verifica il token JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // Aggiungi l'utente decodificato alla richiesta
        req.user = user;
        next();  // Vai alla route successiva
    });
};

module.exports = authenticateJWT;
