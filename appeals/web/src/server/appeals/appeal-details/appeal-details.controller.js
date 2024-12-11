import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import { appealDetailsPage } from './appeal-details.mapper.js';
import { getAppealCaseNotes } from './case-notes/case-notes.service.js';
import { getRepresentationCounts } from './representations/representations.service.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const viewAppealDetails = async (request, response) => {
	const appealDetails = request.currentAppeal;
	const session = request.session;
	const { errors } = request;
	try {
		if (!appealDetails) {
			return response.status(404).render('app/404.njk');
		}

		let unreviewedIPComments;
		if (appealDetails.appealType === APPEAL_TYPE.W) {
			const counts = await getRepresentationCounts(
				request.apiClient,
				appealDetails.appealId.toString(),
				APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
			);
			unreviewedIPComments = counts[APPEAL_REPRESENTATION_TYPE.COMMENT];
		}

		const appealCaseNotes = await getAppealCaseNotes(
			request.apiClient,
			appealDetails.appealId.toString()
		);

		const currentUrl = request.originalUrl;
		const mappedPageContent = await appealDetailsPage(
			appealDetails,
			appealCaseNotes,
			currentUrl,
			session,
			request,
			!!unreviewedIPComments && unreviewedIPComments > 0
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} catch (error) {
		console.log('🚀 ~ viewAppealDetails ~ error:', error);
		return response.status(500).render('app/500.njk');
	}
};
