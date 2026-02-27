import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().default(''),
  APP_URL: z.string().min(1).default('http://localhost:3000'),
  ENABLE_API_MOCKING: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse({
  API_URL: import.meta.env.VITE_APP_API_URL,
  APP_URL: import.meta.env.VITE_APP_APP_URL,
  ENABLE_API_MOCKING: import.meta.env.VITE_APP_ENABLE_API_MOCKING,
  MODE: import.meta.env.MODE,
});
