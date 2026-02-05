import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_APPLICATION_DECISION } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationDecision = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const value = (() => {
		switch (appellantCaseData.applicationDecision) {
			case APPEAL_APPLICATION_DECISION.NOT_RECEIVED:
				return 'I have not received a decision';
			case APPEAL_APPLICATION_DECISION.GRANTED:
				return 'Granted with conditions';
			case APPEAL_APPLICATION_DECISION.REFUSED:
				return 'Refused';
			default:
				return 'Not answered';
		}
	})();

	return textSummaryListItem({
		id: 'application-decision',
		text: 'Was your application granted or refused?',
		value,
		link: `${currentRoute}/application-outcome/change`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild
	});
};
