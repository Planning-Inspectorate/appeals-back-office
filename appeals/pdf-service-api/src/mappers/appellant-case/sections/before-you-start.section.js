import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';
import { formatSentenceCase, formatYesNo } from '../../../lib/nunjucks-filters/index.js';

export function beforeYouStartSection(templateData) {
	const {
		localPlanningDepartment,
		planningApplicationReference,
		applicationDate,
		appealType,
		appellantCostsAppliedFor,
		applicationDecision,
		applicationDecisionDate
	} = templateData;

	return {
		heading: 'Before you start',
		items: [
			{
				key: 'Local planning authority',
				html: formatSentenceCase(localPlanningDepartment, 'Not provided')
			},
			{
				key: 'What type of application is your appeal about?',
				text: formatSentenceCase(appealType, 'Not provided')
			},
			{
				key: 'Was your application granted or refused?',
				text: formatSentenceCase(applicationDecision)
			},
			{
				key: 'What’s the date on the decision letter from the local planning authority?',
				text: formatDate(applicationDecisionDate)
			},
			{
				key: 'Are you claiming costs as part of your appeal?',
				text: formatYesNo(appellantCostsAppliedFor)
			},
			{ key: 'What is the application reference number?', text: planningApplicationReference },
			{ key: 'What date did you submit your application?', text: formatDate(applicationDate) }
		]
	};
}
