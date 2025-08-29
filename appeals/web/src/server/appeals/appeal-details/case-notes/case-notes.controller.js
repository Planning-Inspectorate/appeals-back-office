import { viewAppealDetails } from '#appeals/appeal-details/appeal-details.controller.js';
import { getOriginPathname } from '#lib/url-utilities.js';
import { postAppealCaseNote } from './case-notes.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCaseNote = async (request, response) => {
	request.session.comment = request.body['comment'];

	if (request.errors) {
		return viewAppealDetails(request, response);
	}

	const { appealId } = request.params;
	const currentUrl = getOriginPathname(request);

	const commentResponse = await postAppealCaseNote(
		request.apiClient,
		appealId,
		request.session.comment
	);

	if (commentResponse) {
		delete request.session.comment;
		return response.redirect(`${currentUrl}`);
	}

	return response.status(500).render('app/500.njk');
};
