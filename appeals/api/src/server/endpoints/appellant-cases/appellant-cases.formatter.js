import formatAddress from '#utils/format-address.js';
import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';
import { mapFoldersLayoutForAppealSection } from '../documents/documents.mapper.js';
import { APPEAL_CASE_STAGE } from 'pins-data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */

/**
 * @param {Appeal} appeal
 * @param {Folder[] | null} folders
 * @returns {SingleAppellantCaseResponse | undefined}
 */
const formatAppellantCase = (appeal, folders = null) => {
	const { appellantCase } = appeal;

	if (appellantCase) {
		// @ts-ignore
		return {
			appealId: appeal.id,
			appealReference: appeal.reference,
			appealSite: {
				addressId: appeal.address?.id,
				...formatAddress(appeal.address)
			},
			appellantCaseId: appellantCase.id,
			applicant: {
				firstName: appeal.appellant?.firstName || '',
				surname: appeal.appellant?.lastName || ''
			},
			isAppellantNamedOnApplication: appeal.agent == null,
			applicationDate: appellantCase.applicationDate && appellantCase.applicationDate.toISOString(),
			applicationDecisionDate:
				appellantCase.applicationDecisionDate &&
				appellantCase.applicationDecisionDate?.toISOString(),
			caseSubmissionDueDate:
				appellantCase.caseSubmissionDueDate && appellantCase.caseSubmissionDueDate?.toISOString(),
			caseSubmittedDate:
				appellantCase.caseSubmittedDate && appellantCase.caseSubmittedDate?.toISOString(),
			planningApplicationReference: appeal.applicationReference || '',
			hasAdvertisedAppeal: appellantCase.hasAdvertisedAppeal,
			siteAccessRequired: {
				details: appellantCase.siteAccessDetails,
				hasIssues: appellantCase.siteAccessDetails !== null
			},
			healthAndSafety: {
				details: appellantCase.siteSafetyDetails,
				hasIssues: appellantCase.siteSafetyDetails !== null
			},
			localPlanningDepartment: appeal.lpa?.name || '',
			procedureType: appeal.procedureType?.name,
			enforcementNotice: appellantCase?.enforcementNotice || null,
			siteOwnership: {
				areAllOwnersKnown: appellantCase.knowsAllOwners?.name || null,
				knowsOtherLandowners: appellantCase.knowsOtherOwners?.name || null,
				ownersInformed: appellantCase.ownersInformed || null,
				ownsAllLand: appellantCase.ownsAllLand || null,
				ownsSomeLand: appellantCase.ownsSomeLand || null
			},
			floorSpaceSquareMetres: appellantCase.floorSpaceSquareMetres || null,
			siteAreaSquareMetres: appellantCase.siteAreaSquareMetres || null,
			developmentDescription: {
				details: appellantCase.originalDevelopmentDescription || null,
				isChanged: appellantCase.changedDevelopmentDescription === true
			},
			validation: formatValidationOutcomeResponse(
				appellantCase.appellantCaseValidationOutcome?.name || '',
				appellantCase.appellantCaseIncompleteReasonsSelected,
				appellantCase.appellantCaseInvalidReasonsSelected
			),
			applicationDecision: appellantCase.applicationDecision || null,
			appellantCostsAppliedFor: appellantCase.appellantCostsAppliedFor,
			appellantProcedurePreference: appellantCase.appellantProcedurePreference,
			appellantProcedurePreferenceDetails: appellantCase.appellantProcedurePreferenceDetails,
			appellantProcedurePreferenceDuration: appellantCase.appellantProcedurePreferenceDuration,
			appellantProcedurePreferenceWitnessCount:
				appellantCase.appellantProcedurePreferenceWitnessCount,
			isGreenBelt: appellantCase.isGreenBelt,
			planningObligation: {
				hasObligation: appellantCase.planningObligation,
				status: appellantCase.statusPlanningObligation
			},
			agriculturalHolding: {
				isPartOfAgriculturalHolding: appellantCase.agriculturalHolding,
				isTenant: appellantCase.tenantAgriculturalHolding,
				hasOtherTenants: appellantCase.otherTenantsAgriculturalHolding
			},
			...formatFoldersAndDocuments(folders)
		};
	}
};

/**
 * @param {Folder[] | null} folders
 */
const formatFoldersAndDocuments = (folders) => {
	if (folders) {
		return {
			documents: mapFoldersLayoutForAppealSection(APPEAL_CASE_STAGE.APPELLANT_CASE, folders)
		};
	}

	return [];
};

export { formatAppellantCase };
