import { formatAppellantCase } from '#endpoints/appellant-cases/appellant-cases.formatter.js';
import { formatLpaQuestionnaire } from '#endpoints/lpa-questionnaires/lpa-questionnaires.formatter.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} SingleLPAQuestionnaireResponse */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse */

/**
 * @param {Appeal} appeal
 * @returns {SingleLPAQuestionnaireResponse}
 */
export const baseExpectedLPAQuestionnaireResponse = (appeal) => ({
	...formatLpaQuestionnaire(appeal),
	documents: {
		// @ts-ignore
		whoNotified: {},
		// @ts-ignore
		whoNotifiedSiteNotice: {},
		// @ts-ignore
		whoNotifiedLetterToNeighbours: {},
		// @ts-ignore
		whoNotifiedPressAdvert: {},
		// @ts-ignore
		conservationMap: {},
		// @ts-ignore
		lpaCaseCorrespondence: {},
		// @ts-ignore
		otherPartyRepresentations: {},
		// @ts-ignore
		planningOfficerReport: {}
	}
});

/**
 *
 * @param {Appeal} appeal
 * @returns
 */
export const baseExpectedAppellantCaseResponse = (appeal) => {
	return {
		...formatAppellantCase(appeal),
		documents: {
			appellantCaseCorrespondence: {},
			appellantCaseWithdrawalLetter: {},
			appellantStatement: {},
			applicationDecisionLetter: {},
			changedDescription: {},
			originalApplicationForm: {}
		}
	};
};
