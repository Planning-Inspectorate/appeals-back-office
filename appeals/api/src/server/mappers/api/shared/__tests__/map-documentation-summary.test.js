import { jest } from '@jest/globals';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { DOCUMENT_STATUS_RECEIVED } from '@pins/appeals/constants/support.js';

await jest.unstable_mockModule('#utils/format-documentation-status.js', () => ({
	formatAppellantCaseDocumentationStatus: jest.fn(() => 'received'),
	formatLpaQuestionnaireDocumentationStatus: jest.fn(() => 'received'),
	formatLpaStatementStatus: jest.fn(() => 'received')
}));

await jest.unstable_mockModule('@pins/appeals/utils/appeal-type-checks.js', () => ({
	isExpeditedAppealType: jest.fn(() => false)
}));

const { mapDocumentationSummary } = await import('../map-documentation-summary.js');

describe('mapDocumentationSummary', () => {
	/** @type {any} */
	const baseAppeal = {
		caseCreatedDate: new Date(),
		lpaQuestionnaire: { lpaqCreatedDate: new Date() },
		appealTimetable: {
			lpaQuestionnaireDueDate: new Date()
		},
		caseExtensionDate: new Date(),
		appealType: { key: 'W' },
		representations: [],
		appealRule6Parties: []
	};

	it('should correctly map basic documentation (appellantCase, lpaQuestionnaire)', () => {
		const result = mapDocumentationSummary({ appeal: baseAppeal });

		expect(result.appellantCase).toEqual({
			status: 'received',
			dueDate: baseAppeal.caseExtensionDate.toISOString(),
			receivedAt: baseAppeal.caseCreatedDate.toISOString()
		});

		expect(result.lpaQuestionnaire).toEqual({
			status: 'received',
			dueDate: baseAppeal.appealTimetable.lpaQuestionnaireDueDate.toISOString(),
			receivedAt: baseAppeal.lpaQuestionnaire.lpaqCreatedDate.toISOString()
		});
	});

	it('should correctly map IP comments', () => {
		const date1 = new Date('2023-01-01');
		const date2 = new Date('2023-01-02');
		const appeal = {
			...baseAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.COMMENT,
					status: 'valid',
					dateCreated: date1,
					redactedRepresentation: 'redacted'
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.COMMENT,
					status: 'awaiting_review',
					dateCreated: date2
				}
			]
		};

		const result = /** @type {any} */ (mapDocumentationSummary({ appeal }));

		expect(result.ipComments).toEqual({
			status: DOCUMENT_STATUS_RECEIVED,
			counts: { valid: 1, awaiting_review: 1 },
			isRedacted: true, // One comment is redacted
			receivedAt: date2.toISOString() // Most recent date
		});
	});

	it('should correctly map LPA Statement and its redaction logic', () => {
		const appeal = {
			...baseAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
					status: 'valid',
					dateCreated: new Date(),
					originalRepresentation: 'original',
					redactedRepresentation: 'redacted' // Different, so isRedacted should be true
				}
			]
		};

		const result = /** @type {any} */ (mapDocumentationSummary({ appeal }));

		expect(result.lpaStatement).toEqual({
			status: 'received',
			representationStatus: 'valid',
			receivedAt: expect.any(String),
			isRedacted: true
		});
	});

	it('should correctly map LPA Statement when NOT redacted', () => {
		const appeal = {
			...baseAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
					status: 'valid',
					dateCreated: new Date(),
					originalRepresentation: 'same',
					redactedRepresentation: 'same' // Same, so isRedacted should be false
				}
			]
		};

		const result = /** @type {any} */ (mapDocumentationSummary({ appeal }));

		expect(result.lpaStatement.isRedacted).toBe(false);
	});

	it('should correctly map Rule 6 Party Statements', () => {
		const appeal = {
			...baseAppeal,
			appealRule6Parties: [{ serviceUserId: 1 }],
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
					originalRepresentation: 'original',
					redactedRepresentation: 'redacted', // Sets the global "redactLPAStatementMatching" flag to TRUE
					dateCreated: new Date()
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT,
					representedId: 1,
					status: 'valid',
					dateCreated: new Date(),
					redactedRepresentation: 'some redacted content'
				}
			]
		};

		const result = /** @type {any} */ (mapDocumentationSummary({ appeal }));

		expect(result.rule6PartyStatements['1']).toEqual({
			status: DOCUMENT_STATUS_RECEIVED,
			representationStatus: 'valid',
			receivedAt: expect.any(String),
			isRedacted: true // Dependent on LPA statement redaction flag AND presence of redacted content
		});
	});

	it('should correctly map Rule 6 Party Proofs (dependent on LPA statement flag)', () => {
		const appeal = {
			...baseAppeal,
			appealRule6Parties: [{ serviceUserId: 1 }],
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
					originalRepresentation: 'original',
					redactedRepresentation: 'redacted',
					dateCreated: new Date()
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE,
					representedId: 1,
					status: 'valid',
					dateCreated: new Date(),
					redactedRepresentation: 'redacted content'
				}
			]
		};

		const result = /** @type {any} */ (mapDocumentationSummary({ appeal }));

		expect(result.rule6PartyProofs['1']).toEqual({
			status: DOCUMENT_STATUS_RECEIVED,
			representationStatus: 'valid',
			receivedAt: expect.any(String),
			isRedacted: true
		});
	});

	it('should map Final Comments (LPA & Appellant)', () => {
		const appeal = {
			...baseAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
					status: 'valid',
					dateCreated: new Date(),
					redactedRepresentation: 'redacted'
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT,
					status: 'valid',
					dateCreated: new Date(),
					redactedRepresentation: 'redacted'
				}
			]
		};

		const result = /** @type {any} */ (mapDocumentationSummary({ appeal }));

		expect(result.lpaFinalComments).toEqual({
			status: DOCUMENT_STATUS_RECEIVED,
			receivedAt: expect.any(String),
			representationStatus: 'valid'
		});

		expect(result.appellantFinalComments).toEqual({
			status: DOCUMENT_STATUS_RECEIVED,
			receivedAt: expect.any(String),
			representationStatus: 'valid'
		});
	});

	it('should map Proofs of Evidence (LPA & Appellant)', () => {
		const appeal = {
			...baseAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
					status: 'valid',
					dateCreated: new Date(),
					redactedRepresentation: 'redacted'
				},
				{
					representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
					status: 'valid',
					dateCreated: new Date(),
					redactedRepresentation: 'redacted'
				}
			]
		};

		const result = /** @type {any} */ (mapDocumentationSummary({ appeal }));

		expect(result.lpaProofOfEvidence).toEqual({
			status: DOCUMENT_STATUS_RECEIVED,
			representationStatus: 'valid',
			receivedAt: expect.any(String)
		});

		expect(result.appellantProofOfEvidence).toEqual({
			status: DOCUMENT_STATUS_RECEIVED,
			representationStatus: 'valid',
			receivedAt: expect.any(String)
		});
	});

	it('should map Appellant Statement', () => {
		const appeal = {
			...baseAppeal,
			representations: [
				{
					representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
					status: 'valid',
					dateCreated: new Date(),
					redactedRepresentation: 'redacted'
				}
			]
		};

		const result = /** @type {any} */ (mapDocumentationSummary({ appeal }));

		expect(result.appellantStatement).toEqual({
			status: DOCUMENT_STATUS_RECEIVED,
			representationStatus: 'valid',
			receivedAt: expect.any(String)
		});
	});
});
