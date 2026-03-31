import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import crypto from 'crypto';
import { z } from 'zod';

const acceptSchema = z.object({
  token: z.string().min(10)
});

export async function guardianRoutes(app: FastifyInstance): Promise<void> {

  // 1. Check a token public info (does not require auth)
  app.get('/invite/:token', async (request, reply) => {
    const { token } = request.params as { token: string };
    const link = await prisma.guardianLink.findUnique({
      where: { inviteToken: token },
      include: { user: { select: { name: true } } }
    });

    if (!link || link.status !== 'PENDING') {
      return reply.code(404).send({ message: 'Invitación no válida o expirada' });
    }

    return { inviterName: link.user.name, status: link.status };
  });

  // --- Auth required for the rest ---
  
  // Status for the Ward (Player)
  app.get('/status', { preHandler: app.verifyJWT }, async (request) => {
    const userId = (request.user as any).userId;
    const link = await prisma.guardianLink.findFirst({
      where: { userId },
      include: { guardian: { select: { name: true, email: true } } }
    });
    
    if (!link) return { status: 'NONE' };
    
    return {
      status: link.status,
      inviteToken: link.inviteToken,
      guardian: link.guardian
    };
  });

  // Generate Invite Link (Player)
  app.post('/invite', { preHandler: app.verifyJWT }, async (request, reply) => {
    const userId = (request.user as any).userId;

    // A player can only have one guardian link in this MVP
    const existing = await prisma.guardianLink.findFirst({
      where: { userId }
    });

    if (existing) {
      if (existing.status === 'PENDING') return existing;
      return reply.code(400).send({ message: 'Ya tienes un proceso de guardián configurado' });
    }

    const token = crypto.randomBytes(16).toString('hex');
    
    const link = await prisma.guardianLink.create({
      data: {
        userId,
        guardianId: userId, // Temp self-reference hack for Prisma non-null requirement
        status: 'PENDING',
        inviteToken: token
      }
    });

    return link;
  });

  // Accept Invite (Guardian)
  app.post('/accept', { preHandler: app.verifyJWT }, async (request, reply) => {
    const guardianId = (request.user as any).userId; // Current logged user
    const { token } = acceptSchema.parse(request.body);

    const link = await prisma.guardianLink.findFirst({
      where: { inviteToken: token }
    });

    if (!link || link.status !== 'PENDING') {
      return reply.code(400).send({ message: 'Invitación no válida' });
    }

    if (link.userId === guardianId) {
      return reply.code(400).send({ message: 'No puedes ser tu propio guardián' });
    }

    // Role conversion
    await prisma.user.update({
      where: { id: guardianId },
      data: { role: 'GUARDIAN' }
    });

    const updated = await prisma.guardianLink.update({
      where: { id: link.id },
      data: {
        guardianId,
        status: 'ACTIVE',
        inviteToken: null, // Consume token
        acceptedAt: new Date()
      }
    });

    return updated;
  });

  // List wards for Guardian
  app.get('/wards', { preHandler: app.verifyJWT }, async (request, reply) => {
    const guardianId = (request.user as any).userId;
    const wards = await prisma.guardianLink.findMany({
      where: { guardianId, status: 'ACTIVE' },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            profile: { select: { currentStreak: true, totalLost: true } },
            blocklist: { select: { domain: true, name: true, isActive: true }, where: { isActive: true } }
          } 
        }
      }
    });

    return { wards };
  });

}
