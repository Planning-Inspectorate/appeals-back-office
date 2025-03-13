import { APPEAL_TYPE_SHORTHAND_FPA } from '@pins/appeals/constants/support.js';
/**
 * @param {string | null} appealType
 * @returns {boolean}
 */
const isFPA = (appealType) => Boolean(appealType && appealType === APPEAL_TYPE_SHORTHAND_FPA);

export default isFPA;
