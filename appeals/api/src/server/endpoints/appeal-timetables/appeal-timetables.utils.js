import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/**
 * Map appeal type to template value
 * @param {string | undefined | null} appealType
 * @returns {string}
 */
export const appealTypeMap = (appealType) => {
	switch (appealType) {
		case APPEAL_CASE_TYPE.W:
			return '-s78-';
		case APPEAL_CASE_TYPE.Y:
			return '-s78-';
		case APPEAL_CASE_TYPE.H:
			return '-s78-';
		case APPEAL_CASE_TYPE.ZA:
			return '-cas-advertisement-';
		default:
			return '-';
	}
};
