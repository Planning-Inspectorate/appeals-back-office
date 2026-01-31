/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { mapS78AppellantCase } from '../s78/map-appellant-case.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {AppellantCase|undefined}
 */
export const mapEnforcementAppellantCase = (data) => {
	const {
		appeal: { appellantCase, parentAppeals = [], childAppeals = [], appealType }
	} = data;

	const sharedS78Mappers = mapS78AppellantCase(data);

	// @ts-ignore
	const hasEnforcementData = [true, false].includes(appellantCase?.enforcementNotice);
	const { id: addressId, postcode, ...restOfAddress } = appellantCase?.contactAddress || {};
	const isEnforcementChild =
		parentAppeals.some(({ type }) => type === CASE_RELATIONSHIP_LINKED) &&
		appealType?.key === APPEAL_CASE_TYPE.C;
	const isEnforcementParent =
		childAppeals.some(({ type }) => type === CASE_RELATIONSHIP_LINKED) &&
		appealType?.key === APPEAL_CASE_TYPE.C;

	return {
		...sharedS78Mappers,
		isEnforcementChild,
		isEnforcementParent,
		enforcementNotice: {
			isReceived: hasEnforcementData ? appellantCase?.enforcementNotice : null,
			isListedBuilding: hasEnforcementData ? appellantCase?.enforcementNoticeListedBuilding : null,
			issueDate: hasEnforcementData ? appellantCase?.enforcementIssueDate?.toISOString() : null,
			effectiveDate: hasEnforcementData
				? appellantCase?.enforcementEffectiveDate?.toISOString()
				: null,
			contactPlanningInspectorateDate: hasEnforcementData
				? appellantCase?.contactPlanningInspectorateDate?.toISOString()
				: null,
			reference: hasEnforcementData ? appellantCase?.enforcementReference : null,
			interestInLand: appellantCase?.interestInLand ?? null,
			writtenOrVerbalPermission: hasEnforcementData
				? appellantCase?.writtenOrVerbalPermission
				: null,
			descriptionOfAllegedBreach: hasEnforcementData
				? appellantCase?.descriptionOfAllegedBreach
				: null,
			applicationMadeAndFeePaid: appellantCase?.applicationMadeAndFeePaid ?? null,
			applicationDevelopmentAllOrPart: appellantCase?.applicationDevelopmentAllOrPart ?? null,
			// @ts-ignore
			contactAddress: hasEnforcementData
				? {
						...restOfAddress,
						addressId,
						postCode: postcode ?? ''
					}
				: null,
			applicationDecisionAppealed: appellantCase?.applicationDecisionAppealed ?? null,
			appealDecisionDate: hasEnforcementData
				? appellantCase?.appealDecisionDate?.toISOString()
				: null
		}
	};
};
