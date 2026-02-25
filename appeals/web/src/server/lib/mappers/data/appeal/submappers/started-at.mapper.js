import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import {
	canStartAppeal,
	isAwaitingLinkedAppeal,
	isChildAppeal
} from '#lib/mappers/utils/is-linked-appeal.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapStartedAt = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const id = 'start-case-date';
	if (!appealDetails.validAt) {
		return { id, display: {} };
	}

	const lpaQuestionnaireStatus = appealDetails.documentationSummary.lpaQuestionnaire?.status || '';

	const awaitingLinkedAppeal = isAwaitingLinkedAppeal(appealDetails);

	return textSummaryListItem({
		id,
		text: 'Start date',
		value: dateISOStringToDisplayDate(appealDetails.startedAt, 'Not started'),
		link: appealDetails.startedAt
			? `${currentRoute}/start-case/change`
			: `${currentRoute}/start-case/add?backUrl=${currentRoute}`,
		editable:
			!isChildAppeal(appealDetails) &&
			Boolean(userHasUpdateCasePermission) &&
			['not_received', 'received'].includes(lpaQuestionnaireStatus) &&
			!awaitingLinkedAppeal,
		classes: 'appeal-start-date',
		actionText: appealDetails.startedAt ? 'Change' : canStartAppeal(appealDetails) ? 'Start' : ''
	});
};
