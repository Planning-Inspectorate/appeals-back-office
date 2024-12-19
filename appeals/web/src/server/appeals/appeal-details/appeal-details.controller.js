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
	const { errors, session, currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	try {
		/** @type {import('./accordions/index.js').RepresentationTypesAwaitingReview} */
    const representationTypesAwaitingReview = await (async () => {
      if (currentAppeal.appealType !== APPEAL_TYPE.W) {
        return {
          ipComments: false,
          appellantFinalComments: false,
          lpaFinalComments: false,
        };
      }

      const counts = await getRepresentationCounts(
        request.apiClient,
        currentAppeal.appealId.toString(),
        APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
      );

      return {
        ipComments: counts[APPEAL_REPRESENTATION_TYPE.COMMENT] > 0,
        appellantFinalComments: counts[APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT] > 0,
        lpaFinalComments: counts[APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT] > 0,
      };
    })();

		const appealCaseNotes = await getAppealCaseNotes(
			request.apiClient,
			currentAppeal.appealId.toString()
		);

		const currentUrl = request.originalUrl;
		const mappedPageContent = await appealDetailsPage(
			currentAppeal,
			appealCaseNotes,
			currentUrl,
			session,
			request,
			representationTypesAwaitingReview
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} catch (error) {
		return response.status(500).render('app/500.njk');
	}
};
