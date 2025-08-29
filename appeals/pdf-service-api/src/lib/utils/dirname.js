import path from 'node:path';
import { fileURLToPath } from 'url';

export default function dirname(importMetaUrl) {
	return path.dirname(fileURLToPath(importMetaUrl));
}
