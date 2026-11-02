import {
	APPEAL_APPLICATION_DECISION,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import { formatDate } from '../../../../lib/nunjucks-filters/format-date.js';
import { formatSentenceCase, formatYesNo } from '../../../../lib/nunjucks-filters/index.js';

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

function formatApplicationDecision(applicationDecision) {
	switch (applicationDecision) {
		case APPEAL_APPLICATION_DECISION.NOT_RECEIVED:
			return 'I have not received a decision';
		case APPEAL_APPLICATION_DECISION.GRANTED:
			return 'Granted with conditions';
		case APPEAL_APPLICATION_DECISION.REFUSED:
			return 'Refused';
		default:
			return 'Not answered';
	}
}

export const rowBuilders = {
	localPlanningAuthority: (data) => ({
		key: 'Local planning authority',
		html: formatSentenceCase(data.localPlanningDepartment, 'Not provided')
	}),
	typeOfApplication: (data) => ({
		key: 'What type of application is your appeal about?',
		text: formatApplicationType(data.typeOfPlanningApplication)
	}),
	applicationDecision: (data) => ({
		key: 'Was your application granted or refused?',
		text: formatApplicationDecision(data.applicationDecision)
	}),
	applicationDecisionDate: (data) => ({
		key:
			data.applicationDecision === APPEAL_APPLICATION_DECISION.NOT_RECEIVED
				? 'What date was your decision due from the local planning authority?'
				: 'What’s the date on the decision letter from the local planning authority?',
		text: data.applicationDecisionDate ? formatDate(data.applicationDecisionDate) : 'No data'
	}),
	appellantCostsAppliedFor: (data) => ({
		key: 'Are you claiming costs as part of your appeal?',
		text: formatYesNo(data.appellantCostsAppliedFor)
	}),
	applicationReferenceNumber: (data) => ({
		key: 'What is the application reference number?',
		text: data.planningApplicationReference
	})
};
