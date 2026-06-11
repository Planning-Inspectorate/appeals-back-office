import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { DOCUMENT_FOLDER_DISPLAY_LABELS } from '@pins/appeals/constants/documents.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

/**
 * @param {string|undefined} folderPath
 * @returns {string|undefined}
 */
export function mapFolderNameToDisplayLabel(folderPath) {
	if (!folderPath || !folderPath.includes('/')) {
		return;
	}

	const documentType = folderPath.split('/')[1];

	if (documentType in DOCUMENT_FOLDER_DISPLAY_LABELS) {
		return DOCUMENT_FOLDER_DISPLAY_LABELS[documentType];
	}
}

/**
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} folder
 * @param {string} [appealType]
 * @returns {string | undefined}
 */
export function getPageHeadingTextOverrideForAddDocuments(folder, appealType = '') {
	switch (folder.path.split('/')[1]) {
		case APPEAL_DOCUMENT_TYPE.ADDITIONAL_DOCUMENTS_LPA:
			return 'Upload any other documents submitted with the application';
		case APPEAL_DOCUMENT_TYPE.APPEAL_NOTIFICATION:
			return 'Upload the appeal notification letter and the list of people that you notified';
		case APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION:
			return 'Upload your application for an award of appeal costs';
		case APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT:
			return 'Upload your appeal statement';
		case APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER:
			return 'Upload the decision letter from the local planning authority';
		case APPEAL_DOCUMENT_TYPE.ARTICLE_4_DIRECTION:
			return 'Upload the article 4 direction';
		case APPEAL_DOCUMENT_TYPE.CHANGED_DESCRIPTION:
			return appealType === APPEAL_TYPE.CAS_ADVERTISEMENT ||
				appealType === APPEAL_TYPE.ADVERTISEMENT
				? 'Upload evidence of your agreement to change the description of the advertisement'
				: 'Upload evidence of your agreement to change the description of development';
		case APPEAL_DOCUMENT_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY:
			return 'Upload the community infrastructure levy';
		case APPEAL_DOCUMENT_TYPE.CONSULTATION_RESPONSES:
			return 'Upload the consultation responses and standing advice';
		case APPEAL_DOCUMENT_TYPE.DEFINITIVE_MAP_STATEMENT:
			return 'Upload the definitive map and statement extract';
		case APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT:
			return 'Upload your design and access statement';
		case APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT_LPA:
			return 'Upload the design and access statement submitted for the application';
		case APPEAL_DOCUMENT_TYPE.DEVELOPMENT_PLAN_POLICIES:
			return 'Upload relevant policies from your statutory development plan';
		case APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT:
			return 'Environmental statement and supporting information';
		case APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT_APPELLANT:
			return 'Upload your environmental statement';
		case APPEAL_DOCUMENT_TYPE.EIA_SCREENING_DIRECTION:
			return 'Upload the screening direction';
		case APPEAL_DOCUMENT_TYPE.EIA_SCREENING_OPINION:
			return 'Upload your screening opinion and any correspondence';
		case APPEAL_DOCUMENT_TYPE.EIA_SCOPING_OPINION:
			return 'Upload your scoping opinion and any correspondence';
		case APPEAL_DOCUMENT_TYPE.EMERGING_PLAN:
			return 'Upload the emerging plan and supporting information';
		case APPEAL_DOCUMENT_TYPE.ENFORCEMENT_NOTICE:
			return 'Upload your enforcement notice';
		case APPEAL_DOCUMENT_TYPE.ENFORCEMENT_NOTICE_PLAN:
			return 'Upload your enforcement notice plan';
		case APPEAL_DOCUMENT_TYPE.GROUND_A_FEE_RECEIPT:
			return 'Upload your ground (a) fee receipt';
		case APPEAL_DOCUMENT_TYPE.GROUND_A_SUPPORTING:
			return 'Upload your ground (a) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_B_SUPPORTING:
			return 'Upload your ground (b) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_C_SUPPORTING:
			return 'Upload your ground (c) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_D_SUPPORTING:
			return 'Upload your ground (d) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_E_SUPPORTING:
			return 'Upload your ground (e) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_F_SUPPORTING:
			return 'Upload your ground (f) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_G_SUPPORTING:
			return 'Upload your ground (g) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_H_SUPPORTING:
			return 'Upload your ground (h) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_I_SUPPORTING:
			return 'Upload your ground (i) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_J_SUPPORTING:
			return 'Upload your ground (j) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_K_SUPPORTING:
			return 'Upload your ground (k) supporting documents';
		case APPEAL_DOCUMENT_TYPE.LOCAL_DEVELOPMENT_ORDER:
			return 'Upload the local development order';
		case APPEAL_DOCUMENT_TYPE.LPA_ENFORCEMENT_NOTICE:
			return 'Upload the enforcement notice';
		case APPEAL_DOCUMENT_TYPE.LPA_ENFORCEMENT_NOTICE_PLAN:
			return 'Upload the enforcement notice plan';
		case APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS:
			return 'Upload your new plans or drawings';
		case APPEAL_DOCUMENT_TYPE.ORIGINAL_APPLICATION_FORM:
			return 'Upload your application form';
		case APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS:
			return 'Upload your other new supporting documents';
		case APPEAL_DOCUMENT_TYPE.OTHER_PARTY_REPRESENTATIONS:
			return 'Upload the representations from members of the public or other parties';
		case APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES:
			return 'Upload any other relevant policies';
		case APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE:
			return 'Upload your separate ownership certificate and agricultural land declaration';
		case APPEAL_DOCUMENT_TYPE.PLANNING_CONTRAVENTION_NOTICE:
			return 'Upload the planning contravention notice';
		case APPEAL_DOCUMENT_TYPE.PLANNING_OBLIGATION:
			return 'Upload your planning obligation';
		case APPEAL_DOCUMENT_TYPE.PLANNING_OFFICER_REPORT:
			return 'Upload the planning officer’s report or what your decision notice would have said';
		case APPEAL_DOCUMENT_TYPE.PLANNING_PERMISSION:
			return 'Upload the planning permission and any other relevant documents';
		case APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS:
			return 'Upload the plans, drawings and list of plans';
		case APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS_LPA:
			return 'Upload the plans and drawings submitted for the application';
		case APPEAL_DOCUMENT_TYPE.PRIOR_CORRESPONDENCE_WITH_PINS:
			return 'Upload your communication with the Planning Inspectorate';
		case APPEAL_DOCUMENT_TYPE.STOP_NOTICE:
			return 'Upload the stop notice';
		case APPEAL_DOCUMENT_TYPE.SUPPLEMENTARY_PLANNING:
			return 'Upload supplementary planning documents';
		case APPEAL_DOCUMENT_TYPE.TREE_PRESERVATION_PLAN:
			return 'Upload a plan showing the extent of the order';
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED:
			return "Upload the list of neighbours' addresses that you notified about the application";
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS:
			return 'Upload letter or email notification';
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT:
			return 'Upload press advertisement';
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE:
			return 'Upload the site notice';
		default:
			return '';
	}
}

