import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import app from './app';
import { logger } from './utils/logger';

const PORT = env.PORT;

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info('==============================================');
      logger.info('🚀 AssetFlow Backend Server Started');
      logger.info('==============================================');
      logger.info(`📡 Environment:  ${env.NODE_ENV}`);
      logger.info(`🌐 Server URL:   http://localhost:${PORT}`);
      logger.info(`📋 API Prefix:   ${env.API_PREFIX}`);
      logger.info(`📚 API Docs:     http://localhost:${PORT}/api/docs`);
      logger.info(`❤️  Health:       http://localhost:${PORT}${env.API_PREFIX}/health`);
      logger.info('==============================================');
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 10s timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
