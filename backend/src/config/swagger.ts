import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AssetFlow API',
    version: '1.0.0',
    description: `
# AssetFlow — Enterprise Asset Management System API

A comprehensive REST API for managing enterprise assets, allocations, bookings, maintenance, and audits.

## Authentication
This API uses **JWT Bearer tokens** for authentication.
1. Login with \`POST /api/v1/auth/login\` to receive access and refresh tokens.
2. Include the access token in the \`Authorization: Bearer <token>\` header.
3. Use \`POST /api/v1/auth/refresh\` to refresh your access token.

## Roles
| Role | Access Level |
|------|-------------|
| \`ADMIN\` | Full access to all endpoints |
| \`ASSET_MANAGER\` | Can manage assets, approve requests |
| \`EMPLOYEE\` | Can view assets, make bookings/requests |

## Default Credentials (After Seed)
- **Admin**: \`admin@assetflow.com\` / \`Password@123\`
- **Manager**: \`manager1@assetflow.com\` / \`Password@123\`
- **Employee**: \`emp1@assetflow.com\` / \`Password@123\`
    `,
    contact: {
      name: 'AssetFlow Support',
      email: 'support@assetflow.com',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      description: 'Development Server',
    },
    {
      url: `https://api.assetflow.com${env.API_PREFIX}`,
      description: 'Production Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'array', items: {} },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalPages: { type: 'integer' },
              hasNext: { type: 'boolean' },
              hasPrev: { type: 'boolean' },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Assets', description: 'Asset management' },
    { name: 'Allocations', description: 'Asset allocation management' },
    { name: 'Transfers', description: 'Asset transfer requests' },
    { name: 'Bookings', description: 'Resource booking management' },
    { name: 'Maintenance', description: 'Maintenance request management' },
    { name: 'Departments', description: 'Department management' },
    { name: 'Categories', description: 'Asset category management' },
    { name: 'Resources', description: 'Bookable resource management' },
    { name: 'Audit', description: 'Asset audit cycle management' },
    { name: 'Notifications', description: 'User notification management' },
    { name: 'Dashboard', description: 'Dashboard statistics and charts' },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/docs/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
