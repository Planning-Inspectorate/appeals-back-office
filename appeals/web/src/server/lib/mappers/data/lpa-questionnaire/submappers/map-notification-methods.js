import { textSummaryListItem } from '#lib/mappers/index.js';
import { formatListOfNotificationMethodsToHtml } from '#lib/display-page-formatter.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapNotificationMethods = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'notification-methods',
		text: 'Notification methods',
		value: {
			html: formatListOfNotificationMethodsToHtml(lpaQuestionnaireData.lpaNotificationMethods)
		},
		link: `${currentRoute}/notification-methods/change`,
		editable: userHasUpdateCase
	});