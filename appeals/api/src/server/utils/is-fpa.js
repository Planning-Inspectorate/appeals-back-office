import { APPEAL_TYPE_SHORTHAND_FPA } from '#endpoints/constants.js';
/**
 * @param {string | null} appealType
 * @returns {boolean}
 */
const isFPA = (appealType) =>
	Boolean(appealType && appealType === APPEAL_TYPE_SHORTHAND_FPA);

export default isFPA;
