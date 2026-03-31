import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    return reply.code(201).send({
      message: 'Registro inicial listo (pendiente Prisma/Auth completa).',
      user: { email: body.email, name: body.name }
    });
  });

  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const token = await reply.jwtSign({ email: body.email, role: 'USER' }, { expiresIn: '15m' });

    return reply.send({ token, tokenType: 'Bearer' });
  });

  app.get('/me', { preHandler: app.verifyJWT }, async (request) => {
    return { user: request.user };
  });
}
