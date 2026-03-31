import type { FastifyInstance } from 'fastify';

export async function guardianRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', app.verifyJWT);

  app.get('/status', async (request) => {
    // Basic mock logic for MVP dashboard load.
    // In Phase 3, this will check GuardianLink and permission states.
    return {
      status: 'NONE',
      guardian: null,
      message: 'La función de guardianes se activará en la próxima fase.'
    };
  });
}
