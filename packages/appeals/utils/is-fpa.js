import {
	APPEAL_TYPE_SHORTHAND_FPA,
	APPEAL_TYPE_SHORTHAND_HAS
} from '@pins/appeals/constants/support.js';

/**
 * @typedef {typeof APPEAL_TYPE_SHORTHAND_HAS | typeof APPEAL_TYPE_SHORTHAND_FPA} BaseAppealType
/** 
 * @type {Record<string, BaseAppealType>} 
 */
const baseCaseType = {
	D: APPEAL_TYPE_SHORTHAND_HAS,
	Z: APPEAL_TYPE_SHORTHAND_HAS,
	W: APPEAL_TYPE_SHORTHAND_FPA,
	Y: APPEAL_TYPE_SHORTHAND_FPA
};

/**
 * @param {string | null} appealType
 * @returns {boolean}
 */
const isFPA = (appealType) =>
	Boolean(appealType && baseCaseType[appealType] !== APPEAL_TYPE_SHORTHAND_HAS);

export default isFPA;
