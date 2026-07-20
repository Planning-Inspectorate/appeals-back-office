import { getSavedBackUrl } from '#lib/middleware/save-back-url.js';
import { stripQueryString } from '#lib/url-utilities.js';

import { appealDetailsPage } from './appeal-details.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewAppealDetails = async (request, response) => {
	const { errors, session, currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}
	delete session.reviewOutcome;
	delete session.changeAppealType;

	const appealCaseNotes = currentAppeal.caseNotes || [];
	const appellantCase = currentAppeal.appellantCase || null;
	const backLinkUrl = getSavedBackUrl(request, 'appeals-detail') || '';

	// Remove redundant slash at the end of the url if it exists to prevent a double slash when creating links
	const currentUrl = request.originalUrl.endsWith('/')
		? request.originalUrl.slice(0, -1)
		: request.originalUrl;
	const documentationSummary = currentAppeal?.documentationSummary || {};

	let appellantFinalComments, lpaFinalComments, appellantProofOfEvidence, lpaProofOfEvidence;

	appellantFinalComments = documentationSummary.appellantFinalComments;
	lpaFinalComments = documentationSummary.lpaFinalComments;
	appellantProofOfEvidence = documentationSummary.appellantProofOfEvidence;
	lpaProofOfEvidence = documentationSummary.lpaProofOfEvidence;

	const mappedPageContent = await appealDetailsPage(
		currentAppeal,
		appealCaseNotes,
		stripQueryString(currentUrl),
		session,
		request,
		appellantFinalComments,
		lpaFinalComments,
		appellantCase,
		appellantProofOfEvidence,
		lpaProofOfEvidence,
		backLinkUrl
	);

	mappedPageContent.pageComponents = mappedPageContent.pageComponents || [];

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: { ...mappedPageContent, currentAppeal },
		errors
	});
};
