import { APPEAL_TYPE_SHORTHAND_HAS } from '#endpoints/constants.js';

/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/**
 *
 * @param {string} appealType
 * @returns
 */
export const mapAppealTypeIn = (appealType) => {
	switch (appealType) {
		case APPEAL_TYPE_SHORTHAND_HAS:
		default:
			return APPEAL_TYPE_SHORTHAND_HAS;
	}
};

/**
 *
 * @param {AppealType | null | undefined} appealType
 * @returns
 */
export const mapAppealTypeOut = (appealType) => appealType?.key || null;
