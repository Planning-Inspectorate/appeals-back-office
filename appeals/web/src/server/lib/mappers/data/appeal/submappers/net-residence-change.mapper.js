import config from '#environment/config.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapNetResidenceChange = ({
	appealDetails,
	appellantCase,
	userHasUpdateCasePermission,
	request
}) => {
	const netChange = appellantCase?.numberOfResidencesNetChange;
	const id = 'net-residence-change';

	if (
		!config.featureFlags.featureFlagNetResidence ||
		appealDetails.appealType !== APPEAL_TYPE.S78
	) {
		return { id, display: {} };
	}

	let value;
	if (netChange == null) {
		value = 'Not provided';
	} else if (netChange === 0) {
		value = 'No change to number of residential units';
	} else if (netChange > 0) {
		value = 'Net gain';
	} else {
		value = 'Net loss';
	}

	return textSummaryListItem({
		id,
		text: 'Is there a net gain or loss of residential units?',
		value,
		link: addBackLinkQueryToUrl(
			request,
			`/appeals-service/appeal-details/${appealDetails.appealId}/residential-units/new`
		),
		editable: userHasUpdateCasePermission,
		actionText: netChange != null ? 'Change' : 'Add',
		classes: 'appeal-net-residence-change'
	});
};
