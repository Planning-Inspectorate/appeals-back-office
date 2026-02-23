import featureFlags from '#common/feature-flags.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
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
	const { currentAppeal } = request;

	if (request.errors) {
		return renderCancelAppealPage(request, response);
	}

	const cancelReason = request.body['cancelReasonRadio'];

	const baseUrl = `/appeals-service/appeal-details/${request.currentAppeal.appealId}`;
	const invalidFlowEntrypoint =
		currentAppeal.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE &&
		featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_CANCEL)
			? `${baseUrl}/cancel/enforcement/invalid`
			: `${baseUrl}/invalid/new`;

	switch (cancelReason) {
		case CANCEL_REASON.INVALID:
			return response.redirect(invalidFlowEntrypoint);
		case CANCEL_REASON.WITHDRAWAL:
			return response.redirect(`${baseUrl}/withdrawal/new`);
		case CANCEL_REASON.ENFORCEMENT_NOTICE_WITHDRAWN:
			return response.redirect(`${baseUrl}/cancel/enforcement-notice-withdrawal`);
		case CANCEL_REASON.DID_NOT_PAY:
			return response.redirect(`${baseUrl}/cancel/check-details`);
		default:
			return response.status(500).render('app/500.njk');
	}
};

const CANCEL_REASON = {
	INVALID: 'invalid',
	WITHDRAWAL: 'withdrawal',
	ENFORCEMENT_NOTICE_WITHDRAWN: 'enforcement-notice-withdrawn',
	DID_NOT_PAY: 'did-not-pay'
};
