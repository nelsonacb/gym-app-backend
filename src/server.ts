import { prisma } from '../lib/prisma';
import app from './app';
import { env } from './config';
import logger from './utils/logger';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');
    app.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

startServer();
