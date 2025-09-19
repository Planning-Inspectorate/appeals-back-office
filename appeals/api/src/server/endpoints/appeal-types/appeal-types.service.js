import { getAllAppealTypes } from '#repositories/appeal-type.repository.js';
import { filterEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';

/**
 *
 * @param {boolean} filterEnabled
 */
const getAppealTypesReq = async (filterEnabled) => {
	const appealTypes = await getAllAppealTypes();

	if (filterEnabled) {
		return filterEnabledAppealTypes(appealTypes);
	}

	return appealTypes;
};

export { getAppealTypesReq };
