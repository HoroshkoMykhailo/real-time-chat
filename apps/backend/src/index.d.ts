import { type User } from './modules/user/user.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null;
  }
}
