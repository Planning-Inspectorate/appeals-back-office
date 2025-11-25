/** @typedef {import('../../../../../index.d.ts').Schema.ServiceUser} ServiceUser */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {{otherAppellants: ServiceUser[] | null}}
 */
export const mapEnforcementAppealOtherAppellants = (data) => {
	const {
		appeal: { appellantCase, otherAppellants }
	} = data;

	// @ts-ignore
	const hasEnforcementData = [true, false].includes(appellantCase?.enforcementNotice);
	return {
		otherAppellants: hasEnforcementData
			? // @ts-ignore
			  otherAppellants?.map((otherAppellant) => otherAppellant.appellant) || []
			: null
	};
};
