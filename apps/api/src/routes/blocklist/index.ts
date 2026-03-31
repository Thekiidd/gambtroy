import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { addBlockedSite, getBlockedSites, removeBlockedSite, toggleBlockedSite } from '../../lib/store.js';

const categorySchema = z.enum(['CASINO', 'SPORTS_BETTING', 'POKER', 'LOTTERY', 'SLOTS', 'OTHER']);

const createBlockedSiteSchema = z.object({
  domain: z.string().min(3),
  name: z.string().min(2),
  category: categorySchema,
  requiresGuardianToUnblock: z.boolean().default(true)
});

const idParamSchema = z.object({
  id: z.string().uuid()
});

export async function blocklistRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { preHandler: [app.verifyJWT, app.audit] }, async (request) => {
    return { items: getBlockedSites(request.user.userId) };
  });

  app.post('/', { preHandler: [app.verifyJWT, app.audit] }, async (request, reply) => {
    const body = createBlockedSiteSchema.parse(request.body);
    const created = addBlockedSite({ ...body, userId: request.user.userId, isActive: true });
    return reply.code(201).send(created);
  });

  app.patch('/:id/toggle', { preHandler: [app.verifyJWT, app.audit] }, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const updated = toggleBlockedSite(id, request.user.userId);
    if (!updated) return reply.code(404).send({ message: 'Blocked site not found.' });
    return updated;
  });

  app.delete('/:id', { preHandler: [app.verifyJWT, app.audit] }, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const ok = removeBlockedSite(id, request.user.userId);
    return reply.code(ok ? 204 : 404).send();
  });
}
