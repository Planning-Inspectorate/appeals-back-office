import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { formatDocumentData, formatList } from '../../../../lib/nunjucks-filters/index.js';

export function notifyingRelevantPartiesSection(templateData) {
	if (templateData.appealType === APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE) return;

	const { lpaNotificationMethods } = templateData;

	const {
		whoNotified,
		whoNotifiedSiteNotice,
		whoNotifiedLetterToNeighbours,
		whoNotifiedPressAdvert,
		appealNotification
	} = templateData.documents || {};

	return {
		heading: 'Notifying relevant parties',
		items: [
			{
				key: 'Who did you notify about this application?',
				html: formatDocumentData(whoNotified)
			},
			{
				key: 'How did you notify relevant parties about this application?',
				html: formatList(
					lpaNotificationMethods.map((item) => item.name || 'Unknown'),
					'Not specified'
				)
			},
			{
				key: 'Site notice',
				html: formatDocumentData(whoNotifiedSiteNotice)
			},
			{
				key: 'Letter or email notification',
				html: formatDocumentData(whoNotifiedLetterToNeighbours)
			},
			{
				key: 'Press advertisement',
				html: formatDocumentData(whoNotifiedPressAdvert)
			},
			{
				key: 'Appeal notification letter',
				html: formatDocumentData(appealNotification)
			}
		]
	};
}
