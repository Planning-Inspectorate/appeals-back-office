import { getAllAppealTypes } from '#repositories/appeal-type.repository.js';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';

/**
 *
 * @param {boolean} filterEnabled
 */
const getAppealTypesReq = async (filterEnabled) => {
	const appealTypes = await getAllAppealTypes();

	if (filterEnabled) {
		const enabledAppealTypes = getEnabledAppealTypes();

		return appealTypes.filter((appealType) => {
			return enabledAppealTypes.includes(appealType.key);
		}, []);
	}

	return appealTypes;
};

export { getAppealTypesReq };
