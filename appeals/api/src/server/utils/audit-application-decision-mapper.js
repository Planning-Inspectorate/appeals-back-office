import { APPEAL_APPLICATION_DECISION } from 'pins-data-model';

/**
 *
 * @param {string} applicationDecision
 * @returns {string}
 */
const auditApplicationDecisionMapper = (applicationDecision) => {
	switch (applicationDecision) {
		case APPEAL_APPLICATION_DECISION.GRANTED:
			return 'Granted with conditions';
		case APPEAL_APPLICATION_DECISION.REFUSED:
			return 'Refused';
		case APPEAL_APPLICATION_DECISION.NOT_RECEIVED:
			return 'Not Received';
		default:
			return '';
	}
};

export default auditApplicationDecisionMapper;
