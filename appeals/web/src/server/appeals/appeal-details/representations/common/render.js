/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../types.js").Representation} Representation */

import logger from '#lib/logger.js';

/**
 *
 * @param {(appealDetails: Appeal, comment: Representation, session: import('express-session').Session & Record<string, string>) => PageContent} contentMapper
 * @param {string} templatePath,
 * @param {'currentComment' | 'currentRepresentation'} [representationKey]
 * @returns {import('@pins/express').RenderHandler<any, any, any>}
 */
export const render =
	(contentMapper, templatePath, representationKey = 'currentComment') =>
	(request, response) => {
		const { errors, [representationKey]: currentRepresentation, currentAppeal, session } = request;

		if (!currentRepresentation || !currentAppeal) {
			logger.warn('Not representation or appeal found in session');
			return response.status(404).render('app/404.njk');
		}

		const pageContent = contentMapper(currentAppeal, currentRepresentation, session);

		return response.status(200).render(templatePath, {
			errors,
			pageContent
		});
	};
