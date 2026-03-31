import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    verifyJWT: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
  }
}
