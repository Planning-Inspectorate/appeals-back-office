import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { appealTypeToAppealCaseTypeMapper } from './appeal-type-case.mapper.js';
import isExpeditedAppealType from './is-expedited-appeal-type.js';

/**
 * @param {string} appealType
 * @returns {boolean}
 */
const askEnvironmentServiceTeamReviewQuestion = (appealType) => {
	if (typeof appealType !== 'string' || !appealType) {
		throw new Error(
			`Appeal type - ${appealType} not defined in askEnvironmentServiceTeamReviewQuestion`
		);
	}

	const appealCaseType = appealTypeToAppealCaseTypeMapper(appealType);

	// appealCaseType will be '' if appealType is not valid
	if (!appealCaseType) {
		throw new Error(
			`Appeal type - ${appealType} is not a valid appeal type in askEnvironmentServiceTeamReviewQuestion`
		);
	}

	// all HAS (expedited) based appeal types don't want the environmental question
	// full adverts, lawful development certificates and discontinuance notices also don't want the question
	if (
		isExpeditedAppealType(appealCaseType) ||
		appealType === APPEAL_TYPE.ADVERTISEMENT ||
		appealType === APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE ||
		appealType === APPEAL_TYPE.DISCONTINUANCE_NOTICE
	) {
		return false;
	}
	return true;
};

export default askEnvironmentServiceTeamReviewQuestion;
