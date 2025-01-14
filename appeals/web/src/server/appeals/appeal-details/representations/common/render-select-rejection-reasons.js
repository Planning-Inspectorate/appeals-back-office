import { ensureArray } from '#lib/array-utilities.js';
import logger from '#lib/logger.js';
import { getRepresentationRejectionReasonOptions } from '../representations.service.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */
/** @typedef {import("#appeals/appeal-details/representations/types.js").RepresentationRejectionReason} RepresentationRejectionReason */

/**
 * @param {Representation} comment
 * @param {RepresentationRejectionReason[]} rejectionReasonOptions
 * @param {import('@pins/express').Session} session
 * @param {string} sessionKey
 * @param {{ optionId: number, message: string }} [error]
 * @returns {import('#appeals/appeals.types.js').CheckboxItemParameter[]}
 */
function mapRejectionReasonOptionsToCheckboxItemParameters(
	comment,
	rejectionReasonOptions,
	session,
	sessionKey,
	error
) {
	const rejectionReasons = comment.rejectionReasons || [];
	const rejectionReasonMap = new Map(rejectionReasons.map((reason) => [reason.id, reason]));

	const selectedReasons = (() => {
		const value = session[sessionKey]?.rejectionReason;
		if (!value) {
			return [];
		}

		return ensureArray(value);
	})();

	return rejectionReasonOptions.map((reason) => {
		const selectedReason = rejectionReasonMap.get(reason.id);
		const id = reason.id.toString();

		const selectedTextItems = (() => {
			const value = session[sessionKey]?.[`rejectionReason-${reason.id}`];
			if (!value || session[sessionKey]?.commentId !== comment.id) {
				return null;
			}

			return ensureArray(value);
		})();

		return {
			value: id,
			text: reason.name,
			checked:
				error?.optionId === reason.id || Boolean(selectedReason) || selectedReasons.includes(id),
			error: error?.message,
			hasText: reason.hasText,
			textItems: selectedReason?.text || selectedTextItems || ['']
		};
	});
}

/**
 * @param {(appealDetails: Appeal, comment: Representation) => PageContent} contentMapper
 * @param {string} sessionKey
 * @returns {import('express').Handler}
 */
export const renderSelectRejectionReasons =
	(contentMapper, sessionKey) => async (request, response) => {
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
				sessionKey,
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
