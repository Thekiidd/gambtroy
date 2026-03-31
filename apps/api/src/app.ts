import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { env } from './lib/env.js';
import { authRoutes } from './routes/auth/index.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: env.APP_URL, credentials: true });
  app.register(helmet);
  app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  app.register(jwt, { secret: env.JWT_SECRET });

  app.decorate('verifyJWT', async function verifyJWT(request, reply) {
    await request.jwtVerify();
  });

  app.register(async (protectedApp) => {
    protectedApp.register(authRoutes, { prefix: '/auth' });
  }, { prefix: '/api/v1' });

  app.get('/health', async () => ({ status: 'ok', service: 'gambtroy-api' }));

  return app;
}
