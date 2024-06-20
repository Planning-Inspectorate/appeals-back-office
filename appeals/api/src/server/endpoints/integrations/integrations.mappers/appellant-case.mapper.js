/** @typedef {import('pins-data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */
/** @typedef {import('@pins/appeals.api').Schema.AppellantCase} AppellantCase */

import { mapDate } from './date.mapper.js';

/**
 *
 * @param {Pick<AppellantSubmissionCommand, 'casedata'>} command
 * @returns {*}
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
		hasAdvertisedAppeal: casedata.hasAdvertisedAppeal,
		appellantCostsAppliedFor: casedata.appellantCostsAppliedFor,
		originalDevelopmentDescription: casedata.originalDevelopmentDescription,
		changedDevelopmentDescription: casedata.changedDevelopmentDescription,
		...(knowsAllOwners && { knowsAllOwners }),
		...(knowsOtherOwners && { knowsOtherOwners })
	};

	return data;
};

/**
 *
 * @param {AppellantCase} casedata
 * @returns {*}
 */
export const mapAppellantCaseOut = (casedata) => {
	const data = {
		applicationDate: mapDate(casedata.applicationDate),
		applicationDecision: casedata.applicationDecision,
		applicationDecisionDate: mapDate(casedata.applicationDecisionDate),
		caseSubmittedDate: mapDate(casedata.caseSubmittedDate),
		caseSubmissionDueDate: mapDate(casedata.caseSubmissionDueDate),
		siteAccessDetails: [casedata.siteAccessDetails],
		siteSafetyDetails: [casedata.siteSafetyDetails],
		siteAreaSquareMetres: casedata.siteAreaSquareMetres,
		floorSpaceSquareMetres: casedata.floorSpaceSquareMetres,
		ownsAllLand: casedata.ownsAllLand,
		ownsSomeLand: casedata.ownsSomeLand,
		hasAdvertisedAppeal: casedata.hasAdvertisedAppeal,
		appellantCostsAppliedFor: casedata.appellantCostsAppliedFor,
		originalDevelopmentDescription: casedata.originalDevelopmentDescription,
		changedDevelopmentDescription: casedata.changedDevelopmentDescription,
		knowsAllOwners: casedata.knowsAllOwners?.key,
		knowsOtherOwners: casedata.knowsOtherOwners?.key
	};

	return data;
};
