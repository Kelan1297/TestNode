const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task API',
            version: '1.0.0',
            description: 'A simple API to manage tasks',
        },
    },
    apis: ['./server.js', './routes/taskRoutes.js'], // Aggiungi i file delle rotte
};

const swaggerDocs = swaggerJsdoc(options);
module.exports = swaggerDocs;
