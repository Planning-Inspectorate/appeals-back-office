import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';

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
			const { lpaFinalComments, appellantFinalComments } = currentAppeal.documentationSummary ?? {};

			const lpaValid =
				lpaFinalComments?.representationStatus === APPEAL_REPRESENTATION_STATUS.VALID ||
				lpaFinalComments?.status === 'not_received';
			const appellantValid =
				appellantFinalComments?.representationStatus === APPEAL_REPRESENTATION_STATUS.VALID ||
				appellantFinalComments?.status === 'not_received';

			if (
				currentAppeal.appealStatus !== APPEAL_CASE_STATUS.FINAL_COMMENTS ||
				!(lpaValid || appellantValid)
			) {
				return response.status(404).render('app/404.njk');
			}
		}
	}

	return next();
}

export const validateRedactionStatus = createValidator(
	body('redactionStatus').exists().withMessage('Select a redaction status')
);
