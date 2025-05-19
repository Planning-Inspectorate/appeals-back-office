/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../types.js").Representation} Representation */

import logger from '#lib/logger.js';

/**
 *
 * @param {(appealDetails: Appeal, comment: Representation, session: import('express-session').Session & Record<string, string>, errors: import("@pins/express").ValidationErrors | undefined) => PageContent} contentMapper
 * @param {string} templatePath,
 * @returns {import('@pins/express').RenderHandler<any, any, any>}
 */
export const render = (contentMapper, templatePath) => (request, response) => {
	const { errors, currentRepresentation, currentAppeal, session } = request;

	if (!currentRepresentation || !currentAppeal) {
		logger.warn('No representation or appeal found in session');
		return response.status(404).render('app/404.njk');
	}

	const pageContent = contentMapper(currentAppeal, currentRepresentation, session, errors);

	return response.status(200).render(templatePath, {
		errors,
		pageContent
	});
};
