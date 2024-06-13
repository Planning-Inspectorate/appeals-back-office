// @ts-nocheck
import { APPEAL_TYPE_SHORTHAND_HAS } from '#endpoints/constants.js';

export const mapAppealTypeIn = (appealType) => {
	switch (appealType) {
		case APPEAL_TYPE_SHORTHAND_HAS:
		default:
			return APPEAL_TYPE_SHORTHAND_HAS;
	}
};

export const mapAppealTypeOut = (appealType) => appealType;
