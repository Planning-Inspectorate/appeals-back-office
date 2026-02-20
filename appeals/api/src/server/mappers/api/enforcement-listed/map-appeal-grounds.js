/** @typedef {import('../../../../../index.js').Schema.AppealGround} AppealGround */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {{appealGrounds: AppealGround[] | null}}
 */
export const mapEnforcementAppealGrounds = (data) => {
	const {
		appeal: { appellantCase, appealGrounds = [] }
	} = data;

	// @ts-ignore
	const hasEnforcementData = [true, false].includes(appellantCase?.enforcementNotice);
	return {
		appealGrounds: hasEnforcementData
			? // @ts-ignore
				appealGrounds.sort(
					// Make sure appeal grounds are sorted in ground ref order
					(a, b) =>
						(a?.ground?.groundRef?.charCodeAt(0) || 0) - (b?.ground?.groundRef?.charCodeAt(0) || 0)
				) || []
			: null
	};
};
