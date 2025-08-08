import { mapCancelAppealPage } from './cancel.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCancelAppealPage = async (request, response) => {
	return renderCancelAppealPage(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCancelAppealPage = async (request, response) => {
	const { errors, currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	const appealId = currentAppeal.appealId;
	const mappedPageContent = mapCancelAppealPage(
		currentAppeal,
		errors ? errors['cancelReasonRadio'].msg : undefined
	);

	if (!appealId || !mappedPageContent) {
		return response.status(500).render('app/500.njk');
	}

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCancelAppeal = async (request, response) => {
	if (request.errors) {
		return renderCancelAppealPage(request, response);
	}

	const cancelReason = request.body['cancelReasonRadio'];

	if (cancelReason === CANCEL_REASON.INVALID) {
		return response.redirect(
			`/appeals-service/appeal-details/${request.currentAppeal.appealId}/invalid/new`
		);
	} else if (cancelReason === CANCEL_REASON.WITHDRAWAL) {
		return response.redirect(
			`/appeals-service/appeal-details/${request.currentAppeal.appealId}/withdrawal/new`
		);
	}

	return response.status(500).render('app/500.njk');
};

const CANCEL_REASON = {
	INVALID: 'invalid',
	WITHDRAWAL: 'withdrawal'
};
