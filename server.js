const express = require('express');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const swaggerUi = require('swagger-ui-express');
const { body, validationResult } = require('express-validator');
const errorHandler = require('./errorMiddleware');
const authRoutes = require('./authRoutes'); // Importa le rotte di autenticazione
const authenticateJWT = require('./authMiddleware');  // Importa il middleware JWT per la protezione delle rotte
const swaggerDocs = require('./swaggerConfig'); // Importa la configurazione Swagger

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Serve la documentazione interattiva
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rotte di autenticazione
app.use('/auth', authRoutes); // Rotte di autenticazione (register, login)

// Endpoint di base
app.get('/', (req, res) => {
    res.send('API is running');
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Restituisce la lista di tutti i task
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero di pagina (default 1)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Numero di task per pagina (default 10)
 *       - in: query
 *         name: title
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtro per titolo
 *       - in: query
 *         name: completed
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filtro per stato di completamento (true o false)
 *     responses:
 *       200:
 *         description: Lista di task filtrata e paginata
 */
app.get('/tasks', authenticateJWT, async (req, res, next) => {
    const { page = 1, limit = 10, title, completed } = req.query;

    // Calcolare l'offset per la paginazione
    const skip = (page - 1) * limit;

    try {
        // Creiamo i filtri dinamicamente
        const filters = {};

        if (title) {
            filters.title = {
                contains: title, // Filtro per il titolo (contiene la parola chiave)
                mode: 'insensitive', // Ignora maiuscole/minuscole
            };
        }

        if (completed !== undefined) {
            filters.completed = completed === 'true'; // Convertiamo a booleano
        }

        // Query con paginazione e filtri
        const tasks = await prisma.task.findMany({
            where: filters,
            skip: skip,
            take: Number(limit),
        });

        // Ottieni il totale dei task per il calcolo della paginazione
        const totalTasks = await prisma.task.count({ where: filters });

        res.json({
            tasks,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: Number(page),
            perPage: Number(limit),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /tasks/{uuid}:
 *   get:
 *     summary: Restituisce un task specifico
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: L'UUID del task
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dettagli del task
 *       404:
 *         description: Task non trovato
 */
app.get('/tasks/:uuid', authenticateJWT, async (req, res, next) => {
    try {
        const task = await prisma.task.findUnique({
            where: { uuid: req.params.uuid },
        });
        if (!task) return res.status(404).send('Task not found');
        res.json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crea un nuovo task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Task creato
 */
app.post('/tasks', [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
], authenticateJWT, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { title, description } = req.body;
        const task = await prisma.task.create({
            data: { title, description },
        });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /tasks/{uuid}:
 *   put:
 *     summary: Aggiorna un task esistente
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: L'UUID del task da aggiornare
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task aggiornato
 *       404:
 *         description: Task non trovato
 */
app.put('/tasks/:uuid', [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean')
], authenticateJWT, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { uuid } = req.params;
        const { title, description, completed } = req.body;
        const task = await prisma.task.update({
            where: { uuid },
            data: { title, description, completed },
        });
        res.json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /tasks/{uuid}:
 *   delete:
 *     summary: Elimina un task
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: L'UUID del task da eliminare
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task eliminato
 *       404:
 *         description: Task non trovato
 */
app.delete('/tasks/:uuid', authenticateJWT, async (req, res, next) => {
    try {
        const { uuid } = req.params;
        await prisma.task.delete({
            where: { uuid },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
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
