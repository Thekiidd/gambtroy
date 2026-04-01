import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import crypto from 'crypto';
import { z } from 'zod';

const acceptSchema = z.object({
  token: z.string().min(10)
});

export async function guardianRoutes(app: FastifyInstance): Promise<void> {

  // 1. Public: check token info
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

  // --- Auth required from here ---

  // Guardian status for the Ward (Player)
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

  // Generate Invite Link (Ward/Player)
  app.post('/invite', { preHandler: app.verifyJWT }, async (request, reply) => {
    const userId = (request.user as any).userId;

    const existing = await prisma.guardianLink.findFirst({ where: { userId } });

    if (existing) {
      if (existing.status === 'PENDING') return existing;
      return reply.code(400).send({ message: 'Ya tienes un proceso de guardián configurado' });
    }

    const token = crypto.randomBytes(16).toString('hex');

    const link = await prisma.guardianLink.create({
      data: {
        userId,
        guardianId: userId, // Temp self-reference until accepted
        status: 'PENDING',
        inviteToken: token
      }
    });

    return link;
  });

  // Revoke guardian (Ward/Player)
  app.delete('/revoke', { preHandler: app.verifyJWT }, async (request, reply) => {
    const userId = (request.user as any).userId;

    const link = await prisma.guardianLink.findFirst({ where: { userId } });

    if (!link) {
      return reply.code(404).send({ message: 'No tienes un guardián activo.' });
    }

    // Update guardian's role back to USER if they have no other wards
    if (link.status === 'ACTIVE' && link.guardianId !== userId) {
      const otherWards = await prisma.guardianLink.count({
        where: { guardianId: link.guardianId, status: 'ACTIVE', id: { not: link.id } }
      });
      if (otherWards === 0) {
        await prisma.user.update({
          where: { id: link.guardianId },
          data: { role: 'USER' }
        });
      }
    }

    await prisma.guardianLink.update({
      where: { id: link.id },
      data: { status: 'REVOKED', inviteToken: null }
    });

    return { message: 'Guardián revocado correctamente.' };
  });

  // Accept Invite (Guardian)
  app.post('/accept', { preHandler: app.verifyJWT }, async (request, reply) => {
    const guardianId = (request.user as any).userId;
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

    await prisma.user.update({
      where: { id: guardianId },
      data: { role: 'GUARDIAN' }
    });

    const updated = await prisma.guardianLink.update({
      where: { id: link.id },
      data: {
        guardianId,
        status: 'ACTIVE',
        inviteToken: null,
        acceptedAt: new Date()
      }
    });

    return updated;
  });

  // List wards for Guardian (with unblock requests)
  app.get('/wards', { preHandler: app.verifyJWT }, async (request) => {
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
            blocklist: {
              select: { id: true, domain: true, name: true, isActive: true, requiresGuardianToUnblock: true },
              where: { isActive: true }
            }
          }
        }
      }
    });

    return { wards };
  });

  // Approve unblock request
  app.post('/approve-unblock/:siteId', { preHandler: app.verifyJWT }, async (request, reply) => {
    const guardianId = (request.user as any).userId;
    const { siteId } = request.params as { siteId: string };

    // Verify this guardian supervises the site's owner
    const site = await prisma.blockedSite.findUnique({
      where: { id: siteId },
      include: {
        user: {
          include: {
            wardLinks: { where: { guardianId, status: 'ACTIVE' } }
          }
        }
      }
    });

    if (!site) {
      return reply.code(404).send({ message: 'Sitio no encontrado.' });
    }

    if (!site.user.wardLinks || site.user.wardLinks.length === 0) {
      return reply.code(403).send({ message: 'No eres guardián de este usuario.' });
    }

    // Delete the blocked site (approve unblock = actually delete it)
    await prisma.blockedSite.delete({ where: { id: siteId } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: site.userId,
        action: 'GUARDIAN_APPROVED_UNBLOCK',
        entityType: 'BlockedSite',
        entityId: siteId,
        metadata: { domain: site.domain, guardianId }
      }
    });

    return { message: `${site.name} desbloqueado por el guardián.` };
  });

  // Deny unblock request (just log it, site stays blocked)
  app.post('/deny-unblock/:siteId', { preHandler: app.verifyJWT }, async (request, reply) => {
    const guardianId = (request.user as any).userId;
    const { siteId } = request.params as { siteId: string };

    const site = await prisma.blockedSite.findUnique({
      where: { id: siteId },
      include: {
        user: {
          include: {
            wardLinks: { where: { guardianId, status: 'ACTIVE' } }
          }
        }
      }
    });

    if (!site || !site.user.wardLinks?.length) {
      return reply.code(403).send({ message: 'No autorizado.' });
    }

    await prisma.auditLog.create({
      data: {
        userId: site.userId,
        action: 'GUARDIAN_DENIED_UNBLOCK',
        entityType: 'BlockedSite',
        entityId: siteId,
        metadata: { domain: site.domain, guardianId }
      }
    });

    return { message: `Desbloqueo de ${site.name} denegado.` };
  });

}
