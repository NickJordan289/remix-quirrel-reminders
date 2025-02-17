import { z } from 'zod'

export const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL } = z
    .object({
        DB_HOST: z.string(),
        DB_PORT: z.coerce.number(),
        DB_NAME: z.string(),
        DB_USER: z.string(),
        DB_PASSWORD: z.string().optional(),
        DB_SSL: z
            .enum(['true', 'false'])
            .transform((v) => v === 'true')
            .default('true'),
    })
    .parse(process.env)