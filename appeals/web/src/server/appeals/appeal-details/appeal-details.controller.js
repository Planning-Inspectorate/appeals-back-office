import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { appealDetailsPage } from './appeal-details.mapper.js';
import { getAppealCaseNotes } from './case-notes/case-notes.service.js';
import { getSingularRepresentationByType } from './representations/representations.service.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewAppealDetails = async (request, response) => {
	const { errors, session, currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

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

	const mappedPageContent = await appealDetailsPage(
		currentAppeal,
		appealCaseNotes,
		request.originalUrl,
		session,
		request,
		appellantFinalComments,
		lpaFinalComments
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