/**
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} folder
 * @returns {string | undefined}
 */
export function getPageHeadingTextOverrideForFolder(folder) {
	switch (folder.path.split('/')[1]) {
		case APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER:
			return 'Decision letter from the local planning authority';
		case APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT:
			return 'design and access statement';
		case APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT:
			return `Environmental statement documents`;
		case APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT_APPELLANT:
			return 'Environmental statement';
		case APPEAL_DOCUMENT_TYPE.EIA_SCREENING_DIRECTION:
			return `Screening direction documents`;
		case APPEAL_DOCUMENT_TYPE.EIA_SCREENING_OPINION:
			return `Screening opinion documents`;
		case APPEAL_DOCUMENT_TYPE.GROUND_A_FEE_RECEIPT:
			return 'Ground (a) fee receipt';
		case APPEAL_DOCUMENT_TYPE.GROUND_A_SUPPORTING:
			return 'Ground (a) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_B_SUPPORTING:
			return 'Ground (b) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_C_SUPPORTING:
			return 'Ground (c) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_D_SUPPORTING:
			return 'Ground (d) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_E_SUPPORTING:
			return 'Ground (e) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_F_SUPPORTING:
			return 'Ground (f) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_G_SUPPORTING:
			return 'Ground (g) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_H_SUPPORTING:
			return 'Ground (h) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_I_SUPPORTING:
			return 'Ground (i) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_J_SUPPORTING:
			return 'Ground (j) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_K_SUPPORTING:
			return 'Ground (k) supporting documents';
		case APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS:
			return 'new plans or drawings';
		case APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS:
			return 'Other new supporting documents';
		case APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES:
			return `Other relevant policies`;
		case APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE:
			return 'Separate ownership certificate and agricultural land declaration';
		case APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS:
			return 'Plans, drawings and list of plans';
		case APPEAL_DOCUMENT_TYPE.PRIOR_CORRESPONDENCE_WITH_PINS:
			return 'communication with the Planning Inspectorate';
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED:
			return `Notification documents`;
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS:
			return `Letter or email notification documents`;
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT:
			return `Press advert notification documents`;
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE:
			return `Site notice documents`;
		default:
			return '';
	}
}
