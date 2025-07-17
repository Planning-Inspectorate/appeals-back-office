import { nunjucksEnv, templatesDir } from '#notify/notify-send.js';
import fs from 'node:fs';

describe('notify-templates', () => {
	it('should compile all templates successfully', () => {
		const files = fs.readdirSync(templatesDir).filter((file) => file.endsWith('.md'));
		if (files.length < 2) {
			throw new Error('There should be at least 2 templates');
		}
		if (files.length % 2 !== 0) {
			throw new Error('There should be an even number of templates (subject + content pairs)');
		}
		for (const file of files) {
			expect(() => nunjucksEnv.getTemplate(file, true)).not.toThrow();
		}
	});
});
