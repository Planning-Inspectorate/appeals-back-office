import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapNetResidenceChange = ({
	appealDetails,
	appellantCase,
	userHasUpdateCasePermission
}) => {
	const netChange = appellantCase?.numberOfResidencesNetChange;

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
		id: 'net-residence-change',
		text: 'Is there a net gain or loss of residential units?',
		value,
		link: `/appeals-service/appeal-details/${appealDetails.appealId}/residential-units/new`,
		editable: userHasUpdateCasePermission,
		actionText: netChange != null ? 'Change' : 'Add'
	});
};
