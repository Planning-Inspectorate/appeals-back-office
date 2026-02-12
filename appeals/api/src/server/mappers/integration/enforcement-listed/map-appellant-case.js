/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef {import('@pins/appeals.api').Schema.AppealGround} AppealGround */

import { mapAppellantCaseSharedFields } from '#mappers/integration/shared/s20s78/map-appellant-case.js';
import { capitalize } from 'lodash-es';

/**
 *
 * @param {AppealGround} appealGround
 * @returns {any}
 */
const mapAppealGround = (appealGround) => {
	return {
		appealGroundLetter: appealGround.ground?.groundRef ?? null,
		groundFacts: appealGround.factsForGround ?? null
	};
};

/**
 *
 * @param {MappingRequest} data
 */
export const mapAppellantCase = (data) => {
	const { appellantCase, appealGrounds } = data.appeal || {};
	const {
		interestInLand,
		enforcementEffectiveDate,
		enforcementIssueDate,
		agriculturalHolding,
		tenantAgriculturalHolding,
		otherTenantsAgriculturalHolding,
		informedTenantsAgriculturalHolding,
		enforcementReference,
		contactPlanningInspectorateDate,
		descriptionOfAllegedBreach,
		applicationMadeAndFeePaid
	} = appellantCase || {};
	return {
		...mapAppellantCaseSharedFields(data),
		ownerOccupancyStatus: interestInLand ? capitalize(interestInLand) : null,
		applicationElbAppealGroundDetails: appealGrounds?.length
			? appealGrounds.filter(({ isDeleted }) => !isDeleted).map(mapAppealGround)
			: null,
		previousPlanningPermissionGranted: null,
		issueDateOfEnforcementNotice: enforcementIssueDate?.toISOString() ?? null,
		effectiveDateOfEnforcementNotice: enforcementEffectiveDate?.toISOString() ?? null,
		dateLpaDecisionDue: null,
		agriculturalHolding: agriculturalHolding ?? null,
		tenantAgriculturalHolding: tenantAgriculturalHolding ?? null,
		otherTenantsAgriculturalHolding: otherTenantsAgriculturalHolding ?? null,
		informedTenantsAgriculturalHolding: informedTenantsAgriculturalHolding ?? null,
		enforcementNoticeReference: enforcementReference ?? null,
		dateAppellantContactedPins: contactPlanningInspectorateDate?.toISOString() ?? null,
		descriptionOfAllegedBreach: descriptionOfAllegedBreach ?? null,
		applicationMadeAndFeePaid: applicationMadeAndFeePaid ?? null
	};
};
