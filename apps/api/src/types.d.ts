import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { email: string; role: 'USER' | 'GUARDIAN' | 'ADMIN' };
    user: { email: string; role: 'USER' | 'GUARDIAN' | 'ADMIN' };
  }
}
