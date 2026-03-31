import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

const createLossSchema = z.object({
  amount: z.number().positive(),
  platform: z.string().optional(),
  date: z.string().datetime(), // ISO string
});

export async function lossRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', app.verifyJWT);

  app.get('/', async (request) => {
    const userId = (request.user as any).userId;
    const items = await prisma.gamblingLoss.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 50
    });
    return { items };
  });

  app.post('/', async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const body = createLossSchema.parse(request.body);

      // Create the loss and update user's total in a transaction
      const loss = await prisma.$transaction(async (tx) => {
        const newLoss = await tx.gamblingLoss.create({
          data: {
            userId,
            amount: body.amount,
            platform: body.platform,
            date: new Date(body.date)
          }
        });

        // Add to totalLost
        await tx.userProfile.upsert({
          where: { userId },
          create: { userId, totalLost: body.amount },
          update: { totalLost: { increment: body.amount } }
        });

        return newLoss;
      });

      return reply.code(201).send(loss);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Validation error', errors: error.errors });
      }
      app.log.error(error);
      return reply.code(500).send({ message: 'Error logging loss.' });
    }
  });
}
