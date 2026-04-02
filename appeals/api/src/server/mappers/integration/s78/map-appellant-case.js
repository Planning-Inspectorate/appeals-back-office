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
		anySignificantChanges: casedata?.anySignificantChanges ?? null,
		anySignificantChanges_otherSignificantChanges:
			casedata?.anySignificantChanges_otherSignificantChanges ?? null,
		anySignificantChanges_localPlanSignificantChanges:
			casedata?.anySignificantChanges_localPlanSignificantChanges ?? null,
		anySignificantChanges_nationalPolicySignificantChanges:
			casedata?.anySignificantChanges_nationalPolicySignificantChanges ?? null,
		anySignificantChanges_courtJudgementSignificantChanges:
			casedata?.anySignificantChanges_courtJudgementSignificantChanges ?? null,
		screeningOpinionIndicatesEiaRequired: casedata?.screeningOpinionIndicatesEiaRequired ?? null,
		ownershipCertificate: casedata?.ownershipCertificate ?? null
	};
};
