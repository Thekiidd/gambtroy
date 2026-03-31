import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { findUserById, updateUserName } from '../../lib/store.js';

const updateProfileSchema = z.object({
  name: z.string().min(2)
});

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.get('/profile', { preHandler: [app.verifyJWT, app.audit] }, async (request, reply) => {
    const user = findUserById(request.user.userId);
    if (!user) return reply.code(404).send({ message: 'User not found.' });
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  });

  app.patch('/profile', { preHandler: [app.verifyJWT, app.audit] }, async (request, reply) => {
    const body = updateProfileSchema.parse(request.body);
    const user = updateUserName(request.user.userId, body.name);
    if (!user) return reply.code(404).send({ message: 'User not found.' });
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  });
}
