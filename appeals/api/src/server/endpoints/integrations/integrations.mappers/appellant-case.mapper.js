/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('@pins/appeals.api').Schema.AppellantCase} AppellantCase */

import { mapDate } from './date.mapper.js';

/**
 *
 * @param {Pick<AppellantSubmissionCommand, 'casedata'>} command
 * @returns
 */
export const mapAppellantCaseIn = (command) => {
	const casedata = command.casedata;
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
		...(knowsOtherOwners && { knowsOtherOwners })
	};

	return data;
};

/**
 *
 * @param {AppellantCase | null | undefined} casedata
 * @returns
 */
export const mapAppellantCaseOut = (casedata) => {
	if (!casedata) {
		return {};
	}

	const data = {
		applicationDate: mapDate(casedata.applicationDate),
		applicationDecision: casedata.applicationDecision,
		applicationDecisionDate: mapDate(casedata.applicationDecisionDate),
		caseSubmittedDate: mapDate(casedata.caseSubmittedDate),
		caseSubmissionDueDate: mapDate(casedata.caseSubmissionDueDate),
		siteAreaSquareMetres: casedata.siteAreaSquareMetres
			? Number(casedata.siteAreaSquareMetres)
			: null,
		floorSpaceSquareMetres: casedata.floorSpaceSquareMetres
			? Number(casedata.floorSpaceSquareMetres)
			: null,
		ownsAllLand: casedata.ownsAllLand || null,
		ownsSomeLand: casedata.ownsSomeLand || null,
		advertisedAppeal: casedata.hasAdvertisedAppeal || null,
		appellantCostsAppliedFor: casedata.appellantCostsAppliedFor || null,
		originalDevelopmentDescription: casedata.originalDevelopmentDescription || null,
		changedDevelopmentDescription: casedata.changedDevelopmentDescription || null,
		knowsAllOwners: casedata.knowsAllOwners?.name || null,
		knowsOtherOwners: casedata.knowsOtherOwners?.name || null,
		ownersInformed: casedata.ownersInformed || null,
		enforcementNotice: casedata.enforcementNotice || null
	};

	return data;
};
