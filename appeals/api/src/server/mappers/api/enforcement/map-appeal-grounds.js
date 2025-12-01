/** @typedef {import('../../../../../index.d.ts').Schema.AppealGround} AppealGround */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {{appealGrounds: AppealGround[] | null}}
 */
export const mapEnforcementAppealGrounds = (data) => {
	const {
		appeal: { appellantCase, appealGrounds }
	} = data;

	// @ts-ignore
	const hasEnforcementData = [true, false].includes(appellantCase?.enforcementNotice);
	return {
		appealGrounds: hasEnforcementData
			? // @ts-ignore
			  appealGrounds || []
			: null
	};
};
