import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Potential locations for .env:
// 1. server/.env (resolved relative to this file inside server/src/common/config)
// 2. root/.env (resolved relative to project root)
// 3. process.cwd()/server/.env
// 4. process.cwd()/.env
const candidatePaths = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(process.cwd(), 'server', '.env'),
  path.resolve(process.cwd(), '.env'),
];

let envPathLoaded = null;
for (const envPath of candidatePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envPathLoaded = envPath;
    break;
  }
}

if (!envPathLoaded) {
  dotenv.config();
}

export default process.env;

