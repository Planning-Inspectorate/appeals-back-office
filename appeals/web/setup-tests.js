// load .env.test file
import dotenv from 'dotenv';
import path from 'node:path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Install mocks for third-party integration
import './testing/app/mocks/msal.js';
