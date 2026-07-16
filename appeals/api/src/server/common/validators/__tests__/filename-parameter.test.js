import { validationResult } from 'express-validator';
import { validateFileNameParameter } from '../filename-parameter.js';

/**
 * Helper to run validation on a mock request
 * @param {import('express-validator').ValidationChain} validator
 * @param {object} body
 * @returns {Promise<import('express-validator').Result>}
 */
const runValidation = async (validator, body) => {
	const req = { body };
	await validator.run(req);
	return validationResult(req);
};

describe('validateFileNameParameter', () => {
	const paramName = 'document.fileName';
	const validator = validateFileNameParameter(paramName);

	describe('valid filenames', () => {
		test('accepts simple filename with extension', async () => {
			const result = await runValidation(validator, { document: { fileName: 'test.pdf' } });
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts filename with numbers', async () => {
			const result = await runValidation(validator, { document: { fileName: 'file123.doc' } });
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts filename with underscores', async () => {
			const result = await runValidation(validator, { document: { fileName: 'my_file_name.txt' } });
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts filename with hyphens', async () => {
			const result = await runValidation(validator, {
				document: { fileName: 'my-file-name.docx' }
			});
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts filename with spaces', async () => {
			const result = await runValidation(validator, { document: { fileName: 'my file name.pdf' } });
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts filename with mixed characters', async () => {
			const result = await runValidation(validator, {
				document: { fileName: 'My File_Name-123.pdf' }
			});
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts filename with uppercase extension', async () => {
			const result = await runValidation(validator, { document: { fileName: 'document.PDF' } });
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts filename with underscore in extension', async () => {
			const result = await runValidation(validator, { document: { fileName: 'file.doc_backup' } });
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts filename with hyphen in extension', async () => {
			const result = await runValidation(validator, { document: { fileName: 'file.tar-gz' } });
			expect(result.isEmpty()).toBe(true);
		});
	});

	describe('optional field handling', () => {
		test('accepts undefined filename (optional)', async () => {
			const result = await runValidation(validator, { document: {} });
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts null filename (optional)', async () => {
			const result = await runValidation(validator, { document: { fileName: null } });
			expect(result.isEmpty()).toBe(true);
		});

		test('accepts empty string filename (optional with checkFalsy)', async () => {
			const result = await runValidation(validator, { document: { fileName: '' } });
			expect(result.isEmpty()).toBe(true);
		});
	});

	describe('invalid filenames', () => {
		test('rejects filename without extension', async () => {
			const result = await runValidation(validator, { document: { fileName: 'filename' } });
			expect(result.isEmpty()).toBe(false);
			expect(result.array()[0].msg).toBe('must be a valid filename');
		});

		test('rejects filename with multiple periods', async () => {
			const result = await runValidation(validator, {
				document: { fileName: 'file.name.pdf' }
			});
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename starting with period', async () => {
			const result = await runValidation(validator, { document: { fileName: '.hidden' } });
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename ending with period', async () => {
			const result = await runValidation(validator, { document: { fileName: 'file.' } });
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename with special characters', async () => {
			const result = await runValidation(validator, { document: { fileName: 'file@name.pdf' } });
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename with forward slash', async () => {
			const result = await runValidation(validator, { document: { fileName: 'path/file.pdf' } });
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename with backslash', async () => {
			const result = await runValidation(validator, {
				document: { fileName: 'path\\file.pdf' }
			});
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename with asterisk', async () => {
			const result = await runValidation(validator, { document: { fileName: 'file*.pdf' } });
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename with question mark', async () => {
			const result = await runValidation(validator, { document: { fileName: 'file?.pdf' } });
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename with colon', async () => {
			const result = await runValidation(validator, { document: { fileName: 'file:name.pdf' } });
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename with angle brackets', async () => {
			const result = await runValidation(validator, { document: { fileName: '<file>.pdf' } });
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename with pipe character', async () => {
			const result = await runValidation(validator, { document: { fileName: 'file|name.pdf' } });
			expect(result.isEmpty()).toBe(false);
		});

		test('rejects filename with quotes', async () => {
			const result = await runValidation(validator, { document: { fileName: '"file".pdf' } });
			expect(result.isEmpty()).toBe(false);
		});
	});

	describe('custom parameter name', () => {
		test('validates using custom parameter name', async () => {
			const customValidator = validateFileNameParameter('customField');
			const result = await runValidation(customValidator, { customField: 'valid.pdf' });
			expect(result.isEmpty()).toBe(true);
		});

		test('validates nested custom parameter name', async () => {
			const customValidator = validateFileNameParameter('data.nested.fileName');
			const result = await runValidation(customValidator, {
				data: { nested: { fileName: 'valid.pdf' } }
			});
			expect(result.isEmpty()).toBe(true);
		});
	});
});
