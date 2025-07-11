import { formatSentenceCase, formatYesNo } from '../../../lib/nunjucks-filters/index.js';
import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';

export function applicationDetailsSection(templateData) {
	const {
		localPlanningDepartment,
		planningApplicationReference,
		applicationDate,
		developmentDescription,
		otherAppeals,
		applicationDecision,
		applicationDecisionDate,
		developmentType
	} = templateData;

	return {
		heading: 'Application details',
		items: [
			{
				key: 'Which local planning authority (LPA) do you want to appeal against?',
				html: formatSentenceCase(localPlanningDepartment, 'Not provided')
			},
			{ key: 'What is the application reference number?', text: planningApplicationReference },
			{ key: 'What date did you submit your application?', text: formatDate(applicationDate) },
			{
				key: 'Enter the description of development that you submitted in your application',
				text: formatSentenceCase(developmentDescription?.details)
			},
			{
				key: 'Are there other appeals linked to your development?',
				text: formatYesNo(otherAppeals?.length > 0)
			},
			{
				key: 'Was your application granted or refused?',
				text: formatSentenceCase(applicationDecision)
			},
			{
				key: 'What’s the date on the decision letter from the local planning authority?',
				text: formatDate(applicationDecisionDate)
			},
			{ key: 'Development type', text: formatSentenceCase(developmentType, 'Not provided') }
		]
	};
}
