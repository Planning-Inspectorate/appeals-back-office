import {
	allocationDetailsLevelPage,
	allocationDetailsSpecialismPage,
	allocationDetailsCheckAnswersPage
} from './allocation-details.mapper.js';
import logger from '../../../lib/logger.js';
import { objectContainsAllKeys } from '../../../lib/object-utilities.js';
import * as api from '#lib/api/allocation-details.api.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { moveItemInArray } from '#lib/array-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import("@pins/express/types/express.js").ValidationErrors | string | null} errors
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAllocationDetailsLevels = async (request, response, errors = null) => {
	const appealDetails = request.currentAppeal;
	const allocationDetailsLevels = await api.getAllocationDetailsLevels(request.apiClient);

	if (appealDetails) {
		if (request.session.appealId && request.session.appealId !== appealDetails.appealId) {
			delete request.session.appealId;
			delete request.session.allocationLevel;
			delete request.session.allocationSpecialisms;
		}

		const mappedPageContent = allocationDetailsLevelPage(
			{ allocationDetailsLevels },
			appealDetails.appealId === request.session.appealId
				? request.session.allocationLevel
				: undefined,
			appealDetails,
			errors && typeof errors === 'object' ? errors['allocation-level'].msg : undefined
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import("@pins/express/types/express.js").ValidationErrors | string | null} errors
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAllocationDetailsSpecialism = async (request, response, errors = null) => {
	const appealDetails = request.currentAppeal;

	if (!objectContainsAllKeys(request.session, ['appealId', 'allocationLevel'])) {
		return response.status(500).render('app/500.njk');
	}

	let [allocationDetailsLevels, allocationDetailsSpecialisms] = await Promise.all([
		api.getAllocationDetailsLevels(request.apiClient),
		api.getAllocationDetailsSpecialisms(request.apiClient)
	]);

	// move "General allocation" to the top as per A2-1426
	const generalAllocationIndex = allocationDetailsSpecialisms.findIndex(
		(specialism) => specialism.name === 'General allocation'
	);
	if (generalAllocationIndex > 0) {
		allocationDetailsSpecialisms = moveItemInArray(
			allocationDetailsSpecialisms,
			generalAllocationIndex,
			0
		);
	}

	const selectedAllocationLevel = allocationDetailsLevels.find(
		(levelItem) => levelItem.level === request.session.allocationLevel
	);

	if (
		appealDetails &&
		allocationDetailsLevels &&
		allocationDetailsSpecialisms &&
		selectedAllocationLevel
	) {
		const mappedPageContent = allocationDetailsSpecialismPage(
			{ allocationDetailsLevels, allocationDetailsSpecialisms },
			appealDetails.appealId === request.session.appealId ? selectedAllocationLevel : undefined,
			request.session.allocationSpecialisms,
			appealDetails,
			errors && typeof errors === 'object' ? errors['allocation-specialisms'].msg : undefined
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} else {
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAllocationDetailsCheckAnswers = async (request, response) => {
	const appealDetails = request.currentAppeal;

	if (
		!objectContainsAllKeys(request.session, [
			'appealId',
			'allocationLevel',
			'allocationSpecialisms'
		])
	) {
		return response.status(500).render('app/500.njk');
	}

	const [allocationDetailsLevels, allocationDetailsSpecialisms] = await Promise.all([
		api.getAllocationDetailsLevels(request.apiClient),
		api.getAllocationDetailsSpecialisms(request.apiClient)
	]);
	const selectedAllocationLevel = allocationDetailsLevels.find(
		(levelItem) => levelItem.level === request.session.allocationLevel
	);
	const selectedAllocationSpecialisms = request.session.allocationSpecialisms.map(
		(/** @type {number} */ specialismId) =>
			allocationDetailsSpecialisms.find(
				(currentSpecialism) => currentSpecialism.id === specialismId
			)?.name
	);

	if (
		appealDetails &&
		appealDetails.appealId === request.session.appealId &&
		selectedAllocationLevel &&
		selectedAllocationSpecialisms
	) {
		const mappedPageContent = allocationDetailsCheckAnswersPage(
			selectedAllocationLevel,
			selectedAllocationSpecialisms,
			appealDetails
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent: mappedPageContent
		});
	} else {
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAllocationDetailsLevels = async (request, response) => {
	renderAllocationDetailsLevels(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAllocationDetailsLevels = async (request, response) => {
	const { body, errors } = request;

	if (errors) {
		return renderAllocationDetailsLevels(request, response, errors);
	}

	try {
		const allocationLevel = body['allocation-level'];
		request.session.appealId = request.currentAppeal.appealId;
		request.session.allocationLevel = allocationLevel;
		return response.redirect(
			`/appeals-service/appeal-details/${request.currentAppeal.appealId}/allocation-details/allocation-specialism`
		);
	} catch (error) {
		let errorMessage = 'Something went wrong when adding allocation details levels';
		if (error instanceof Error) {
			errorMessage += `: ${error.message}`;
		}

		logger.error(error, errorMessage);

		return renderAllocationDetailsLevels(request, response, errorMessage);
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAllocationDetailsSpecialism = async (request, response) => {
	renderAllocationDetailsSpecialism(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAllocationDetailsSpecialism = async (request, response) => {
	const {
		params: { appealId },
		body,
		errors
	} = request;

	if (errors) {
		return renderAllocationDetailsSpecialism(request, response, errors);
	}

	try {
		let submittedAllocationSpecialism = body['allocation-specialisms'];

		if (!Array.isArray(submittedAllocationSpecialism)) {
			submittedAllocationSpecialism = [submittedAllocationSpecialism];
		}
		const allocationSpecialisms = submittedAllocationSpecialism.map(
			(/** @type {string} */ specialismId) => parseInt(specialismId)
		);
		request.session.allocationSpecialisms = allocationSpecialisms;
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/allocation-details/check-answers`
		);
	} catch (error) {
		let errorMessage = 'Something went wrong when adding allocation details specialism';
		if (error instanceof Error) {
			errorMessage += `: ${error.message}`;
		}

		logger.error(error, errorMessage);

		return renderAllocationDetailsSpecialism(request, response, errorMessage);
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */

export const getAllocationDetailsCheckAnswers = async (request, response) => {
	renderAllocationDetailsCheckAnswers(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAllocationDetailsCheckAnswers = async (request, response) => {
	const appealDetails = request.currentAppeal;

	if (!objectContainsAllKeys(request.session, ['allocationLevel', 'allocationSpecialisms'])) {
		return response.status(500).render('app/500.njk');
	}

	try {
		const allocationDetails = {
			level: request.session.allocationLevel,
			specialisms: request.session.allocationSpecialisms
		};

		await api.setAllocationDetails(request.apiClient, appealDetails.appealId, allocationDetails);

		delete request.session.allocationLevel;
		delete request.session.allocationSpecialisms;

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: appealDetails.allocationDetails
				? 'allocationDetailsUpdated'
				: 'allocationDetailsAdded',
			appealId: appealDetails.appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealDetails.appealId}`);
	} catch (error) {
		let errorMessage = 'Something went wrong when setting allocation details';
		if (error instanceof Error) {
			errorMessage += `: ${error.message}`;
		}

		logger.error(error, errorMessage);

		return renderAllocationDetailsSpecialism(request, response, errorMessage);
	}
};
