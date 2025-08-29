import { formatListOfNotificationMethodsToHtml } from '#lib/display-page-formatter.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapNotificationMethods = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'notification-methods',
		text: 'How did you notify relevant parties about this application?',
		value: {
			html: formatListOfNotificationMethodsToHtml(lpaQuestionnaireData.lpaNotificationMethods)
		},
		link: `${currentRoute}/notification-methods/change`,
		editable: userHasUpdateCase
	});
