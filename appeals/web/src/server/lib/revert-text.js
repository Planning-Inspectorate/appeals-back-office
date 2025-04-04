import { REVERT_BUTTON_TEXT } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {string} finalCommentsType
 * @returns
 */
export const findButtonText = (finalCommentsType) => {
	switch (finalCommentsType) {
		case 'lpa':
			return REVERT_BUTTON_TEXT.LPA_FINAL_COMMENT;
		case 'appellant':
			return REVERT_BUTTON_TEXT.APPELLANT_FINAL_COMMENT;
		default:
			return REVERT_BUTTON_TEXT.DEFAULT_TEXT;
	}
};
