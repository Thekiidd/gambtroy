import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { loginUser, registerUser } from '../../lib/store.js';

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

    try {
      const user = registerUser(body.email, body.name, body.password);
      return reply.code(201).send({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_TAKEN') {
        return reply.code(409).send({ message: 'Email already exists.' });
      }
      return reply.code(500).send({ message: 'Unexpected error on register.' });
    }
  });

  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = loginUser(body.email, body.password);

    if (!user) {
      return reply.code(401).send({ message: 'Invalid credentials.' });
    }

    const token = await reply.jwtSign(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' }
    );

    return reply.send({ token, tokenType: 'Bearer' });
  });

  app.get('/me', { preHandler: app.verifyJWT }, async (request) => {
    return { user: request.user };
  });
}
