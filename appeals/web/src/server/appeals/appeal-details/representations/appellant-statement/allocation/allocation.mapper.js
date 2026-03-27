import * as commonAllocationMapper from '../../common/allocation/allocation.mapper.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {'valid' | 'redact'} flowRoute
 * @param {Record<string, string>} [sessionData]
 * @returns {PageContent}
 */
export function allocationCheckPage(appealDetails, flowRoute, sessionData) {
	const backLinkUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement${
		flowRoute === 'valid' ? '' : `/${flowRoute}`
	}`;

	return commonAllocationMapper.allocationCheckPage(appealDetails, sessionData, backLinkUrl);
}

/**
 * @param {Appeal} appealDetails
 * @param {string[]} allocationLevels
 * @param {Record<string, string>} sessionData
 * @param {'valid' | 'redact'} flowRoute
 * @returns {PageContent}
 * */
export function allocationLevelPage(appealDetails, allocationLevels, sessionData, flowRoute) {
	const backLinkUrl = sessionData?.forcedAllocation
		? `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement${
				flowRoute === 'valid' ? '' : `/${flowRoute}`
			}`
		: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/${flowRoute}/allocation-check`;

	return commonAllocationMapper.allocationLevelPage(
		appealDetails,
		allocationLevels,
		sessionData,
		backLinkUrl
	);
}

/**
 * @param {Appeal} appealDetails
 * @param {{ id: number, name: string }[]} specialisms
 * @param {Record<string, string>} sessionData
 * @param {'valid'|'redact'} flowRoute
 * @returns {PageContent}
 * */
export function allocationSpecialismsPage(appealDetails, specialisms, sessionData, flowRoute) {
	const backLinkUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-statement/${flowRoute}/allocation-level`;

	return commonAllocationMapper.allocationSpecialismsPage(
		appealDetails,
		specialisms,
		sessionData,
		backLinkUrl
	);
}
