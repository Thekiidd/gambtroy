import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { addLoss, getLosses } from '../../lib/store.js';

const createLossSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['MXN', 'USD']).default('MXN'),
  platform: z.string().optional(),
  description: z.string().optional(),
  date: z.string().datetime()
});

export async function lossRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { preHandler: [app.verifyJWT, app.audit] }, async (request) => {
    return { items: getLosses(request.user.userId) };
  });

  app.post('/', { preHandler: [app.verifyJWT, app.audit] }, async (request, reply) => {
    const body = createLossSchema.parse(request.body);
    const created = addLoss({ ...body, userId: request.user.userId });
    return reply.code(201).send(created);
  });

  app.get('/summary', { preHandler: [app.verifyJWT, app.audit] }, async (request) => {
    const allLosses = getLosses(request.user.userId);
    const total = allLosses.reduce((sum, loss) => sum + loss.amount, 0);
    return { total, count: allLosses.length, currency: 'MXN' };
  });
}
