import logger from '#lib/logger.js';
import { HTTPError } from 'got';
import { getAppellantCaseEnforcementGroundsMismatch } from '../outcome-incomplete/outcome-incomplete.service.js';
import { groundsFactsCheckPage } from './grounds-facts-check.mapper.js';

/**
 * @typedef { import('@pins/appeals.api').Appeals.ReasonOption } ReasonOption
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getGroundsFactsCheck = async (request, response) => {
	return renderGroundsFactsCheck(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderGroundsFactsCheck = async (request, response) => {
	try {
		// @ts-ignore
		const { errors, currentAppeal } = request;

		/** @type {ReasonOption[]} */
		const appealGrounds = [
			{ name: 'a', id: 1, hasText: false },
			{ name: 'b', id: 2, hasText: false },
			{ name: 'c', id: 3, hasText: false },
			{ name: 'd', id: 4, hasText: false },
			{ name: 'e', id: 5, hasText: false },
			{ name: 'f', id: 6, hasText: false },
			{ name: 'g', id: 7, hasText: false },
			{ name: 'h', id: 8, hasText: false },
			{ name: 'i', id: 9, hasText: false },
			{ name: 'j', id: 10, hasText: false },
			{ name: 'k', id: 11, hasText: false }
		];

		const mappedPageContents = groundsFactsCheckPage(
			currentAppeal,
			// @ts-ignore
			appealGrounds,
			errors && typeof errors === 'object' ? errors.groundsFactsCheck?.msg : undefined
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postGroundsFactsCheck = async (request, response) => {
	if (request.errors) {
		return renderGroundsFactsCheck(request, response);
	}
	const groundsMismatchFactsList = await getAppellantCaseEnforcementGroundsMismatch(
		request.apiClient
	);

	request.session.webAppellantCaseReviewOutcome = {
		...request.session.webAppellantCaseReviewOutcome,
		enforcementGroundsMismatchText: request.body?.groundsFacts.map((/** @type {any} */ ground) => {
			const groundId = groundsMismatchFactsList.find(
				(/** @type {{ name: string; }} */ item) => item.name === ground
			)?.id;
			return {
				id: groundId,
				text: [request.body[`ground-${ground}`]],
				name: ground
			};
		})
	};

	const {
		params: { appealId }
	} = request;

	try {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/date`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
