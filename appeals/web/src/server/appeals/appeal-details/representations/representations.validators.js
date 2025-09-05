import { dateIsInThePast, dateISOStringToDayMonthYearHourMinute } from '#lib/dates.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { body } from 'express-validator';

/** @type {import('@pins/express').RequestHandler<{}>} */
export function validateReadyToShare(request, response, next) {
	const { currentAppeal } = request;

	switch (currentAppeal.appealStatus) {
		case APPEAL_REPRESENTATION_STATUS.STATEMENTS: {
			const { representationStatus, status } =
				currentAppeal.documentationSummary?.lpaStatement || {};
			const isValid =
				representationStatus === APPEAL_REPRESENTATION_STATUS.VALID || status === 'not_received';

			if (currentAppeal.appealStatus !== APPEAL_CASE_STATUS.STATEMENTS || !isValid) {
				return response.status(404).render('app/404.njk');
			}

			break;
		}
		case APPEAL_CASE_STATUS.FINAL_COMMENTS: {
			const dueDate = currentAppeal.appealTimetable?.finalCommentsDueDate;
			const dueDatePassed =
				dueDate && dateIsInThePast(dateISOStringToDayMonthYearHourMinute(dueDate));

			if (currentAppeal.appealStatus !== APPEAL_CASE_STATUS.FINAL_COMMENTS || !dueDatePassed) {
				return response.status(404).render('app/404.njk');
			}

			break;
		}
	}

	return next();
}

export const validateRedactionStatus = createValidator(
	body('redactionStatus').exists().withMessage('Select a redaction status')
);
