import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from "./config/swaggerConfig";
import routes from "./routes/routes";
import authRoutes from "./routes/authRoutes";// Importa le rotte di autenticazione
import {errorHandler} from "./middleware/errorMiddleware";// Middleware per gestione degli errori

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
app.use('/tasks', routes);

// Endpoint di base
app.get('/', (req, res) => {
    res.send('API is running');
});

// Middleware di gestione degli errori
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('📡 Server is now accepting requests!');
});
