import { APPEAL_TYPE_OF_PLANNING_APPLICATION } from '@planning-inspectorate/data-model';
import { formatDate } from '../../../lib/nunjucks-filters/format-date.js';
import { formatSentenceCase } from '../../../lib/nunjucks-filters/index.js';

/**
 * @param {string | null | undefined } typeOfPlanningApplication
 * @returns {string}
 */
function formatApplicationType(typeOfPlanningApplication) {
	if (!typeOfPlanningApplication) {
		return 'Not provided';
	}
	switch (typeOfPlanningApplication) {
		// note: although the constant refers to 'FULL_APPEAL'
		// we are actually referring to the original planning application here
		case APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL:
			return 'Full planning';
		case APPEAL_TYPE_OF_PLANNING_APPLICATION.ADVERTISEMENT:
			return 'Displaying an advertisement';
		default:
			return formatSentenceCase(typeOfPlanningApplication, 'Not provided');
	}
}

export function beforeYouStartSection(templateData) {
	const {
		localPlanningDepartment,
		planningApplicationReference,
		applicationDecision,
		applicationDecisionDate,
		typeOfPlanningApplication
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
				text: formatApplicationType(typeOfPlanningApplication)
			},
			{
				key: 'Was your application granted or refused?',
				text: formatSentenceCase(applicationDecision)
			},
			{
				key: 'What’s the date on the decision letter from the local planning authority?',
				text: formatDate(applicationDecisionDate)
			},
			// Being removed from BYS in BO
			// {
			// 	key: 'Are you claiming costs as part of your appeal?',
			// 	text: formatYesNo(appellantCostsAppliedFor)
			// },
			{ key: 'What is the application reference number?', text: planningApplicationReference }
		]
	};
}
