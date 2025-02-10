import { dateIsInThePast, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import logger from '#lib/logger.js';
import { fromFinalCommentsPage } from './from-final-comments.mapper.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderProgressFromFinalComments = async (request, response) => {
	const {
		appealId,
		appealReference,
		appealTimetable: { finalCommentsDueDate },
		documentationSummary
	} = request.currentAppeal;

	const isFinalCommentsDueDatePassed = finalCommentsDueDate
		? dateIsInThePast(dateISOStringToDayMonthYearHourMinute(finalCommentsDueDate))
		: false;
	const hasValidFinalCommentsAppellant =
		documentationSummary.appellantFinalComments?.representationStatus &&
		documentationSummary.appellantFinalComments?.representationStatus === COMMENT_STATUS.VALID
			? true
			: false;
	const hasValidFinalCommentsLPA =
		documentationSummary.lpaFinalComments?.representationStatus &&
		documentationSummary.lpaFinalComments?.representationStatus === COMMENT_STATUS.VALID
			? true
			: false;

	if (!isFinalCommentsDueDatePassed) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = fromFinalCommentsPage(
		appealId,
		appealReference,
		hasValidFinalCommentsAppellant,
		hasValidFinalCommentsLPA
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postProgressFromFinalComments = async (request, response) => {
	try {
		// TODO: Logic for A2-1974
		return response.status(500).render('app/500.njk');
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting progress from final comments'
		);

		return response.status(500).render('app/500.njk');
	}
};
