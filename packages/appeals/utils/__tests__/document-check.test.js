// @ts-nocheck
import { checkDocument } from '../document-check.js';
describe('document-check', () => {
	describe('checkDocument', () => {
		it('returns true for valid document with document count greater than 0', () => {
			const document = { documents: ['doc1'] };
			expect(checkDocument(document)).toBe(true);
		});

		it('returns false for null or undefined document', () => {
			expect(checkDocument(null)).toBe(false);
			expect(checkDocument(undefined)).toBe(false);
		});

		it('returns false for document with document count of 0', () => {
			const document = { documents: [] };
			expect(checkDocument(document)).toBe(false);
		});
	});
});
