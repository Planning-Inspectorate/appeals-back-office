import { fileURLToPath } from 'url';
import path from 'node:path';

export default function dirname(importMetaUrl) {
	return path.dirname(fileURLToPath(importMetaUrl));
}
