// @ts-nocheck
import { APPEAL_DOCUMENT_TYPE } from 'pins-data-model';
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';

describe('documents and folders', () => {
	describe('mapFolderNameToDisplayLabel', () => {
		const testCases = [
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT,
				label: 'appeal statement'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.ORIGINAL_APPLICATION_FORM,
				label: 'application form'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER,
				label: 'application decision letter'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CHANGED_DESCRIPTION,
				label: 'agreement to change description evidence'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER,
				label: 'appellant withdrawal request'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE,
				label: 'additional documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT,
				label: 'design and access statement'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS,
				label: 'plans, drawings and list of plans'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS,
				label: 'new plans or drawings'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.PLANNING_OBLIGATION,
				label: 'planning obligation'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE,
				label: 'ownership certificate and/or land declaration'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS,
				label: 'other new supporting documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.ENVIRONMENTAL_ASSESSMENT,
				label: 'environmental assessment'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED,
				label: 'who was notified about the application'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE,
				label: 'site notice'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS,
				label: 'letter or email notification'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT,
				label: 'press advert notification'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CONSERVATION_MAP,
				label: 'conservation area map and guidance'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.OTHER_PARTY_REPRESENTATIONS,
				label: 'representations from other parties documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.PLANNING_OFFICER_REPORT,
				label: `planning officer's report`
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.DEVELOPMENT_PLAN_POLICIES,
				label: 'relevant policies from statutory development plan'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.TREE_PRESERVATION_PLAN,
				label: 'tree preservation order'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.DEFINITIVE_MAP_STATEMENT,
				label: 'definitive map and statement extract'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY,
				label: 'community infrastructure levy'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.SUPPLEMENTARY_PLANNING,
				label: 'supplementary planning documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.EMERGING_PLAN,
				label: 'emerging plan relevant to appeal'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CONSULTATION_RESPONSES,
				label: 'consultation responses or standing advice'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT,
				label: 'environmental statement'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.EIA_SCREENING_OPINION,
				label: 'screening opinion documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.EIA_SCREENING_DIRECTION,
				label: 'screening direction documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.LPA_CASE_CORRESPONDENCE,
				label: 'additional documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES,
				label: 'other relevant policies'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPEAL_NOTIFICATION,
				label: 'appeal notification letter'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION,
				label: 'appellant costs application'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_WITHDRAWAL,
				label: 'appellant costs withdrawal'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE,
				label: 'appellant costs correspondence'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.LPA_COSTS_APPLICATION,
				label: 'LPA costs application'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.LPA_COSTS_WITHDRAWAL,
				label: 'LPA costs withdrawal'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.LPA_COSTS_CORRESPONDENCE,
				label: 'LPA costs correspondence'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_DECISION_LETTER,
				label: 'appellant costs decision'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.LPA_COSTS_DECISION_LETTER,
				label: 'LPA costs decision'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CROSS_TEAM_CORRESPONDENCE,
				label: 'cross-team correspondence'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.INSPECTOR_CORRESPONDENCE,
				label: 'inspector correspondence'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.UNCATEGORISED,
				label: 'documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER,
				label: 'decision letter'
			}
		];

		for (const testCase of testCases) {
			it(`should return "${testCase.label}" if folderPath document type fragment is "${testCase.documentType}"`, () => {
				expect(
					mapFolderNameToDisplayLabel({ folderPath: `caseStage/${testCase.documentType}` })
				).toBe(testCase.label);
			});
			it(`should return "${capitalizeFirstLetter(
				testCase.label
			)}" if folderPath document type fragment is "${
				testCase.documentType
			}" and the capitalise parameter is passed with a value of true`, () => {
				expect(
					mapFolderNameToDisplayLabel({
						folderPath: `caseStage/${testCase.documentType}`,
						capitalise: true
					})
				).toBe(capitalizeFirstLetter(testCase.label));
			});
		}

		it('should return undefined if folderPath is falsy', () => {
			expect(mapFolderNameToDisplayLabel({ folderPath: `` })).toBe(undefined);
			expect(mapFolderNameToDisplayLabel({})).toBe(undefined);
		});

		it('should return undefined if folderPath does not contain "/"', () => {
			expect(mapFolderNameToDisplayLabel({ folderPath: 'invalidFolderPath' })).toBe(undefined);
		});

		it('should return undefined if an entry matching the document type fragment of the folder path is not present in DOCUMENT_FOLDER_DISPLAY_LABELS', () => {
			expect(mapFolderNameToDisplayLabel({ folderPath: 'caseStage/unhandledDocumentType' })).toBe(
				undefined
			);
		});

		it('should return the constant string with the trailing word "documents" removed, if the constant string ends with the word "documents"', async () => {
			expect(
				mapFolderNameToDisplayLabel({
					folderPath: `caseStage/${APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS}`,
					removeTrailingDocumentsString: true
				})
			).toBe('other new supporting');
		});
	});
});
