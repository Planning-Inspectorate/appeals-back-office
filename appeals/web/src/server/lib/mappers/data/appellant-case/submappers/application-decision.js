import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_APPLICATION_DECISION } from 'pins-data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationDecision = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'application-decision',
		text: 'Outcome',
		value: (() => {
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
		})(),
		link: `${currentRoute}/application-outcome/change`,
		editable: userHasUpdateCase
	});
