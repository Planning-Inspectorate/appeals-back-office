import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';

/** @type {import('@pins/express').RequestHandler<{}>} */
export function validateReadyToShare(request, response, next) {
	const { currentAppeal } = request;

	const statementValid =
		currentAppeal.documentationSummary?.lpaStatement?.representationStatus ===
		APPEAL_REPRESENTATION_STATUS.VALID;

	if (currentAppeal.appealStatus !== APPEAL_CASE_STATUS.STATEMENTS || !statementValid) {
		return response.status(404).render('app/404.njk');
	}

	return next();
}
