import formatAddress from '#utils/format-address.js';
import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';
import { mapFoldersLayoutForAppealSection } from '../documents/documents.mapper.js';
import { STAGE } from '@pins/appeals/constants/documents.js';

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
			// @ts-ignore
			applicationDate: appellantCase.applicationDate && appellantCase.applicationDate.toISOString(),
			// @ts-ignore
			applicationDecisionDate:
				appellantCase.applicationDecisionDate &&
				appellantCase.applicationDecisionDate?.toISOString(),
			// @ts-ignore
			caseSubmissionDueDate:
				appellantCase.caseSubmissionDueDate && appellantCase.caseSubmissionDueDate?.toISOString(),
			// @ts-ignore
			caseSubmittedDate:
				appellantCase.caseSubmittedDate && appellantCase.caseSubmittedDate?.toISOString(),
			planningApplicationReference: appeal.applicationReference || '',
			hasAdvertisedAppeal: appellantCase.hasAdvertisedAppeal,
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
				isCorrect: appellantCase.changedDevelopmentDescription !== true
			},
			validation: formatValidationOutcomeResponse(
				appellantCase.appellantCaseValidationOutcome?.name || '',
				appellantCase.appellantCaseIncompleteReasonsSelected,
				appellantCase.appellantCaseInvalidReasonsSelected
			),
			applicationDecision: appellantCase.applicationDecision || null,
			appellantCostsAppliedFor: appellantCase.appellantCostsAppliedFor,
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
			documents: mapFoldersLayoutForAppealSection(STAGE.APPELLANT_CASE, folders)
		};
	}

	return [];
};

export { formatAppellantCase };
