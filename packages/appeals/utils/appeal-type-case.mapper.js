import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/**
 *
 * @param {string | undefined} appealType
 * @returns string
 */
export const appealTypeToAppealCaseTypeMapper = (appealType) => {
	switch (appealType) {
		case APPEAL_TYPE.HOUSEHOLDER:
			return APPEAL_CASE_TYPE.D;
		case APPEAL_TYPE.ENFORCEMENT_NOTICE:
		case 'Enforcement notice':
			return APPEAL_CASE_TYPE.C;
		case APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING:
		case 'Enforcement listed building':
		case 'Enforcement listed building and conservation area':
			return APPEAL_CASE_TYPE.F;
		case APPEAL_TYPE.DISCONTINUANCE_NOTICE:
		case 'Discontinuance notice':
			return APPEAL_CASE_TYPE.G;
		case APPEAL_TYPE.ADVERTISEMENT:
			return APPEAL_CASE_TYPE.H;
		case APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY:
			return APPEAL_CASE_TYPE.L;
		case APPEAL_TYPE.PLANNING_OBLIGATION:
		case 'Planning obligation':
		case 'Section 106 agreement':
			return APPEAL_CASE_TYPE.Q;
		case APPEAL_TYPE.AFFORDABLE_HOUSING_OBLIGATION:
		case 'Affordable housing obligation':
			return APPEAL_CASE_TYPE.S;
		case APPEAL_TYPE.CALL_IN_APPLICATION:
			return APPEAL_CASE_TYPE.V;
		case APPEAL_TYPE.S78:
		case 'Planning':
			return APPEAL_CASE_TYPE.W;
		case APPEAL_TYPE.TREE_PRESERVATION_ORDER:
			return APPEAL_CASE_TYPE.TPO;
		case APPEAL_TYPE.TREE_REPLACEMENT_NOTICE:
			return APPEAL_CASE_TYPE.TRN;
		case APPEAL_TYPE.HIGH_HEDGES:
		case 'High hedges':
		case 'High Hedges':
			return APPEAL_CASE_TYPE.HH;
		case APPEAL_TYPE.HEDGEROWS:
		case 'Hedgerows':
			return APPEAL_CASE_TYPE.HR;
		case APPEAL_TYPE.ENVIRONMENTAL:
		case 'Environmental':
			return APPEAL_CASE_TYPE.ENV;
		case APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE:
		case 'Lawful development certificate':
			return APPEAL_CASE_TYPE.X;
		case APPEAL_TYPE.PLANNED_LISTED_BUILDING:
		case 'Planning listed building':
		case 'Planning listed building and conservation area':
			return APPEAL_CASE_TYPE.Y;
		case APPEAL_TYPE.CAS_ADVERTISEMENT:
			return APPEAL_CASE_TYPE.ZA;
		case APPEAL_TYPE.CAS_PLANNING:
			return APPEAL_CASE_TYPE.ZP;
		default:
			return '';
	}
};

/**
 *
 * @param {string} appealCaseType
 * @returns string
 */
export const appealCaseTypeToAppealTypeMapper = (appealCaseType) => {
	switch (appealCaseType) {
		case APPEAL_CASE_TYPE.D:
			return APPEAL_TYPE.HOUSEHOLDER;
		case APPEAL_CASE_TYPE.C:
			return APPEAL_TYPE.ENFORCEMENT_NOTICE;
		case APPEAL_CASE_TYPE.F:
			return APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING;
		case APPEAL_CASE_TYPE.G:
			return APPEAL_TYPE.DISCONTINUANCE_NOTICE;
		case APPEAL_CASE_TYPE.H:
			return APPEAL_TYPE.ADVERTISEMENT;
		case APPEAL_CASE_TYPE.L:
			return APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY;
		case APPEAL_CASE_TYPE.Q:
			return APPEAL_TYPE.PLANNING_OBLIGATION;
		case APPEAL_CASE_TYPE.S:
			return APPEAL_TYPE.AFFORDABLE_HOUSING_OBLIGATION;
		case APPEAL_CASE_TYPE.V:
			return APPEAL_TYPE.CALL_IN_APPLICATION;
		case APPEAL_CASE_TYPE.W:
			return APPEAL_TYPE.S78;
		case APPEAL_CASE_TYPE.X:
			return APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE;
		case APPEAL_CASE_TYPE.Y:
			return APPEAL_TYPE.PLANNED_LISTED_BUILDING;
		case APPEAL_CASE_TYPE.ZA:
			return APPEAL_TYPE.CAS_ADVERTISEMENT;
		case APPEAL_CASE_TYPE.ZP:
			return APPEAL_TYPE.CAS_PLANNING;
		case APPEAL_CASE_TYPE.TPO:
			return APPEAL_TYPE.TREE_PRESERVATION_ORDER;
		case APPEAL_CASE_TYPE.TRN:
			return APPEAL_TYPE.TREE_REPLACEMENT_NOTICE;
		case APPEAL_CASE_TYPE.HH:
			return APPEAL_TYPE.HIGH_HEDGES;
		case APPEAL_CASE_TYPE.HR:
			return APPEAL_TYPE.HEDGEROWS;
		case APPEAL_CASE_TYPE.ENV:
			return APPEAL_TYPE.ENVIRONMENTAL;
		default:
			return '';
	}
};
