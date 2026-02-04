import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/**
 * @typedef {typeof APPEAL_CASE_TYPE['D'] | typeof APPEAL_CASE_TYPE['W']} BaseAppealType
 * @typedef {Record<string, BaseAppealType>} BaseCaseType
 */

/** @type {BaseCaseType} */
const baseCaseType = {
	[APPEAL_CASE_TYPE.D]: APPEAL_CASE_TYPE.D,
	[APPEAL_CASE_TYPE.ZP]: APPEAL_CASE_TYPE.D,
	[APPEAL_CASE_TYPE.ZA]: APPEAL_CASE_TYPE.D,
	[APPEAL_CASE_TYPE.H]: APPEAL_CASE_TYPE.W,
	[APPEAL_CASE_TYPE.W]: APPEAL_CASE_TYPE.W,
	[APPEAL_CASE_TYPE.Y]: APPEAL_CASE_TYPE.W,
	[APPEAL_CASE_TYPE.C]: APPEAL_CASE_TYPE.W,
	[APPEAL_CASE_TYPE.X]: APPEAL_CASE_TYPE.W
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
	return Boolean(baseCaseType[appealType] === APPEAL_CASE_TYPE.D);
};

export default isExpeditedAppealType;
