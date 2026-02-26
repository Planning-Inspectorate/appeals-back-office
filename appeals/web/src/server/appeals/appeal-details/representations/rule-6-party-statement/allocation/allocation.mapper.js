import * as commonAllocationMapper from '../../common/allocation/allocation.mapper.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {'valid' | 'redact'} flowRoute
 * @param {string} rule6PartyId
 * @param {Record<string, string>} [sessionData]
 * @returns {PageContent}
 */
export function allocationCheckPage(appealDetails, flowRoute, rule6PartyId, sessionData) {
	const backLinkUrl = `/appeals-service/appeal-details/${
		appealDetails.appealId
	}/rule-6-party-statement/${rule6PartyId}${flowRoute === 'valid' ? '/' : `/${flowRoute}`}`;

	return commonAllocationMapper.allocationCheckPage(appealDetails, sessionData, backLinkUrl);
}

/**
 * @param {Appeal} appealDetails
 * @param {string[]} allocationLevels
 * @param {string} rule6PartyId
 * @param {Record<string, string>} sessionData
 * @param {'valid' | 'redact'} flowRoute
 * @returns {PageContent}
 * */
export function allocationLevelPage(
	appealDetails,
	allocationLevels,
	rule6PartyId,
	sessionData,
	flowRoute
) {
	const backLinkUrl = sessionData?.forcedAllocation
		? `/appeals-service/appeal-details/${
				appealDetails.appealId
			}/rule-6-party-statement/${rule6PartyId}${flowRoute === 'valid' ? '/' : `/${flowRoute}`}`
		: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/${flowRoute}/allocation-check`;

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
 * @param {string} rule6PartyId
 * @param {Record<string, string>} sessionData
 * @param {'valid'|'redact'} flowRoute
 * @returns {PageContent}
 * */
export function allocationSpecialismsPage(
	appealDetails,
	specialisms,
	rule6PartyId,
	sessionData,
	flowRoute
) {
	const backLinkUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/${flowRoute}/allocation-level`;

	return commonAllocationMapper.allocationSpecialismsPage(
		appealDetails,
		specialisms,
		sessionData,
		backLinkUrl
	);
}
