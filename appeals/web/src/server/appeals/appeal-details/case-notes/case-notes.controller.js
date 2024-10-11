import { getOriginPathname } from '#lib/url-utilities.js';
import { postAppealCaseNote } from './case-notes.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCaseNote = async (request, response) => {
	const { appealId } = request.params;
	const comment = request.body['comment'];
	const currentUrl = getOriginPathname(request);

	const commentResponse = await postAppealCaseNote(request.apiClient, appealId, comment);

	if (commentResponse) {
		return response.redirect(`${currentUrl}`);
	}

	return response.status(500).render('app/500.njk');
};
