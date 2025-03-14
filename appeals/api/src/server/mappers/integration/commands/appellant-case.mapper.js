/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('@pins/appeals.api').Schema.AppellantCase} AppellantCase */

import { APPEAL_CASE_TYPE } from 'pins-data-model';

/**
 *
 * @param {Pick<AppellantSubmissionCommand, 'casedata'>} command
 * @returns {Omit<import('#db-client').Prisma.AppellantCaseCreateInput, 'appeal'>}
 */
export const mapAppellantCaseIn = (command) => {
	const casedata = command.casedata;
	const isS78 = casedata.caseType === APPEAL_CASE_TYPE.W;

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
		...(isS78 && {
			appellantProcedurePreference: casedata.appellantProcedurePreference,
			appellantProcedurePreferenceDetails: casedata.appellantProcedurePreferenceDetails,
			appellantProcedurePreferenceDuration: casedata.appellantProcedurePreferenceDuration,
			appellantProcedurePreferenceWitnessCount: casedata.appellantProcedurePreferenceWitnessCount,
			planningObligation: casedata.planningObligation,
			statusPlanningObligation: casedata.statusPlanningObligation,
			agriculturalHolding: casedata.agriculturalHolding,
			tenantAgriculturalHolding: casedata.tenantAgriculturalHolding,
			otherTenantsAgriculturalHolding: casedata.otherTenantsAgriculturalHolding,
			informedTenantsAgriculturalHolding: casedata.informedTenantsAgriculturalHolding,
			siteViewableFromRoad: casedata.siteViewableFromRoad,
			caseworkReason: casedata.caseworkReason,
			developmentType: casedata.developmentType,
			jurisdiction: casedata.jurisdiction,
			numberOfResidencesNetChange: casedata.numberOfResidencesNetChange,
			siteGridReferenceEasting: casedata.siteGridReferenceEasting,
			siteGridReferenceNorthing: casedata.siteGridReferenceNorthing
		})
	};

	// @ts-ignore
	return data;
};
