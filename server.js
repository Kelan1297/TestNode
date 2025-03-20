const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerConfig');
const taskRoutes = require('./routes/taskRoutes'); // Importa le rotte dei task
const authRoutes = require('./routes/authRoutes'); // Importa le rotte di autenticazione
const errorHandler = require('./errorMiddleware'); // Middleware per gestione degli errori

// Carica variabili d'ambiente dal file .env
dotenv.config();

const app = express();

// Middleware per parse JSON
app.use(express.json());

// Serve la documentazione interattiva di Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rotte di autenticazione
app.use('/auth', authRoutes);

// Rotte dei task
app.use('/tasks', taskRoutes);

// Endpoint di base
app.get('/', (req, res) => {
    res.send('API is running');
});

// Middleware di gestione degli errori
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

try {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Server is now accepting requests!');
    });
} catch (error) {
    console.error('Error starting server:', error);
}
