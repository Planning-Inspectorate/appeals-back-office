// @ts-nocheck
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

describe('documents and folders', () => {
	describe('mapFolderNameToDisplayLabel', () => {
		const testCases = [
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT,
				label: 'Appeal statement'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.ORIGINAL_APPLICATION_FORM,
				label: 'Application form'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER,
				label: 'Application decision letter'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CHANGED_DESCRIPTION,
				label: 'Agreement to change description evidence'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER,
				label: 'Appellant withdrawal request'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE,
				label: 'Additional documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT,
				label: 'Design and access statement'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS,
				label: 'Plans, drawings and list of plans'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS,
				label: 'New plans or drawings'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.PLANNING_OBLIGATION,
				label: 'Planning obligation'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE,
				label: 'Ownership certificate and/or land declaration'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS,
				label: 'Other new supporting documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.ENVIRONMENTAL_ASSESSMENT,
				label: 'Environmental assessment'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED,
				label: 'Who was notified about the application'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE,
				label: 'Site notice'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS,
				label: 'Letter or email notification'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT,
				label: 'Press advert notification'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CONSERVATION_MAP,
				label: 'Conservation area map and guidance'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.OTHER_PARTY_REPRESENTATIONS,
				label: 'Representations from other parties documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.PLANNING_OFFICER_REPORT,
				label: `Planning officer’s report`
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.DEVELOPMENT_PLAN_POLICIES,
				label: 'Relevant policies from statutory development plan'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.TREE_PRESERVATION_PLAN,
				label: 'Tree Preservation Order'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.DEFINITIVE_MAP_STATEMENT,
				label: 'Definitive map and statement extract'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY,
				label: 'Community infrastructure levy'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.SUPPLEMENTARY_PLANNING,
				label: 'Supplementary planning documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.EMERGING_PLAN,
				label: 'Emerging plan relevant to appeal'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CONSULTATION_RESPONSES,
				label: 'Consultation responses or standing advice'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT,
				label: 'Environmental statement'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.EIA_SCREENING_OPINION,
				label: 'Screening opinion documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.EIA_SCREENING_DIRECTION,
				label: 'Screening direction documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.LPA_CASE_CORRESPONDENCE,
				label: 'Additional documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES,
				label: 'Other relevant policies'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPEAL_NOTIFICATION,
				label: 'Appeal notification letter'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION,
				label: 'Appellant costs application'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_WITHDRAWAL,
				label: 'Appellant costs withdrawal'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE,
				label: 'Appellant costs correspondence'
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
				label: 'Appellant costs decision'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.LPA_COSTS_DECISION_LETTER,
				label: 'LPA costs decision'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CROSS_TEAM_CORRESPONDENCE,
				label: 'Cross-team correspondence'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.INSPECTOR_CORRESPONDENCE,
				label: 'Inspector correspondence'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.UNCATEGORISED,
				label: 'Documents'
			},
			{
				documentType: APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER,
				label: 'Decision letter'
			}
		];

		for (const testCase of testCases) {
			it(`should return "${testCase.label}" if folderPath document type fragment is "${testCase.documentType}"`, () => {
				expect(mapFolderNameToDisplayLabel(`caseStage/${testCase.documentType}`)).toBe(
					testCase.label
				);
			});
		}

		it('should return undefined if folderPath is falsy', () => {
			expect(mapFolderNameToDisplayLabel(``)).toBe(undefined);
			expect(mapFolderNameToDisplayLabel()).toBe(undefined);
		});

		it('should return undefined if folderPath does not contain "/"', () => {
			expect(mapFolderNameToDisplayLabel('invalidFolderPath')).toBe(undefined);
		});

		it('should return undefined if an entry matching the document type fragment of the folder path is not present in DOCUMENT_FOLDER_DISPLAY_LABELS', () => {
			expect(mapFolderNameToDisplayLabel('caseStage/unhandledDocumentType')).toBe(undefined);
		});
	});
});
