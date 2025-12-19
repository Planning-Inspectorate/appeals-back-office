import {
	getAllRepresentationsByType,
	getSingularRepresentationByType
} from './representations.service.js';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').AppealRule6Party} AppealRule6Party */
/** @typedef {import('./types.js').Representation} Representation */

/**
 * @param {string} type
 * @returns {import('express').RequestHandler}
 */
export const withSingularRepresentation = (type) => async (req, res, next) => {
	const { appealId } = req.params;
	const rule6PartyId = req.params.rule6PartyId;

	const numericAppealId = Number(appealId);
	if (!Number.isInteger(numericAppealId) || numericAppealId <= 0) {
		return res.status(400).send('Invalid appeal id');
	}

	try {
		const representation = await (async () => {
			if (rule6PartyId) {
				const representations = await getAllRepresentationsByType(
					req.apiClient,
					numericAppealId,
					type
				);
				const representedId = req.currentAppeal.appealRule6Parties?.find(
					(/** @type {AppealRule6Party} */ { id }) => id === Number(rule6PartyId)
				)?.serviceUserId;
				return representations?.find(
					(/** @type {Representation} */ representation) =>
						representation.represented.id === representedId
				);
			} else {
				return await getSingularRepresentationByType(req.apiClient, numericAppealId, type);
			}
		})();

		if (!representation) {
			req.session.createNewRepresentation = true;
		} else {
			req.currentRepresentation = representation;
		}
	} catch (/** @type {any} */ error) {
		return res.status(500).render('app/500.njk');
	}

	next();
};
