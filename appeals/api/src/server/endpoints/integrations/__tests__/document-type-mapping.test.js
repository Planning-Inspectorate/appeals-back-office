import { FOLDERS } from '@pins/appeals/constants/documents.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { getFolderIdFromDocumentType } from '../integrations.utils.js';

describe('document type mapping', () => {
	describe('map folder ID for importing docs', () => {
		const folders = FOLDERS.map((/** @type {string} */ folder, /** @type {number} */ ix) => {
			return {
				id: ix + 1,
				path: folder
			};
		});

		const tests = [
			{
				it: 'find the folder for a duplicated docType in appellant case',
				path: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS}`,
				docType: APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS,
				stage: APPEAL_CASE_STAGE.APPELLANT_CASE
			},
			{
				it: 'find the folder for a duplicated docType in lpaq',
				path: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS}`,
				docType: APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS,
				stage: APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE
			},
			{
				it: 'find the folder for appellant case correspondence',
				path: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE}`,
				docType: APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_CORRESPONDENCE,
				stage: APPEAL_CASE_STAGE.APPELLANT_CASE
			},
			{
				it: 'find the folder for lpa case correspondence',
				path: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.LPA_CASE_CORRESPONDENCE}`,
				docType: APPEAL_DOCUMENT_TYPE.LPA_CASE_CORRESPONDENCE,
				stage: APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE
			},
			{
				it: 'find folder matching docType when stage is null',
				path: `${APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE}/${APPEAL_DOCUMENT_TYPE.PLANNING_OFFICER_REPORT}`,
				docType: APPEAL_DOCUMENT_TYPE.PLANNING_OFFICER_REPORT,
				stage: null
			},
			{
				it: 'fallback to uncategorised internal',
				path: `${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.UNCATEGORISED}`,
				docType: 'something that should not get here',
				stage: null
			}
		];

		for (const { it, path, docType, stage } of tests) {
			test(`${it}`, async () => {
				const id = getFolderIdFromDocumentType(folders, docType, stage);
				const correctFolder = folders.find((/** @type {{ path: string; }} */ f) => f.path === path);
				expect(id).toEqual(correctFolder.id);
			});
		}
	});
});
