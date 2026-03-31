import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

const categorySchema = z.enum(['CASINO', 'SPORTS_BETTING', 'POKER', 'LOTTERY', 'SLOTS', 'OTHER']);

const createBlockedSiteSchema = z.object({
  domain: z.string().min(3),
  name: z.string().min(2),
  category: categorySchema,
  requiresGuardianToUnblock: z.boolean().default(true)
});

const idParamSchema = z.object({
  id: z.string().cuid()
});

export async function blocklistRoutes(app: FastifyInstance): Promise<void> {
  // Return early if we fail JWT auth
  app.addHook('preHandler', app.verifyJWT);

  app.get('/', async (request) => {
    const userId = (request.user as any).userId;
    const items = await prisma.blockedSite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return { items };
  });

  app.post('/', async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const body = createBlockedSiteSchema.parse(request.body);

      // Check duplicates
      const exists = await prisma.blockedSite.findFirst({
        where: { userId, domain: body.domain }
      });

      if (exists) {
        return reply.code(409).send({ message: 'El dominio ya está bloqueado.' });
      }

      const created = await prisma.blockedSite.create({
        data: {
          ...body,
          userId,
          addedBy: userId
        }
      });
      return reply.code(201).send(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Validation error', errors: error.errors });
      }
      app.log.error(error);
      return reply.code(500).send({ message: 'Error adding blocked site.' });
    }
  });

  app.delete('/:id', async (request, reply) => {
    try {
       const userId = (request.user as any).userId;
       const { id } = idParamSchema.parse(request.params);

       const site = await prisma.blockedSite.findFirst({ where: { id, userId } });
       if (!site) {
         return reply.code(404).send({ message: 'Site not found.' });
       }

       if (site.requiresGuardianToUnblock) {
         return reply.code(403).send({ message: 'Se requiere autorización del guardián para desbloquear.' });
       }

       await prisma.blockedSite.delete({ where: { id } });
       return reply.code(204).send();
    } catch (error) {
       app.log.error(error);
       return reply.code(500).send({ message: 'Error unblocking site.' });
    }
  });
}
