import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load project-root .env first, then server/.env (neither overrides existing values)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const toPort = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 5000;
};

// Models are tried in order. Override the first one with GEMINI_MODEL in .env.
const geminiModels = [
  process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim(),
  'gemini-3.5-flash',
  'gemini-2.5-flash'
].filter(Boolean);

export const config = {
  port: toPort(process.env.PORT),
  githubToken: (process.env.GITHUB_TOKEN || '').trim(),
  geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
  geminiModels: [...new Set(geminiModels)],
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  nodeEnv: process.env.NODE_ENV || 'development'
};
