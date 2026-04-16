/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { mapAppellantCaseSharedFields } from '../shared/s20s78/map-appellant-case.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealS78Case}
 */
export const mapAppellantCase = (data) => {
	const { appeal } = data;

	const casedata = appeal.appellantCase;

	// @ts-ignore
	return {
		...mapAppellantCaseSharedFields(data),
		informedTenantsAgriculturalHolding: casedata?.informedTenantsAgriculturalHolding ?? null,
		agriculturalHolding: casedata?.agriculturalHolding ?? null,
		tenantAgriculturalHolding: casedata?.tenantAgriculturalHolding ?? null,
		otherTenantsAgriculturalHolding: casedata?.otherTenantsAgriculturalHolding ?? null,
		reasonForAppealAppellant: casedata?.reasonForAppealAppellant ?? null,
		screeningOpinionIndicatesEiaRequired: casedata?.screeningOpinionIndicatesEiaRequired ?? null,
		ownershipCertificate: casedata?.ownershipCertificate ?? null,
		/** @type {any[]} */
		significantChangesAffectingApplicationAppellant:
			casedata?.anySignificantChanges === 'Yes'
				? [
						{
							value: 'adopted-a-new-local-plan',
							comment: casedata?.anySignificantChanges_localPlanSignificantChanges ?? null
						},
						{
							value: 'national-policy-change',
							comment: casedata?.anySignificantChanges_nationalPolicySignificantChanges ?? null
						},
						{
							value: 'court-judgement',
							comment: casedata?.anySignificantChanges_courtJudgementSignificantChanges ?? null
						},
						{
							value: 'other',
							comment: casedata?.anySignificantChanges_otherSignificantChanges ?? null
						}
					].filter((c) => c.comment !== null)
				: []
	};
};
