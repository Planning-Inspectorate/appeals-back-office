/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('@pins/appeals.api').Schema.AppellantCase} AppellantCase */

import { createSharedS20S78Fields } from '#mappers/integration/shared/s20s78/appellant-case-fields.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/**
 *
 * @param {Pick<AppellantSubmissionCommand, 'casedata'>} command
 * @returns {Omit<import('#db-client').Prisma.AppellantCaseCreateInput, 'appeal'>}
 */
export const mapAppellantCaseIn = (command) => {
	const casedata = command.casedata;
	const isS78 = casedata.caseType === APPEAL_CASE_TYPE.W;
	const isS20 = casedata.caseType === APPEAL_CASE_TYPE.Y;

	// @ts-ignore
	const sharedFields = createSharedS20S78Fields(command);

	const knowsAllOwners = casedata.knowsAllOwners
		? {
				connect: { key: casedata.knowsAllOwners }
		  }
		: null;

	const knowsOtherOwners = casedata.knowsOtherOwners
		? {
				connect: { key: casedata.knowsOtherOwners }
		  }
		: null;

	const siteAccessDetails =
		casedata.siteAccessDetails != null && casedata.siteAccessDetails.length > 0
			? casedata.siteAccessDetails[0]
			: null;

	const siteSafetyDetails =
		casedata.siteSafetyDetails != null && casedata.siteSafetyDetails.length > 0
			? casedata.siteSafetyDetails[0]
			: null;

	const data = {
		applicationDate: casedata.applicationDate,
		applicationDecision: casedata.applicationDecision,
		applicationDecisionDate: casedata.applicationDecisionDate,
		caseSubmittedDate: casedata.caseSubmittedDate,
		caseSubmissionDueDate: casedata.caseSubmissionDueDate,
		siteAccessDetails,
		siteSafetyDetails,
		siteAreaSquareMetres: casedata.siteAreaSquareMetres,
		floorSpaceSquareMetres: casedata.floorSpaceSquareMetres,
		ownsAllLand: casedata.ownsAllLand,
		ownsSomeLand: casedata.ownsSomeLand,
		hasAdvertisedAppeal: casedata.advertisedAppeal,
		appellantCostsAppliedFor: casedata.appellantCostsAppliedFor,
		originalDevelopmentDescription: casedata.originalDevelopmentDescription,
		changedDevelopmentDescription: casedata.changedDevelopmentDescription,
		ownersInformed: casedata.ownersInformed,
		...(knowsAllOwners && { knowsAllOwners }),
		...(knowsOtherOwners && { knowsOtherOwners }),
		isGreenBelt: casedata.isGreenBelt,
		typeOfPlanningApplication: casedata.typeOfPlanningApplication,
		...(isS20 && { ...sharedFields }),
		...(isS78 && {
			...sharedFields,
			agriculturalHolding: casedata.agriculturalHolding,
			tenantAgriculturalHolding: casedata.tenantAgriculturalHolding,
			otherTenantsAgriculturalHolding: casedata.otherTenantsAgriculturalHolding,
			informedTenantsAgriculturalHolding: casedata.informedTenantsAgriculturalHolding
		}),
		numberOfResidencesNetChange: casedata.numberOfResidencesNetChange
	};

	// @ts-ignore
	return data;
};
