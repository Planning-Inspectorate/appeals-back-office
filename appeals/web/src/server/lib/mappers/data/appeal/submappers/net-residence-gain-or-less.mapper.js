import { isNetResidencesAppealType } from '#common/net-residences-appeal-types.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapNetResidenceGainOrLoss = ({
	appealDetails,
	appellantCase,
	userHasUpdateCasePermission,
	request
}) => {
	const netChange = appellantCase?.numberOfResidencesNetChange;
	const id = 'net-residence-gain-or-loss';

	if (
		netChange == null ||
		netChange === 0 ||
		!isNetResidencesAppealType(appealDetails.appealType)
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
		link: addBackLinkQueryToUrl(
			request,
			`/appeals-service/appeal-details/${appealDetails.appealId}/residential-units/new`
		),
		editable: userHasUpdateCasePermission,
		actionText: 'Change',
		classes: 'appeal-net-residence-gain-or-loss'
	});
};
