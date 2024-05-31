import { z } from 'zod'

const schema = z.object({
	NODE_ENV: z.enum(['production', 'development', 'test'] as const),
	DATABASE_PATH: z.string(),
	DATABASE_URL: z.string(),
	SESSION_SECRET: z.string(),
	INTERNAL_COMMAND_TOKEN: z.string(),
	HONEYPOT_SECRET: z.string(),
	CACHE_DATABASE_PATH: z.string(),
	// If you plan on using Sentry, uncomment this line
	// SENTRY_DSN: z.string(),
	ALLOW_INDEXING: z.enum(['true', 'false']).optional(),

	TWILIO_TOKEN: z.string(),
	TWILIO_SID: z.string(),

	AWS_ACCESS_KEY_ID: z.string(),
	AWS_REGION: z.string(),
	AWS_SECRET_ACCESS_KEY: z.string(),
	AWS_ENDPOINT_URL_S3: z.string(),
	BUCKET_NAME: z.string(),
})

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof schema> {}
	}
}

export function init() {
	const parsed = schema.safeParse(process.env)

	if (parsed.success === false) {
		console.error(
			'❌ Invalid environment variables:',
			parsed.error.flatten().fieldErrors,
		)

		throw new Error('Invalid environment variables')
	}
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
	return {
		MODE: process.env.NODE_ENV,
		SENTRY_DSN: process.env.SENTRY_DSN,
		ALLOW_INDEXING: process.env.ALLOW_INDEXING,
	}
}

type ENV = ReturnType<typeof getEnv>

declare global {
	var ENV: ENV
	interface Window {
		ENV: ENV
	}
}
