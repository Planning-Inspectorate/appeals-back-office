import { APPEAL_REPRESENTATION_TYPE as INTERNAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_REPRESENTATION_TYPE } from '@planning-inspectorate/data-model';
import { mapRepresentationIn } from '../representation.mapper.js';

describe('mapRepresentationIn', () => {
	it('should map Rule 6 statement to default document type', () => {
		const submission = {
			representationType: APPEAL_REPRESENTATION_TYPE.STATEMENT,
			representation: 'My Rule 6 Statement',
			representationSubmittedDate: new Date().toISOString(),
			caseReference: '123456',
			lpaCode: null,
			newUser: undefined,
			documents: [
				{
					filename: 'rule6_stmt.pdf',
					originalFilename: 'rule6_stmt.pdf',
					documentId: 'doc123',
					size: 1024,
					mime: 'application/pdf',
					documentURI: 'https://example.com/doc.pdf',
					dateCreated: new Date().toISOString(),
					documentType: null
				}
			]
		};

		const result = mapRepresentationIn(submission, true);

		expect(result.representation.representationType).toBe(
			INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT
		);
		expect(result.attachments).toHaveLength(1);
		expect(result.attachments[0].documentType).toBe('representationAttachments');
		expect(result.attachments[0].stage).toBe('representation');
	});

	it('should map Rule 6 proof to default document type', () => {
		const submission = {
			representationType: APPEAL_REPRESENTATION_TYPE.PROOFS_EVIDENCE,
			representation: 'My Rule 6 Proof',
			representationSubmittedDate: new Date().toISOString(),
			caseReference: '123456',
			lpaCode: null,
			newUser: undefined,
			documents: [
				{
					filename: 'rule6_proof.pdf',
					originalFilename: 'rule6_proof.pdf',
					documentId: 'doc456',
					size: 1024,
					mime: 'application/pdf',
					documentURI: 'https://example.com/doc.pdf',
					dateCreated: new Date().toISOString(),
					documentType: null
				}
			]
		};

		const result = mapRepresentationIn(submission, true);

		expect(result.representation.representationType).toBe(
			INTERNAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
		);
		expect(result.attachments).toHaveLength(1);
		expect(result.attachments[0].documentType).toBe('representationAttachments');
		expect(result.attachments[0].stage).toBe('representation');
	});

	it('should fallback to default for non-Rule 6 representations', () => {
		const submission = {
			representationType: APPEAL_REPRESENTATION_TYPE.COMMENT,
			representation: 'My Comment',
			representationSubmittedDate: new Date().toISOString(),
			caseReference: '123456',
			lpaCode: null,
			newUser: undefined,
			documents: [
				{
					filename: 'comment.pdf',
					originalFilename: 'comment.pdf',
					documentId: 'doc789',
					size: 1024,
					mime: 'application/pdf',
					documentURI: 'https://example.com/doc.pdf',
					dateCreated: new Date().toISOString(),
					documentType: null
				}
			]
		};

		const result = mapRepresentationIn(submission, false);

		// Default logic in document.mapper.js sets it to REP_ATTACHMENT_DOCTYPE (which is 'representationAttachments')
		// and stage to 'representation' (which seems to be overwritten/handled in mapper if I recall)
		// Wait, my change to document.mapper.js ensures documentType is preserved IF SET.
		// For generic comment, representation.mapper.js DOES NOT set doc.documentType.
		// So document.mapper.js should set it to REP_ATTACHMENT_DOCTYPE.

		// Checking imports in test file... I don't import REP_ATTACHMENT_DOCTYPE here but I can check against the string or expect it to be defined.
		// I'll check it's defined and likely 'representationAttachments'.

		expect(result.attachments[0].documentType).toBe('representationAttachments');
	});
});
