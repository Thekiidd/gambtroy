import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';

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
    try {
      const body = registerSchema.parse(request.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email }
      });

      if (existingUser) {
        return reply.code(409).send({ message: 'Email already exists.' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(body.password, 10);

      // Create User and default UserProfile
      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          passwordHash,
          profile: {
            create: {} // Creates a default UserProfile since it's required/helpful
          }
        }
      });

      return reply.code(201).send({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Validation error', errors: error.errors });
      }
      app.log.error(error);
      return reply.code(500).send({ message: 'Unexpected error on register.' });
    }
  });

  app.post('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email: body.email }
      });

      if (!user || !user.passwordHash) {
        return reply.code(401).send({ message: 'Invalid credentials.' });
      }

      const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);

      if (!isValidPassword) {
        return reply.code(401).send({ message: 'Invalid credentials.' });
      }

      const token = await reply.jwtSign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: '7d' } // 7 days for ease during MVP
      );

      return reply.send({ token, tokenType: 'Bearer', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Validation error', errors: error.errors });
      }
      app.log.error(error);
      return reply.code(500).send({ message: 'Unexpected error on login.' });
    }
  });

  app.get('/me', { preHandler: app.verifyJWT }, async (request, reply) => {
    const userId = (request.user as any).userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, profile: true, _count: { select: { blocklist: true } } }
    });

    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    return { user };
  });
}
