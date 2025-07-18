import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import config from '#environment/config.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapStartedAt = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const id = 'start-case-date';
	if (!appealDetails.validAt) {
		return { id, display: {} };
	}

	const isChildAppeal = appealDetails.isChildAppeal && config.featureFlags.featureFlagLinkedAppeals;

	return textSummaryListItem({
		id,
		text: 'Start date',
		value: dateISOStringToDisplayDate(appealDetails.startedAt, 'Not started'),
		link: appealDetails.startedAt
			? `${currentRoute}/start-case/change`
			: `${currentRoute}/start-case/add?backUrl=${currentRoute}`,
		editable: !isChildAppeal && Boolean(userHasUpdateCasePermission),
		classes: 'appeal-start-date',
		actionText:
			appealDetails.documentationSummary.lpaQuestionnaire?.status !== 'not_received'
				? ''
				: appealDetails.startedAt
				? 'Change'
				: 'Start'
	});
};
