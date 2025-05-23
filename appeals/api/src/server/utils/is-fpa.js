import { APPEAL_TYPE_SHORTHAND_HAS } from '@pins/appeals/constants/support.js';
/**
 * @param {string | null} appealType
 * @returns {boolean}
 */
const isFPA = (appealType) => Boolean(appealType && appealType !== APPEAL_TYPE_SHORTHAND_HAS);
//TODO: use a shared list to aggregate appeal types into 2 categories (HAS-type and S78-type)

export default isFPA;
