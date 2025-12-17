/** @typedef {import('../../../../../index.d.ts').Schema.ServiceUser} ServiceUser */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {{otherAppellants: ServiceUser[] | null}}
 */
export const mapEnforcementAppealOtherAppellants = (data) => {
	const {
		appeal: { appellantCase }
	} = data;

	// @ts-ignore
	const hasEnforcementData = [true, false].includes(appellantCase?.enforcementNotice);
	return {
		// ToDo: Add other appellants from linked enforcement appeals
		otherAppellants: hasEnforcementData ? [] : null
	};
};
