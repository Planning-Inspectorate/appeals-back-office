import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import {
	addAffectedListedBuildingCheckAndConfirmPage,
	addAffectedListedBuildingPage,
	changeAffectedListedBuildingCheckAndConfirmPage,
	changeAffectedListedBuildingPage,
	manageAffectedListedBuildingPage,
	removeAffectedListedBuildingPage
} from './affected-listed-buildings.mapper.js';
import {
	addAffectedListedBuilding,
	changeAffectedListedBuilding,
	removeAffectedListedBuilding
} from './affected-listed-buildings.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddAffectedListedBuilding = async (request, response) => {
	return renderAddAffectedListedBuilding(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAddAffectedListedBuilding = async (request, response) => {
	const { errors, currentAppeal } = request;

	const mappedPageContents = addAffectedListedBuildingPage(
		currentAppeal,
		request.session.affectedListedBuilding
	);

	return response
		.status(200)
		.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddAffectedListedBuilding = async (request, response) => {
	request.session.affectedListedBuilding = request.body['affectedListedBuilding'];
	try {
		if (request.errors) {
			return renderAddAffectedListedBuilding(request, response);
		}

		const {
			params: { appealId, lpaQuestionnaireId }
		} = request;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/add/check-and-confirm`
		);
	} catch (error) {
		logger.error(error);
	}

	delete request.session.affectedListedBuilding;
	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddAffectedListedBuildingCheckAndConfirm = async (request, response) => {
	return renderAddAffectedListedBuildingCheckAndConfirm(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAddAffectedListedBuildingCheckAndConfirm = async (request, response) => {
	const { session, currentAppeal, errors } = request;

	if (!session.affectedListedBuilding) {
		return response.status(500).render('app/500.njk');
	}

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = addAffectedListedBuildingCheckAndConfirmPage(
		currentAppeal,
		session.affectedListedBuilding
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddAffectedListedBuildingCheckAndConfirm = async (request, response) => {
	const {
		errors,
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (errors) {
		return renderAddAffectedListedBuildingCheckAndConfirm(request, response);
	}

	try {
		await addAffectedListedBuilding(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.affectedListedBuilding
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Affected listed building added'
		});

		delete request.session.affectedListedBuilding;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}

	delete request.session.affectedListedBuilding;
	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageAffectedListedBuildings = async (request, response) => {
	return renderManageAffectedListedBuildings(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderManageAffectedListedBuildings = async (request, response) => {
	const {
		apiClient,
		currentAppeal,
		params: { appealId, lpaQuestionnaireId }
	} = request;
	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);
	const mappedPageContents = manageAffectedListedBuildingPage(currentAppeal, lpaQuestionnaire);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContents
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getRemoveAffectedListedBuilding = async (request, response) => {
	return renderRemoveAffectedListedBuilding(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderRemoveAffectedListedBuilding = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { listedBuildingId, appealId, lpaQuestionnaireId }
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);
	const mappedPageContents = removeAffectedListedBuildingPage(
		request.currentAppeal,
		lpaQuestionnaire,
		listedBuildingId
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRemoveAffectedListedBuilding = async (request, response) => {
	const {
		errors,
		params: { appealId, lpaQuestionnaireId, listedBuildingId },
		apiClient
	} = request;

	if (errors) {
		return renderRemoveAffectedListedBuilding(request, response);
	}

	if (!appealId || !listedBuildingId || !lpaQuestionnaireId) {
		return response.status(500).render('app/500.njk');
	}

	await removeAffectedListedBuilding(apiClient, appealId, listedBuildingId);

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'changePage',
		appealId,
		text: 'Affected listed building removed'
	});

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeAffectedListedBuilding = async (request, response) => {
	return renderChangeAffectedListedBuilding(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAffectedListedBuilding = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { listedBuildingId, appealId, lpaQuestionnaireId }
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);

	const mappedPageContents = changeAffectedListedBuildingPage(
		request.currentAppeal,
		lpaQuestionnaire,
		request.session.affectedListedBuilding,
		listedBuildingId
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeAffectedListedBuilding = async (request, response) => {
	request.session.affectedListedBuilding = request.body['affectedListedBuilding'];

	if (request.errors) {
		return renderChangeAffectedListedBuilding(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId, listedBuildingId }
	} = request;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/affected-listed-buildings/change/${listedBuildingId}/check-and-confirm`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeAffectedListedBuildingCheckAndConfirm = async (request, response) => {
	return renderChangeAffectedListedBuildingCheckAndConfirm(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAffectedListedBuildingCheckAndConfirm = async (request, response) => {
	const {
		errors,
		currentAppeal,
		params: { listedBuildingId }
	} = request;

	if (!request.session.affectedListedBuilding) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContents = changeAffectedListedBuildingCheckAndConfirmPage(
		currentAppeal,
		request.session.affectedListedBuilding,
		listedBuildingId
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeAffectedListedBuildingCheckAndConfirm = async (request, response) => {
	if (!request.session.affectedListedBuilding) {
		return response.status(500).render('app/500.njk');
	}

	const {
		errors,
		params: { appealId, lpaQuestionnaireId, listedBuildingId }
	} = request;

	if (errors) {
		return renderChangeAffectedListedBuildingCheckAndConfirm(request, response);
	}

	try {
		await changeAffectedListedBuilding(
			request.apiClient,
			appealId,
			listedBuildingId,
			request.session.affectedListedBuilding
		);
		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Affected listed building updated'
		});

		delete request.session.affectedListedBuilding;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
