/** @typedef {import('pins-data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@pins/appeals.api').Schema.DesignatedSite} DesignatedSite */

/**
 *
 * @param {import('pins-data-model').Schemas.LPAQS78SubmissionProperties} casedata
 * @param {DesignatedSite[]} designatedSites
 * @returns {*|undefined}
 */
const mapDesignatedSiteNames = (casedata, designatedSites) => {
	if (casedata.designatedSitesNames && casedata.designatedSitesNames.length > 0) {
		const defaultSiteNames = designatedSites.map((site) => site.key);

		const siteNames = casedata.designatedSitesNames.filter((site) =>
			defaultSiteNames.includes(site)
		);

		const customSiteName = casedata.designatedSitesNames.find(
			(/** @type {string} */ site) => !defaultSiteNames.includes(site)
		);

		return {
			designatedSiteNames: {
				create: siteNames.map((site) => {
					return {
						designatedSite: {
							connect: { key: site }
						}
					};
				})
			},
			designatedSiteNameCustom: customSiteName
		};
	}
};

/**
 *
 * @param {Pick<LPAQuestionnaireCommand, 'casedata'>} command
 * @param {DesignatedSite[]} designatedSites
 * @returns {Omit<import('#db-client').Prisma.LPAQuestionnaireCreateInput, 'appeal'>}
 */
export const createSharedS20S78Fields = (command, designatedSites) => ({
	lpaStatement: command.casedata.lpaStatement,
	affectsScheduledMonument: command.casedata.affectsScheduledMonument,
	isAonbNationalLandscape: command.casedata.isAonbNationalLandscape,
	isGypsyOrTravellerSite: command.casedata.isGypsyOrTravellerSite,
	isPublicRightOfWay: command.casedata.isPublicRightOfWay,
	...mapDesignatedSiteNames(command.casedata, designatedSites),
	eiaEnvironmentalImpactSchedule: command.casedata.eiaEnvironmentalImpactSchedule,
	eiaDevelopmentDescription: command.casedata.eiaDevelopmentDescription,
	eiaSensitiveAreaDetails: command.casedata.eiaSensitiveAreaDetails,
	eiaColumnTwoThreshold: command.casedata.eiaColumnTwoThreshold,
	eiaScreeningOpinion: command.casedata.eiaScreeningOpinion,
	eiaScopingOpinion: command.casedata.eiaScopingOpinion,
	eiaRequiresEnvironmentalStatement: command.casedata.eiaRequiresEnvironmentalStatement,
	eiaCompletedEnvironmentalStatement: command.casedata.eiaCompletedEnvironmentalStatement,
	consultedBodiesDetails: command.casedata.consultedBodiesDetails,
	hasProtectedSpecies: command.casedata.hasProtectedSpecies,
	hasTreePreservationOrder: command.casedata.hasTreePreservationOrder,
	hasStatutoryConsultees: command.casedata.hasStatutoryConsultees,
	hasConsultationResponses: command.casedata.hasConsultationResponses,
	hasEmergingPlan: command.casedata.hasEmergingPlan,
	hasSupplementaryPlanningDocs: command.casedata.hasSupplementaryPlanningDocs,
	hasInfrastructureLevy: command.casedata.hasInfrastructureLevy,
	isInfrastructureLevyFormallyAdopted: command.casedata.isInfrastructureLevyFormallyAdopted,
	infrastructureLevyAdoptedDate: command.casedata.infrastructureLevyAdoptedDate,
	infrastructureLevyExpectedDate: command.casedata.infrastructureLevyExpectedDate,
	lpaProcedurePreference: command.casedata.lpaProcedurePreference,
	lpaProcedurePreferenceDetails: command.casedata.lpaProcedurePreferenceDetails,
	lpaProcedurePreferenceDuration: command.casedata.lpaProcedurePreferenceDuration
});
