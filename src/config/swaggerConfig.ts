import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurazione per ES Modules
/*
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
*/

dotenv.config();

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task API with JWT Auth',
            version: '1.0.0',
            description: 'API completa con autenticazione JWT e gestione tasks',
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
                    bearerFormat: 'JWT',
                    description: 'Inserisci il token JWT nel formato: Bearer <token>'
                }
            },
            schemas: {
                // Aggiungi schemi comuni qui (esempio per User)
                User: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 6
                        }
                    }
                },
                Task: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        completed: {
                            type: 'boolean',
                            default: false
                        }
                    }
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [
        path.join(__dirname, '../src/routes/*.ts'),  // Include sia authRoutes che routes
        path.join(__dirname, '../src/controllers/*.ts')
    ]
};

const swaggerSpec = swaggerJsdoc(options);

// Debug: verifica i percorsi inclusi
console.log('Swagger sta cercando documentazione in:');
options.apis?.forEach(apiPath => console.log('-', apiPath));

export default swaggerSpec;