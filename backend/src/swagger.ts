import swaggerJsdoc from 'swagger-jsdoc';

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
    // Explicitly list the route files
    apis: [
        './src/routes/authRoutes.ts',
        './src/routes/moviesRoutes.ts',
        './src/routes/watchlistRoutes.ts'
    ],
};

export const specs = swaggerJsdoc(options);