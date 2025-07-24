import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapNetResidenceGainOrLoss = ({
	appealDetails,
	appellantCase,
	userHasUpdateCasePermission
}) => {
	const netChange = appellantCase?.numberOfResidencesNetChange;

	let text;
	if (netChange == null) {
		text = 'Not provided';
	} else if (netChange > 0) {
		text = 'Net gain';
	} else {
		text = 'Net loss';
	}

	return textSummaryListItem({
		id: 'net-residence-gain-or-loss',
		text,
		value: netChange == null ? 'Not provided' : netChange.toString(),
		link: `/appeals-service/appeal-details/${appealDetails.appealId}/residential-units/new`,
		editable: userHasUpdateCasePermission,
		actionText: netChange != null ? 'Change' : 'Add'
	});
};
