import swaggerUi from 'swagger-ui-express';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from '../docs/registry';
import '../docs/paths';

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'ForgeFit API',
    version: '1.0.0',
    description:
      'Backend API for ForgeFit — workout planning, session tracking and progress metrics.',
  },
  servers: [
    { url: 'http://localhost:4000/api', description: 'Local development' },
  ],
});

export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'ForgeFit API Docs',
  swaggerOptions: {
    persistAuthorization: true,
  },
});
