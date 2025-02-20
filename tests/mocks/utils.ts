import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fsExtra from 'fs-extra'
import { z } from 'zod'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDirPath = path.join(__dirname, '..', 'fixtures')

export async function readFixture(subdir: string, name: string) {
	return fsExtra.readJSON(path.join(fixturesDirPath, subdir, `${name}.json`))
}

export async function createFixture(
	subdir: string,
	name: string,
	data: unknown,
) {
	const dir = path.join(fixturesDirPath, subdir)
	await fsExtra.ensureDir(dir)
	return fsExtra.writeJSON(path.join(dir, `./${name}.json`), data)
}

export const TextMessageSchema = z.object({
	To: z.string(),
	From: z.string(),
	Body: z.string(),
})

export async function writeText(rawText: unknown) {
	const textMessage = TextMessageSchema.parse(rawText)
	await createFixture('texts', textMessage.To, textMessage)
	return textMessage
}

export async function requireText(recipient: string) {
	const textMessage = await readText(recipient)
	if (!textMessage) throw new Error(`Text message to ${recipient} not found`)
	return textMessage
}

export async function readText(recipient: string) {
	try {
		const textMessage = await readFixture('texts', recipient)
		return TextMessageSchema.parse(textMessage)
	} catch (error) {
		console.error(`Error reading text message to ${recipient}`, error)
		return null
	}
}

export function requireHeader(headers: Headers, header: string) {
	if (!headers.has(header)) {
		const headersString = JSON.stringify(
			Object.fromEntries(headers.entries()),
			null,
			2,
		)
		throw new Error(
			`Header "${header}" required, but not found in ${headersString}`,
		)
	}
	return headers.get(header)
}
