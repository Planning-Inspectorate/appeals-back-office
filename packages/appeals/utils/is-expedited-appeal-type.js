import {
	APPEAL_TYPE_SHORTHAND_FPA,
	APPEAL_TYPE_SHORTHAND_HAS
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
/**
 * @typedef {typeof APPEAL_TYPE_SHORTHAND_HAS | typeof APPEAL_TYPE_SHORTHAND_FPA} BaseAppealType
 * @typedef {Record<string, BaseAppealType>} BaseCaseType
 */

/** @type {BaseCaseType} */
const baseCaseType = {
	[APPEAL_CASE_TYPE.D]: APPEAL_TYPE_SHORTHAND_HAS,
	[APPEAL_CASE_TYPE.ZP]: APPEAL_TYPE_SHORTHAND_HAS,
	[APPEAL_CASE_TYPE.ZA]: APPEAL_TYPE_SHORTHAND_HAS,
	[APPEAL_CASE_TYPE.H]: APPEAL_TYPE_SHORTHAND_HAS,
	[APPEAL_CASE_TYPE.W]: APPEAL_TYPE_SHORTHAND_FPA,
	[APPEAL_CASE_TYPE.Y]: APPEAL_TYPE_SHORTHAND_FPA,
	[APPEAL_CASE_TYPE.C]: APPEAL_TYPE_SHORTHAND_FPA
};

/**
 * @param {string | null} appealType
 * @returns {boolean}
 */
const isExpeditedAppealType = (appealType) => {
	if (appealType === '') return false;

	if (!appealType || !baseCaseType[appealType]) {
		throw new Error(
			`Appeal type - ${appealType} not defined in isExpeditedAppealType baseCaseType`
		);
	}
	return Boolean(baseCaseType[appealType] === APPEAL_TYPE_SHORTHAND_HAS);
};

export default isExpeditedAppealType;
