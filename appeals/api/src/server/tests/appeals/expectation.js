import { formatAppellantCase } from '#endpoints/appellant-cases/appellant-cases.formatter.js';
import { formatLpaQuestionnaire } from '#endpoints/lpa-questionnaires/lpa-questionnaires.formatter.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} SingleLPAQuestionnaireResponse */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse */

/**
 * @param {Appeal} appeal
 * @returns {SingleLPAQuestionnaireResponse}
 */
// @ts-ignore
export const baseExpectedLPAQuestionnaireResponse = (appeal) => ({
	...formatLpaQuestionnaire(appeal), // TODO (A2-770): refactor to avoid using formatter function)
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
		planningOfficerReport: {},
		// @ts-ignore
		plansDrawings: {},
		// @ts-ignore
		developmentPlanPolicies: {}
	}
});

/**
 *
 * @param {Appeal} appeal
 * @returns
 */
export const baseExpectedAppellantCaseResponse = (appeal) => {
	return {
		...formatAppellantCase(appeal), // TODO (A2-770): refactor to avoid using formatter function)
		documents: {
			appellantCaseCorrespondence: {},
			appellantCaseWithdrawalLetter: {},
			appellantStatement: {},
			applicationDecisionLetter: {},
			changedDescription: {},
			designAccessStatement: {},
			newPlansDrawings: {},
			originalApplicationForm: {},
			ownershipCertificate: {},
			planningObligation: {},
			plansDrawings: {},
			otherNewDocuments: {}
		}
	};
};
