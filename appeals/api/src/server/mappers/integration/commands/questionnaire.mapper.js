/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@pins/appeals.api').Schema.DesignatedSite} DesignatedSite */

import { createSharedS20S78Fields } from '#mappers/integration/shared/s20s78/questionnaire-fields.js';

/**
 *
 * @param {Pick<LPAQuestionnaireCommand, 'casedata'>} command
 * @param {DesignatedSite[]} designatedSites
 * @returns {Omit<import('#db-client').Prisma.LPAQuestionnaireCreateInput, 'appeal'>}
 */
export const mapQuestionnaireIn = (command, designatedSites) => {
	const casedata = command.casedata;

	const isS20 = casedata.caseType === 'Y';
	const isS78 = casedata.caseType === 'W';

	const sharedFields = createSharedS20S78Fields(command, designatedSites);

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

	const listedBuildingsData = mapListedBuildings(casedata, isS78);

	//@ts-ignore
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
		...(listedBuildingsData && {
			listedBuildingDetails: {
				create: listedBuildingsData
			}
		}),
		reasonForNeighbourVisits: casedata.reasonForNeighbourVisits,
		...(isS78 && { ...sharedFields }),
		...(isS20 && {
			...sharedFields,
			preserveGrantLoan: casedata.preserveGrantLoan
		})
	};
};

/**
 *
 * @param {import('pins-data-model').Schemas.LPAQS78SubmissionProperties} casedata
 * @param {boolean} isS78
 * @returns {{listEntry: string, affectsListedBuilding: boolean }[] | null}
 */
const mapListedBuildings = (casedata, isS78) => {
	const affectedListedBuildings =
		casedata.affectedListedBuildingNumbers?.map((entry) => {
			return {
				listEntry: entry,
				affectsListedBuilding: true
			};
		}) ?? [];

	const changedListedBuildings = isS78
		? (casedata.changedListedBuildingNumbers || []).map((entry) => {
				return {
					listEntry: entry,
					affectsListedBuilding: false
				};
		  })
		: [];

	const combinedListedBuildings = [...affectedListedBuildings, ...changedListedBuildings];

	return combinedListedBuildings.length > 0 ? combinedListedBuildings : null;
};
