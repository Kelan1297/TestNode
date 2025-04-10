import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from "./config/swaggerConfig";
import routes from "./routes/routes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorMiddleware";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

/*// Configurazione Swagger UI avanzata
const swaggerOptions = {
    customSiteTitle: "Task API Documentation",
    customCss: '.swagger-ui .topbar { background-color: #2c3e50 }',
    customfavIcon: '/assets/favicon.ico',
    explorer: true
};*/

/*app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    (req: express.Request, requestTypes.ts: express.Response, next: express.NextFunction) => {
        // Inietta il JWT token nella UI se presente
        if (req.query.token) {
            (swaggerDocs as any).components.securitySchemes.bearerAuth.default = `Bearer ${req.query.token}`;
        }
        swaggerUi.setup(swaggerDocs, swaggerOptions)(req, requestTypes.ts, next);
    }
);*/

// Rotte API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', routes);

// Health Check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Endpoint di base
app.get('/api/v1/', (req, res) => {
    res.redirect('/api/v1/docs'); // Reindirizza automaticamente alla documentazione
});

// Middleware di gestione errori
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/v1/docs`);
    console.log(`🔐 Test Auth: http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`📝 Test Tasks: http://localhost:${PORT}/api/v1/tasks`);
});