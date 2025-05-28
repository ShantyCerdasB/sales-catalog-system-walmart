import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger / OpenAPI setup.
 *
 * Scans JSDoc comments in controllers under /controllers.
 */
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Sales Catalog API',
      version: '1.0.0',
      description: 'OpenAPI documentation for the Sales Catalog System',
    },
    servers: [{ url: '/api' }],
  },
  apis: ['./src/controllers/*.ts'],  
};

const spec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}
