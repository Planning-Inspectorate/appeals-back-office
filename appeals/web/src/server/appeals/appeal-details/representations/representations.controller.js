import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { statementAndCommentsSharePage } from './representations.mapper.js';
import { publishRepresentations } from './representations.service.js';

/** @type {import('@pins/express').RequestHandler<{}>} */
export function renderShareRepresentations(request, response) {
	const { errors, currentAppeal } = request;

	const pageContent = statementAndCommentsSharePage(currentAppeal);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		errors,
		pageContent
	});
}

/** @type {import('@pins/express').RequestHandler<{}>} */
export async function postShareRepresentations(request, response) {
	const { apiClient, currentAppeal, session } = request;

	const publishedReps = await publishRepresentations(
		apiClient,
		currentAppeal.appealId,
		'lpa_statement'
	);

	addNotificationBannerToSession(
		session,
		publishedReps.length > 0 ? 'commentsAndLpaStatementShared' : 'progressedToFinalComments',
		currentAppeal.appealId
	);

	return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
}
