import { getDocumentDisplayRedactionStatus } from '../redaction-statuses.js';

describe('redaction-statuses', () => {
	describe('getDocumentDisplayRedactionStatus', () => {
		it('returns explicit redactionStatus if present on document', () => {
			const doc = {
				latestDocumentVersion: {
					redactionStatus: 'Redacted'
				}
			};

			expect(getDocumentDisplayRedactionStatus(doc, 'appellant-case/appellantStatement')).toBe(
				'Redacted'
			);
		});

		it('returns explicit "No redaction required" if present on document', () => {
			const doc = {
				latestDocumentVersion: {
					redactionStatus: 'No redaction required'
				}
			};

			expect(getDocumentDisplayRedactionStatus(doc, 'appellant-case/appellantStatement')).toBe(
				'No redaction required'
			);
		});

		it('returns explicit "Unredacted" if present on document', () => {
			const doc = {
				latestDocumentVersion: {
					redactionStatus: 'Unredacted'
				}
			};

			expect(getDocumentDisplayRedactionStatus(doc, 'appellant-case/appellantStatement')).toBe(
				'Unredacted'
			);
		});

		it('returns "Redaction review required" for appellant-case folders if redactionStatus is empty string or undefined', () => {
			const docWithEmpty = {
				latestDocumentVersion: {
					redactionStatus: ''
				}
			};
			expect(
				getDocumentDisplayRedactionStatus(docWithEmpty, 'appellant-case/appellantStatement')
			).toBe('Redaction review required');

			const docWithoutStatus = {
				latestDocumentVersion: {}
			};
			expect(
				getDocumentDisplayRedactionStatus(docWithoutStatus, 'appellant-case/appellantStatement')
			).toBe('Redaction review required');

			const docWithoutVersion = {};
			expect(
				getDocumentDisplayRedactionStatus(docWithoutVersion, 'appellant-case/appellantStatement')
			).toBe('Redaction review required');
		});

		it('returns empty string if document has no redactionStatus and folder does not match appellant-case', () => {
			const doc = {
				latestDocumentVersion: {
					redactionStatus: ''
				}
			};

			expect(getDocumentDisplayRedactionStatus(doc, 'lpa-questionnaire/other')).toBe('');
			expect(getDocumentDisplayRedactionStatus(doc, undefined)).toBe('');
		});
	});
});
