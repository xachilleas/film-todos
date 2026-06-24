/**
 * Swagger/OpenAPI Configuration
 * Generates API documentation for the Film-Todos application.
 * Documentation is available at /api-docs when the server is running.
 *
 * @module swagger
 * @requires swagger-jsdoc
 */

import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger configuration options
 * Defines the OpenAPI specification structure and documentation sources
 */
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Film-Todos API',
            version: '1.0.0',
            description: 'API for managing movie watchlists with OMDb integration',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    /**
     * Paths to route files containing JSDoc comments for Swagger
     * These files will be scanned for @swagger annotations
     */
    apis: [
        './src/routes/authRoutes.ts',
        './src/routes/moviesRoutes.ts',
        './src/routes/watchlistRoutes.ts'
    ],
};

/**
 * Generated Swagger/OpenAPI specification
 * Used by swagger-ui-express to render the documentation UI
 */
export const specs = swaggerJsdoc(options);