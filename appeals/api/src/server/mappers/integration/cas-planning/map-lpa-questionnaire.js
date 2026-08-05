/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealHASCase}
 */
export const mapLpaQuestionnaire = (data) => {
	const { appeal } = data;

	const casedata = appeal.lpaQuestionnaire;
	const significantChanges =
		/** @type {import('@planning-inspectorate/data-model').Schemas.AppealS78Case['significantChangesAffectingApplicationLpa']} */ (
			casedata?.anySignificantChangesLpa === 'Yes'
				? [
						{
							value: 'adopted-a-new-local-plan',
							comment: casedata?.anySignificantChangesLpa_localPlanSignificantChanges ?? null
						},
						{
							value: 'national-policy-change',
							comment: casedata?.anySignificantChangesLpa_nationalPolicySignificantChanges ?? null
						},
						{
							value: 'court-judgement',
							comment: casedata?.anySignificantChangesLpa_courtJudgementSignificantChanges ?? null
						},
						{
							value: 'other',
							comment: casedata?.anySignificantChangesLpa_otherSignificantChanges ?? null
						}
					].filter((c) => c.comment !== null)
				: []
		);
	return {
		lpaStatement: casedata?.lpaStatement ?? null,
		isCorrectAppealType: casedata?.isCorrectAppealType ?? null,
		...(casedata && { isGreenBelt: casedata?.isGreenBelt ?? null }),
		inConservationArea: casedata?.inConservationArea ?? null,
		newConditionDetails: casedata?.newConditionDetails ?? null,
		// @ts-ignore
		notificationMethod: casedata?.lpaNotificationMethods
			? casedata?.lpaNotificationMethods.map((method) => method.lpaNotificationMethod.key)
			: null,
		lpaCostsAppliedFor: casedata?.lpaCostsAppliedFor ?? null,
		// @ts-ignore
		affectedListedBuildingNumbers:
			casedata?.listedBuildingDetails
				?.filter((lp) => lp.affectsListedBuilding)
				.map((lb) => lb.listEntry) || null,
		reasonForNeighbourVisits: casedata?.reasonForNeighbourVisits,
		listOfDocumentsBeforeDecision: casedata?.listOfDocumentsBeforeDecision ?? null,
		anySignificantChangesAffectingApplicationLpa: significantChanges
	};
};
