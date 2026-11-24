import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { changeStatusPage } from './change-status.mapper.js';
import { updateAppealStatus } from './change-status.service.js';

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeStatus = async (request, response) => {
	const { currentAppeal } = request;

	if (
		!currentAppeal ||
		!isGenericAppealType(currentAppeal.appealType) ||
		!currentAppeal.startedAt
	) {
		return response.status(404).render('app/404.njk');
	}

	const backLinkUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}`;
	const pageContent = changeStatusPage(
		currentAppeal,
		backLinkUrl,
		currentAppeal.appealStatus,
		undefined
	);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent,
		errors: request.errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeStatus = async (request, response) => {
	const {
		currentAppeal,
		body: { status },
		errors,
		apiClient,
		session
	} = request;

	if (
		!currentAppeal ||
		!isGenericAppealType(currentAppeal.appealType) ||
		!currentAppeal.startedAt
	) {
		return response.status(404).render('app/404.njk');
	}

	const backLinkUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}`;

	if (errors) {
		const pageContent = changeStatusPage(currentAppeal, backLinkUrl, status, errors['status']?.msg);
		return response.render('patterns/change-page.pattern.njk', {
			pageContent,
			errors
		});
	}

	try {
		await updateAppealStatus(apiClient, currentAppeal.appealId, status);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'appealStatusUpdated',
			appealId: currentAppeal.appealId
		});

		return response.redirect(backLinkUrl);
	} catch (error) {
		logger.error(error);
		const pageContent = changeStatusPage(
			currentAppeal,
			backLinkUrl,
			status,
			'Failed to update appeal status'
		);
		return response.render('patterns/change-page.pattern.njk', {
			pageContent,
			errors: { status: { msg: 'Failed to update appeal status' } }
		});
	}
};
