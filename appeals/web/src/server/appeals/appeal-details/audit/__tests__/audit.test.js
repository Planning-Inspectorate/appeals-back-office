import { tryMapDocument } from '#appeals/appeal-details/audit/audit.service.js';
import { statusFormatMap } from '#appeals/appeal-details/representations/document-attachments/controller/redaction-status.js';

describe('audit', () => {
	describe('tryMapDocument', () => {
		const redactionStatusKeys = Object.keys(statusFormatMap);
		const randomKey = redactionStatusKeys[Math.floor(Math.random() * redactionStatusKeys.length)];
		const randomRedactStatus = statusFormatMap[randomKey].toLowerCase();
		const auditTrailEntryText = `Document 2288c506-bd6e-4a25-b0e3-05c10c350d9a_docstuff.docx uploaded (version 1, ${randomRedactStatus})`;
		const docInfo = {
			name: '2288c506-bd6e-4a25-b0e3-05c10c350d9a_docstuff.docx',
			documentGuid: 'efac1b7f-71c6-4780-bf22-edd0b0531914',
			stage: 'representation',
			folderId: 61306,
			documentType: 'representationAttachments'
		};

		it('should return audit trail entry with doc GUID removed from a supporting doc display name', async () => {
			const result = await tryMapDocument(1, auditTrailEntryText, docInfo, null);
			expect(result).toEqual(
				`Document <a class="govuk-link" href="#">docstuff.docx</a> uploaded (version 1, ${randomRedactStatus})`
			);
		});

		it('should include the redaction status in the audit log display text for a supporting document', async () => {
			const result = await tryMapDocument(1, auditTrailEntryText, docInfo, null);
			expect(result).toMatch(/unredacted|no redaction required|redacted/);
		});
	});
});
