import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; email: string; role: 'USER' | 'GUARDIAN' | 'ADMIN' };
    user: { userId: string; email: string; role: 'USER' | 'GUARDIAN' | 'ADMIN' };
  }
}
