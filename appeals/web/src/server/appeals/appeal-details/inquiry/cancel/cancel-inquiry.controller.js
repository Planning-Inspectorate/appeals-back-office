import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { logger } from '@azure/storage-blob';
import { cancelInquiryPage } from './cancel-inquiry.mapper.js';
import { cancelInquiry } from './cancel-inquiry.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCancelInquiry = async (request, response) => {
	const mappedPageContent = cancelInquiryPage(request.currentAppeal);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCancelInquiry = async (request, response) => {
	const {
		currentAppeal: { appealId, inquiry }
	} = request;

	try {
		await cancelInquiry(request, inquiry.inquiryId);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'inquiryCancelled',
			appealId
		});

		delete request.session.setUpInquiry;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
