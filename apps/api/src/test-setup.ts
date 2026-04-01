import { readFile } from 'fs/promises';
import * as path from 'path';

// Manually parse the .env file — the project uses "KEY =VALUE" format with
// spaces around "=" which dotenv v17 does not parse.
export default async function globalSetup() {
  const envPath = path.resolve(process.cwd(), '.env');
  try {
    const content = await readFile(envPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env file not found, skip
  }
}
