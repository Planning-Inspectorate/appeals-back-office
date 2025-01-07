import { mapRejectionReasonOptionsToCheckboxItemParameters } from '#appeals/appeal-details/interested-party-comments/view-and-review/page-components/reject.mapper.js';
import logger from '#lib/logger.js';
import { getRepresentationRejectionReasonOptions } from '../representations.service.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {(appealDetails: Appeal, comment: Representation) => PageContent} contentMapper
 * @returns {import('express').Handler}
 */
export const renderSelectRejectionReasons = (contentMapper) => async (request, response) => {
	const { currentAppeal, currentRepresentation, apiClient, session, errors } = request;

	try {
		const rejectionReasons = await getRepresentationRejectionReasonOptions(
			apiClient,
			currentRepresentation.representationType
		);

		const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
			currentRepresentation,
			rejectionReasons,
			session,
			errors?.['']
				? { optionId: parseInt(errors[''].value.rejectionReason), message: errors[''].msg }
				: undefined
		);

		const pageContent = contentMapper(currentAppeal, currentRepresentation);

		return response.status(200).render('appeals/appeal/reject-representation.njk', {
			errors,
			pageContent,
			rejectionReasons: mappedRejectionReasons
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
