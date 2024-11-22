import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_APPLICATION_DECISION } from 'pins-data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationDecision = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const value = (() => {
		switch (appellantCaseData.applicationDecision) {
			case APPEAL_APPLICATION_DECISION.NOT_RECEIVED:
				return 'Not received';
			case APPEAL_APPLICATION_DECISION.GRANTED:
				return 'Granted with conditions';
			case APPEAL_APPLICATION_DECISION.REFUSED:
				return 'Refused';
			default:
				return '';
		}
	})();

	return textSummaryListItem({
		id: 'application-decision',
		text: 'Application decision outcome',
		value,
		link: `${currentRoute}/application-outcome/change`,
		editable: userHasUpdateCase
	});
};
