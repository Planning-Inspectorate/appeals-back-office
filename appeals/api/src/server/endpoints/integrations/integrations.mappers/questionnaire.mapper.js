/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */

/**
 *
 * @param {Pick<LPAQuestionnaireCommand, 'casedata'>} command
 * @returns {Omit<import('#db-client').Prisma.LPAQuestionnaireCreateInput, 'appeal'>}
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
								connect: {
									key: method
								}
							}
						};
					})
			  }
			: undefined;

	const listedBuildingDetails = casedata.affectedListedBuildingNumbers
		? {
				create: casedata.affectedListedBuildingNumbers.map((entry) => {
					return {
						listEntry: entry,
						affectsListedBuilding: true
					};
				})
		  }
		: undefined;

	return {
		lpaQuestionnaireSubmittedDate: casedata.lpaQuestionnaireSubmittedDate,
		lpaStatement: casedata.lpaStatement,
		isCorrectAppealType: casedata.isCorrectAppealType,
		isGreenBelt: casedata.isGreenBelt,
		inConservationArea: casedata.inConservationArea,
		newConditionDetails: casedata.newConditionDetails,
		lpaCostsAppliedFor: casedata.lpaCostsAppliedFor,
		siteAccessDetails,
		siteSafetyDetails,
		lpaNotificationMethods,
		listedBuildingDetails
	};
};
