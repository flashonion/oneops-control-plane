import { z } from 'zod'

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4174),
  DATA_MODE: z.enum(['demo', 'live']).default('demo'),
  SNAPSHOT_TTL_MS: z.coerce.number().int().min(1_000).max(300_000).default(30_000),
})

export type AppConfig = z.infer<typeof configSchema>

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse(env)
}
