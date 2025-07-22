/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {AppellantCase|undefined}
 */
export const mapAppellantCase = (data) => {
	const { appeal } = data;
	const { appellantCase } = appeal;

	if (appellantCase) {
		const validation = appellantCase.appellantCaseValidationOutcome?.name
			? formatValidationOutcomeResponse(
					appellantCase.appellantCaseValidationOutcome?.name || null,
					appellantCase.appellantCaseIncompleteReasonsSelected,
					appellantCase.appellantCaseInvalidReasonsSelected
			  ) || undefined
			: undefined;

		return {
			validation,
			applicant: {
				firstName: appeal.appellant?.firstName || '',
				surname: appeal.appellant?.lastName || ''
			},
			isAppellantNamedOnApplication: appeal.agent == null,
			applicationDate: appellantCase.applicationDate && appellantCase.applicationDate.toISOString(),
			applicationDecision: appellantCase.applicationDecision || null,
			applicationDecisionDate:
				appellantCase.applicationDecisionDate &&
				appellantCase.applicationDecisionDate?.toISOString(),
			hasAdvertisedAppeal: appellantCase.hasAdvertisedAppeal,
			enforcementNotice: appellantCase?.enforcementNotice || null,
			appellantCostsAppliedFor: appellantCase.appellantCostsAppliedFor,
			floorSpaceSquareMetres: Number(appellantCase?.floorSpaceSquareMetres) || null,
			siteAreaSquareMetres: Number(appellantCase?.siteAreaSquareMetres) || null,
			isGreenBelt: appellantCase?.isGreenBelt,
			siteOwnership: {
				areAllOwnersKnown: appellantCase.knowsAllOwners?.name || null,
				knowsOtherLandowners: appellantCase.knowsOtherOwners?.name || null,
				ownersInformed: appellantCase.ownersInformed || null,
				ownsAllLand: appellantCase.ownsAllLand || null,
				ownsSomeLand: appellantCase.ownsSomeLand || null
			},
			siteAccessRequired: {
				details: appellantCase.siteAccessDetails,
				isRequired: appellantCase.siteAccessDetails !== null
			},
			healthAndSafety: {
				details: appellantCase.siteSafetyDetails,
				hasIssues: appellantCase.siteSafetyDetails !== null
			},
			developmentDescription: {
				details: appellantCase?.originalDevelopmentDescription || null,
				isChanged: appellantCase?.changedDevelopmentDescription === true
			},
			// @ts-ignore
			typeOfPlanningApplication: appellantCase?.typeOfPlanningApplication || null,
			numberOfResidencesNetChange: appellantCase?.numberOfResidencesNetChange
		};
	}
};
