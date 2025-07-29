import config from '#environment/config.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapNetResidenceGainOrLoss = ({
	appealDetails,
	appellantCase,
	userHasUpdateCasePermission
}) => {
	const netChange = appellantCase?.numberOfResidencesNetChange;
	const id = 'net-residence-gain-or-loss';

	if (
		netChange == null ||
		netChange === 0 ||
		!config.featureFlags.featureFlagNetResidence ||
		appealDetails.appealType !== APPEAL_TYPE.S78
	) {
		return { id, display: {} };
	}

	let text;
	if (netChange > 0) {
		text = 'Net gain';
	} else {
		text = 'Net loss';
	}

	return textSummaryListItem({
		id,
		text,
		value: netChange == null ? 'Not provided' : Math.abs(netChange).toString(),
		link: `/appeals-service/appeal-details/${appealDetails.appealId}/residential-units/new`,
		editable: userHasUpdateCasePermission,
		actionText: 'Change',
		classes: 'appeal-net-residence-gain-or-loss'
	});
};
