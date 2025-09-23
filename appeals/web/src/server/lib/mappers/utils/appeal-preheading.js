import { appealShortReference } from '#lib/appeals-formatter.js';
import isLinkedAppeal, { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 * @param {WebAppeal} currentAppeal
 * @param {string|undefined} [captionSuffix]
 * @returns {string}
 */
export function preHeadingText(currentAppeal, captionSuffix = '') {
	return `Appeal ${appealShortReference(currentAppeal.appealReference)}${
		isLinkedAppeal(currentAppeal) ? (isChildAppeal(currentAppeal) ? ' (child)' : ' (lead)') : ''
	}${captionSuffix ? ' - ' + captionSuffix : ''}`;
}
