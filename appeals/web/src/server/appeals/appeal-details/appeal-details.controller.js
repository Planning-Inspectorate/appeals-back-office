import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { appealDetailsPage } from './appeal-details.mapper.js';
import { getAppealCaseNotes } from './case-notes/case-notes.service.js';
import { getSingularRepresentationByType } from './representations/representations.service.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { getAppellantCaseFromAppealId } from './appellant-case/appellant-case.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewAppealDetails = async (request, response) => {
	const { errors, session, currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}
	session.currentAppeal = currentAppeal;
	delete session.reviewOutcome;

	const appealCaseNotes = await getAppealCaseNotes(
		request.apiClient,
		currentAppeal.appealId.toString()
	);

	let appellantFinalComments, lpaFinalComments;

	if (currentAppeal.appealType === APPEAL_TYPE.S78) {
		[appellantFinalComments, lpaFinalComments] = await Promise.all([
			getSingularRepresentationByType(
				request.apiClient,
				currentAppeal.appealId.toString(),
				APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
			),
			getSingularRepresentationByType(
				request.apiClient,
				currentAppeal.appealId.toString(),
				APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
			)
		]);
	}

	const appellantCase = await getAppellantCaseFromAppealId(
		request.apiClient,
		currentAppeal.appealId,
		currentAppeal.appellantCaseId
	);

	// Remove redundant slash at the end of the url if it exists to prevent a double slash when creating links
	const currentUrl = request.originalUrl.endsWith('/')
		? request.originalUrl.slice(0, -1)
		: request.originalUrl;

	const mappedPageContent = await appealDetailsPage(
		currentAppeal,
		appealCaseNotes,
		currentUrl,
		session,
		request,
		appellantFinalComments,
		lpaFinalComments,
		appellantCase
	);

	mappedPageContent.pageComponents = mappedPageContent.pageComponents || [];

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: { ...mappedPageContent, currentAppeal },
		errors
	});
};
