import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Sales Catalog API',
      version: '1.0.0',
      description: 'OpenAPI docs for the Sales Catalog System',
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Auth
        UserSignup: {
          type: 'object',
          required: ['username', 'password', 'email'],
          properties: {
            username: { type: 'string', description: '3-30 chars: letters, numbers, underscore' },
            password: { type: 'string', description: '8-72 chars, at least one letter & number' },
            email:    { type: 'string', format: 'email', description: 'User email address' },
          },
        },
        UserLogin: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            accessToken:  { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        // Client
        ClientCreate: {
          type: 'object',
          required: ['code', 'name', 'nit'],
          properties: {
            code:  { type: 'string' },
            name:  { type: 'string' },
            nit:   { type: 'string' },
            email: { type: 'string', format: 'email', nullable: true },
            phone: { type: 'string', nullable: true },
          },
        },
        ClientResponse: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            code:      { type: 'string' },
            name:      { type: 'string' },
            nit:       { type: 'string' },
            email:     { type: 'string', format: 'email', nullable: true },
            phone:     { type: 'string', nullable: true },
            isDeleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // Discount
        DiscountCreate: {
          type: 'object',
          required: ['code', 'percentage', 'validFrom', 'productId'],
          properties: {
            code:       { type: 'string' },
            percentage: { type: 'number' },
            validFrom:  { type: 'string', format: 'date-time' },
            validTo:    { type: 'string', format: 'date-time', nullable: true },
            productId:  { type: 'string', format: 'uuid' },
          },
        },
        DiscountResponse: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            code:       { type: 'string' },
            percentage: { type: 'number' },
            validFrom:  { type: 'string', format: 'date-time' },
            validTo:    { type: 'string', format: 'date-time', nullable: true },
            isActive:   { type: 'boolean' },
            createdAt:  { type: 'string', format: 'date-time' },
            updatedAt:  { type: 'string', format: 'date-time' },
          },
        },
        // Product
        ProductCreate: {
          type: 'object',
          required: ['code', 'name', 'price', 'unit'],
          properties: {
            code:        { type: 'string' },
            name:        { type: 'string' },
            description: { type: 'string', nullable: true },
            price:       { type: 'number' },
            unit:        { type: 'string' },
          },
        },
        ProductResponse: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            code:      { type: 'string' },
            name:      { type: 'string' },
            description:{ type: 'string', nullable: true },
            price:     { type: 'number' },
            unit:      { type: 'string' },
            isDeleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            discount:  { $ref: '#/components/schemas/DiscountResponse' },
          },
        },
        // SaleItem
        SaleItemCreate: {
          type: 'object',
          required: ['productId', 'quantity', 'unitPrice', 'discountApplied'],
          properties: {
            productId:       { type: 'string', format: 'uuid' },
            quantity:        { type: 'number' },
            unitPrice:       { type: 'number' },
            discountApplied: { type: 'number' },
          },
        },
        SaleItemResponse: {
          type: 'object',
          properties: {
            id:              { type: 'string', format: 'uuid' },
            productId:       { type: 'string', format: 'uuid' },
            quantity:        { type: 'number' },
            unitPrice:       { type: 'number' },
            discountApplied: { type: 'number' },
            createdAt:       { type: 'string', format: 'date-time' },
            updatedAt:       { type: 'string', format: 'date-time' },
          },
        },
        // Sale
        SaleCreate: {
          type: 'object',
          required: ['date', 'subtotal', 'discountTotal', 'total', 'paymentMethod', 'items'],
          properties: {
            clientId:      { type: 'string', format: 'uuid', nullable: true },
            date:          { type: 'string', format: 'date-time' },
            subtotal:      { type: 'number' },
            discountTotal: { type: 'number' },
            total:         { type: 'number' },
            paymentMethod: { type: 'string', enum: ['cash'] },
            items:         { type: 'array', items: { $ref: '#/components/schemas/SaleItemCreate' } },
          },
        },
        SaleResponse: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            clientId:      { type: 'string', format: 'uuid', nullable: true },
            date:          { type: 'string', format: 'date-time' },
            subtotal:      { type: 'number' },
            discountTotal: { type: 'number' },
            total:         { type: 'number' },
            paymentMethod: { type: 'string' },
            isCanceled:    { type: 'boolean' },
            createdAt:     { type: 'string', format: 'date-time' },
            updatedAt:     { type: 'string', format: 'date-time' },
            items:         { type: 'array', items: { $ref: '#/components/schemas/SaleItemResponse' } },
          },
        },
      },
    },
    servers: [
      { url: `http://localhost:${process.env.PORT ?? 4000}/api` }
    ],
  },
  apis: [
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../../dist/controllers/*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req, res) => {
    res.type('application/json').send(swaggerSpec);
  });
}
