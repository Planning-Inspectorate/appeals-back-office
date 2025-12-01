/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {AppellantCase|undefined}
 */
export const mapEnforcementAppellantCase = (data) => {
	const {
		appeal: { appellantCase }
	} = data;

	// @ts-ignore
	const hasEnforcementData = [true, false].includes(appellantCase?.enforcementNotice);

	return {
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
			interestInLand: hasEnforcementData ? appellantCase?.interestInLand : null,
			writtenOrVerbalPermission: hasEnforcementData
				? appellantCase?.writtenOrVerbalPermission
				: null,
			contactAddress: hasEnforcementData
				? // @ts-ignore
				  appellantCase?.contactAddress
				: null
		}
	};
};
