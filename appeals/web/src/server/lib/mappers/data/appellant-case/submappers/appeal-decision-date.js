import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealDecisionDate = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'appeal-decision-date',
		text: 'When was the appeal decision?',
		value: dateISOStringToDisplayDate(
			appellantCaseData.enforcementNotice?.appealDecisionDate,
			'No data'
		),
		link: `${currentRoute}/appeal-decision-date/change`,
		editable: userHasUpdateCase
	});
