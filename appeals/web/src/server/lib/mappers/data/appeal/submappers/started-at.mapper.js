import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapStartedAt = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	if (
		appealDetails.startedAt &&
		appealDetails.documentationSummary?.lpaQuestionnaire?.status === 'not_received'
	) {
		return textSummaryListItem({
			id: 'start-case-date',
			text: 'Start date',
			value: dateISOStringToDisplayDate(appealDetails.startedAt, 'Not added'),
			link: `${currentRoute}/start-case/change`,
			editable: Boolean(appealDetails.validAt && userHasUpdateCasePermission),
			classes: 'appeal-start-date',
			actionText: 'Change'
		});
	}

	return textSummaryListItem({
		id: 'start-case-date',
		text: 'Start date',
		value: dateISOStringToDisplayDate(appealDetails.startedAt, 'Not added'),
		link: `${currentRoute}/start-case/add`,
		editable: Boolean(
			appealDetails.validAt && !appealDetails.startedAt && userHasUpdateCasePermission
		),
		classes: 'appeal-start-date',
		actionText: 'Add'
	});
};
