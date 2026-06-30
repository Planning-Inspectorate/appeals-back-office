// @ts-nocheck
import { householdAppeal as appeal } from '#tests/appeals/mocks.js';
import { jest } from '@jest/globals';
import { APPEAL_CASE_STATUS, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

import {
	checkAppealsStatusBeforeLPAQ,
	copyRepresentations,
	duplicateFiles
} from '../link-appeals.service.js';

const { databaseConnector } = await import('#utils/database-connector.js');

import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_APPEAL_LINK_ADDED,
	AUDIT_TRAIL_APPEAL_LINK_UNLINKED,
	AUDIT_TRAIL_APPEAL_RELATION_ADDED,
	AUDIT_TRAIL_APPEAL_RELATION_REMOVED,
	CASE_RELATIONSHIP_LINKED
} from '@pins/appeals/constants/support.js';

describe('Link Appeals Service', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('checkAppealsStatusBeforeLPAQ', () => {
		it('should return true where the linked appeal is the parent and it already has linked children and has status before LPA Questionnaire', () => {
			const linkedAppeal = structuredClone({
				...appeal,
				id: 2,
				childAppeals: [{ appeal: { id: 3 } }]
			});
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(true);
		});

		it('should return false where the linked appeal is the parent and it already has linked children and has status LPA Questionnaire', () => {
			const linkedAppeal = structuredClone({
				...appeal,
				id: 2,
				appealStatus: [
					{
						status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
						valid: true
					}
				],
				childAppeals: [{ appeal: { id: 3 }, type: CASE_RELATIONSHIP_LINKED }]
			});
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(false);
		});

		it('should return true where the linked appeal is the parent but has no children and the current appeal has status before LPA Questionnaire', () => {
			const linkedAppeal = structuredClone({ ...appeal, id: 2 });
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(true);
		});

		it('should return false where the linked appeal is the parent but has no children and the current appeal has status LPA Questionnaire', () => {
			const appealAtLPAQ = structuredClone({
				...appeal,
				appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }]
			});
			const linkedAppeal = structuredClone({ ...appeal, id: 2 });
			const isCurrentAppealParent = false;

			const result = checkAppealsStatusBeforeLPAQ(
				appealAtLPAQ,
				linkedAppeal,
				isCurrentAppealParent
			);
			expect(result).toBe(false);
		});

		it('should return true where the current appeal is the parent and it has status before LPA Questionnaire', () => {
			const linkedAppeal = structuredClone({ ...appeal, id: 2 });
			const isCurrentAppealParent = true;

			const result = checkAppealsStatusBeforeLPAQ(appeal, linkedAppeal, isCurrentAppealParent);
			expect(result).toBe(true);
		});

		it('should return false where the current appeal is the parent and it has status LPA Questionnaire', () => {
			const appealAtLPAQ = structuredClone({
				...appeal,
				appealStatus: [{ status: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE, valid: true }]
			});
			const linkedAppeal = structuredClone({ ...appeal, id: 2 });
			const isCurrentAppealParent = true;

			const result = checkAppealsStatusBeforeLPAQ(
				appealAtLPAQ,
				linkedAppeal,
				isCurrentAppealParent
			);
			expect(result).toBe(false);
		});
	});

	describe('copyRepresentations', () => {
		it('should return an empty array if there are no representations to copy', async () => {
			databaseConnector.representation.findMany.mockResolvedValue([]);

			const result = await copyRepresentations({ id: 'testSource' }, { id: 'testDestination' });
			expect(result).toEqual([]);
			expect(databaseConnector.representation.findMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.folder.findMany).not.toHaveBeenCalled();
			expect(databaseConnector.document.findMany).not.toHaveBeenCalled();
			expect(databaseConnector.representation.createMany).not.toHaveBeenCalled();
		});

		it('should return an array of copied representations if there are representations to copy - no attachments', async () => {
			const testRepsArray = [
				{
					id: 'rep1',
					attachments: [],
					representationType: 'testType'
				},
				{
					id: 'rep2',
					attachments: [],
					representationType: 'testType'
				}
			];
			databaseConnector.representation.findMany.mockResolvedValue(testRepsArray);
			databaseConnector.folder.findMany.mockResolvedValue([{ id: 1 }]);
			databaseConnector.document.findMany.mockResolvedValue([]);
			databaseConnector.representation.createMany.mockResolvedValue([]);

			const result = await copyRepresentations({ id: 'testSource' }, { id: 'testDestination' });
			expect(result).toEqual(testRepsArray);
			expect(databaseConnector.representation.findMany).toHaveBeenCalledTimes(2);
			expect(databaseConnector.folder.findMany).toHaveBeenCalledTimes(2);
			expect(databaseConnector.document.findMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.representation.createMany).toHaveBeenCalledTimes(1);
		});
	});

	describe('duplicateFiles', () => {
		it('calls updateAppealDecisionLetter with destination appeal id and copied decision letter guid', async () => {
			const sourceAppeal = { id: 100, reference: 'SRC-REF' };
			const destinationAppeal = { id: 200, reference: 'DST-REF' };
			databaseConnector.documentVersion.createMany.mockResolvedValue([]);

			databaseConnector.folder.findMany.mockResolvedValueOnce([
				{
					id: 1,
					path: 'appeal-decision/caseDecisionLetter',
					documents: [
						{
							name: 'decision-letter.pdf',
							guid: 'source-guid',
							isDeleted: false,
							latestDocumentVersion: {
								blobStoragePath: 'appeal/SRC-REF/source-guid/v1/decision-letter.pdf',
								mime: 'application/pdf',
								documentType: APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER,
								size: 123,
								stage: 'appeal-decision',
								virusCheckStatus: 'clean',
								redactionStatusId: 1,
								dateReceived: new Date('2026-01-01T00:00:00.000Z'),
								version: 1
							}
						}
					]
				}
			]);

			await duplicateFiles(sourceAppeal, destinationAppeal, null);

			expect(databaseConnector.inspectorDecision.update).toHaveBeenCalledTimes(1);
			expect(databaseConnector.inspectorDecision.update).toHaveBeenCalledWith({
				where: { appealId: destinationAppeal.id },
				data: { decisionLetterGuid: 'mock-uuid' }
			});
		});

		it('does not call updateAppealDecisionLetter when no decision letter is copied', async () => {
			const sourceAppeal = { id: 100, reference: 'SRC-REF' };
			const destinationAppeal = { id: 200, reference: 'DST-REF' };
			databaseConnector.documentVersion.createMany.mockResolvedValue([]);

			databaseConnector.folder.findMany.mockResolvedValueOnce([
				{
					id: 1,
					path: 'costs/appellantCostsCorrespondence',
					documents: [
						{
							name: 'supporting-note.pdf',
							guid: 'source-guid-2',
							isDeleted: false,
							latestDocumentVersion: {
								blobStoragePath: 'appeal/SRC-REF/source-guid-2/v1/supporting-note.pdf',
								mime: 'application/pdf',
								documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE,
								size: 123,
								stage: 'costs',
								virusCheckStatus: 'clean',
								redactionStatusId: 1,
								dateReceived: new Date('2026-01-01T00:00:00.000Z'),
								version: 1
							}
						}
					]
				}
			]);

			await duplicateFiles(sourceAppeal, destinationAppeal, null);

			expect(databaseConnector.inspectorDecision.update).not.toHaveBeenCalled();
		});
	});
});

describe('Audit Trail Content Verification', () => {
	const mockAppealReference = 'APP/Q9999/D/21/1234567';

	test('should correctly format "Linked appeal added" with reference', () => {
		const result = stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_ADDED, [mockAppealReference]);
		expect(result).toBe(`Linked appeal ${mockAppealReference} added`);
	});

	test('should correctly format "Linked appeal unlinked" with reference', () => {
		const result = stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_UNLINKED, [mockAppealReference]);
		expect(result).toBe(`Linked appeal ${mockAppealReference} unlinked`);
	});

	test('should correctly format "Related appeal added" with reference', () => {
		const result = stringTokenReplacement(AUDIT_TRAIL_APPEAL_RELATION_ADDED, [mockAppealReference]);
		expect(result).toBe(`Related appeal ${mockAppealReference} added`);
	});

	test('should correctly format "Related appeal removed" with reference', () => {
		const result = stringTokenReplacement(AUDIT_TRAIL_APPEAL_RELATION_REMOVED, [
			mockAppealReference
		]);
		expect(result).toBe(`Related appeal ${mockAppealReference} removed`);
	});
});
