/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@pins/appeals.api').Schema.LPAQuestionnaire} LPAQuestionnaire */

import { mapDate } from './date.mapper.js';

/**
 *
 * @param {Pick<LPAQuestionnaireCommand, 'casedata'>} command
 * @returns {*}
 */
export const mapQuestionnaireIn = (command) => {
	const casedata = command.casedata;
	const siteAccessDetails =
		casedata.siteAccessDetails != null && casedata.siteAccessDetails.length > 0
			? casedata.siteAccessDetails[0]
			: null;

	const siteSafetyDetails =
		casedata.siteSafetyDetails != null && casedata.siteSafetyDetails.length > 0
			? casedata.siteSafetyDetails[0]
			: null;

	const lpaNotificationMethods =
		casedata.notificationMethod != null && casedata.notificationMethod.length > 0
			? {
					create: casedata.notificationMethod.map((method) => {
						return {
							lpaNotificationMethod: {
								connectOrCreate: {
									create: {
										key: method,
										name: method
									},
									where: {
										key: method
									}
								}
							}
						};
					})
			  }
			: null;

	const listedBuildingDetails = casedata.affectedListedBuildingNumbers
		? {
				create: casedata.affectedListedBuildingNumbers.map((entry) => {
					return {
						listEntry: entry,
						affectsListedBuilding: true
					};
				})
		  }
		: null;

	return {
		lpaQuestionnaireSubmittedDate: casedata.lpaQuestionnaireSubmittedDate,
		lpaStatement: casedata.lpaStatement,
		isCorrectAppealType: casedata.isCorrectAppealType,
		siteWithinGreenBelt: casedata.inGreenBelt,
		inConservationArea: casedata.inConservationArea,
		newConditionDetails: casedata.newConditionDetails,
		lpaCostsAppliedFor: casedata.lpaCostsAppliedFor,
		siteAccessDetails,
		siteSafetyDetails,
		lpaNotificationMethods,
		listedBuildingDetails
	};
};

/**
 *
 * @param {LPAQuestionnaire | null | undefined} casedata
 * @returns
 */
export const mapQuestionnaireOut = (casedata) => {
	return {
		lpaQuestionnaireSubmittedDate: mapDate(casedata?.lpaQuestionnaireSubmittedDate),
		lpaQuestionnaireCreatedDate: mapDate(casedata?.lpaqCreatedDate),
		lpaStatement: casedata?.lpaStatement || null,
		isCorrectAppealType: casedata?.isCorrectAppealType || null,
		isGreenBelt: casedata?.siteWithinGreenBelt || null,
		inConservationArea: casedata?.inConservationArea || null,
		newConditionDetails: casedata?.newConditionDetails || null,
		notificationMethod: casedata?.lpaNotificationMethods
			? casedata?.lpaNotificationMethods.map((method) => method.lpaNotificationMethod.key)
			: null,
		lpaCostsAppliedFor: casedata?.lpaCostsAppliedFor || null,
		listedBuildingDetails: casedata?.listedBuildingDetails
			? casedata?.listedBuildingDetails.map((entry) => entry.listEntry)
			: null
	};
};
