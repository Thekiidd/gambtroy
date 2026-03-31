import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { acceptGuardianInvite, inviteGuardian, listGuardianInvites } from '../../lib/store.js';

const inviteSchema = z.object({
  guardianEmail: z.string().email()
});

const inviteIdSchema = z.object({
  id: z.string().uuid()
});

export async function guardianRoutes(app: FastifyInstance): Promise<void> {
  app.post('/invite', { preHandler: [app.verifyJWT, app.audit] }, async (request, reply) => {
    const body = inviteSchema.parse(request.body);
    const invite = inviteGuardian(request.user.userId, body.guardianEmail);
    return reply.code(201).send(invite);
  });

  app.get('/links', { preHandler: [app.verifyJWT, app.audit] }, async (request) => {
    return { items: listGuardianInvites(request.user.userId) };
  });

  app.patch('/links/:id/accept', { preHandler: [app.verifyJWT, app.audit] }, async (request, reply) => {
    const { id } = inviteIdSchema.parse(request.params);
    const updated = acceptGuardianInvite(id, request.user.userId);
    if (!updated) return reply.code(404).send({ message: 'Invite not found.' });
    return updated;
  });
}
