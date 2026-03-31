import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string().min(32).default('change-this-in-production-32-chars!'),
  APP_URL: z.string().url().default('http://localhost:3000')
});

export const env = envSchema.parse(process.env);
