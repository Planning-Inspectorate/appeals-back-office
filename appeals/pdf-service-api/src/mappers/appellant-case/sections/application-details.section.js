import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';
import { formatSentenceCase, formatYesNo } from '../../../lib/nunjucks-filters/index.js';

export function applicationDetailsSection(templateData) {
	const { applicationDate, developmentDescription, otherAppeals, developmentType } = templateData;

	return {
		heading: 'Application details',
		items: [
			{ key: 'What date did you submit your application?', text: formatDate(applicationDate) },
			{
				key: 'Enter the description of development that you submitted in your application',
				text: formatSentenceCase(developmentDescription?.details)
			},
			{
				key: 'Are there other appeals linked to your development?',
				text: formatYesNo(otherAppeals?.length > 0)
			},
			{ key: 'Development type', text: formatSentenceCase(developmentType, 'Not provided') }
		]
	};
}
