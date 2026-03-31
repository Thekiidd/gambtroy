import type { FastifyReply, FastifyRequest } from 'fastify';

export async function auditMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  request.log.info(
    {
      method: request.method,
      path: request.url,
      userId: (request.user as { userId?: string } | undefined)?.userId ?? 'anonymous'
    },
    'audit_event'
  );
}
