import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { dateIsInThePast, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { statementAndCommentsSharePage, finalCommentsSharePage } from './representations.mapper.js';
import { publishRepresentations } from './representations.service.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';

/** @type {import('@pins/express').RequestHandler<{}>} */
export function renderShareRepresentations(request, response) {
	const { errors, currentAppeal } = request;

	const pageContent = (() => {
		switch (currentAppeal.appealStatus) {
			case APPEAL_CASE_STATUS.STATEMENTS:
				return statementAndCommentsSharePage(
					currentAppeal,
					request,
					getBackLinkUrlFromQuery(request)
				);
			case APPEAL_CASE_STATUS.FINAL_COMMENTS: {
				const finalCommentsDueDate = currentAppeal.appealTimetable?.finalCommentsDueDate;
				if (
					!finalCommentsDueDate ||
					!dateIsInThePast(dateISOStringToDayMonthYearHourMinute(finalCommentsDueDate))
				) {
					throw new Error('Final comments cannot be shared before the due date has passed');
				}

				return finalCommentsSharePage(currentAppeal, request, getBackLinkUrlFromQuery(request));
			}
			default:
				throw new Error(
					`Cannot render share/progress page while in the ${currentAppeal.appealStatus} state`
				);
		}
	})();

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		errors,
		pageContent
	});
}

/** @type {import('@pins/express').RequestHandler<{}>} */
export async function postShareRepresentations(request, response) {
	const { apiClient, currentAppeal, session } = request;

	const publishedReps = await publishRepresentations(apiClient, currentAppeal.appealId);

	const bannerDefinitionKey = (() => {
		switch (currentAppeal.appealStatus) {
			case APPEAL_CASE_STATUS.STATEMENTS:
				if (publishedReps.length === 0 && currentAppeal.procedureType === 'Hearing') {
					return 'progressedToHearingReadyToSetUp';
				} else if (publishedReps.length > 0) {
					return 'commentsAndLpaStatementShared';
				} else {
					return 'progressedToFinalComments';
				}
			case APPEAL_CASE_STATUS.FINAL_COMMENTS:
				return publishedReps.filter(
					(rep) =>
						rep.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT ||
						rep.representationType === APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
				).length > 0
					? 'finalCommentsShared'
					: 'caseProgressed';
		}
	})();

	if (bannerDefinitionKey) {
		addNotificationBannerToSession({
			session,
			bannerDefinitionKey,
			appealId: currentAppeal.appealId
		});
	}

	return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
}
