// src/config/swaggerConfig.ts
import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task API',
            version: '1.0.0',
            description: 'A simple API to manage tasks',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
                description: process.env.NODE_ENV === 'production'
                    ? 'Production server'
                    : 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [
        './src/routes/*.ts',       // Tutte le route
        './src/models/*.ts',       // Modelli/Interfacce
        './src/controllers/*.ts'   // Documentazione aggiuntiva
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;