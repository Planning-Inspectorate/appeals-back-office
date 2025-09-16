import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import {
	addChangedListedBuildingCheckAndConfirmPage,
	addChangedListedBuildingPage,
	changeChangedListedBuildingCheckAndConfirmPage,
	changeChangedListedBuildingPage,
	manageChangedListedBuildingPage,
	removeChangedListedBuildingPage
} from './changed-listed-buildings.mapper.js';
import {
	addChangedListedBuilding,
	changeChangedListedBuilding,
	removeChangedListedBuilding
} from './changed-listed-buildings.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAddChangedListedBuilding = async (request, response) => {
	const { errors, currentAppeal } = request;

	const mappedPageContents = addChangedListedBuildingPage(
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
export const postAddChangedListedBuilding = async (request, response) => {
	request.session.affectedListedBuilding = request.body['changedListedBuilding'];

	if (request.errors) {
		return renderAddChangedListedBuilding(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId }
	} = request;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/add/check-and-confirm`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAddChangedListedBuildingCheckAndConfirm = async (request, response) => {
	const { session, currentAppeal, errors } = request;

	if (!session.affectedListedBuilding) {
		return response.status(500).render('app/500.njk');
	}

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = addChangedListedBuildingCheckAndConfirmPage(
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
export const postAddChangedListedBuildingCheckAndConfirm = async (request, response) => {
	const {
		errors,
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (errors) {
		return renderAddChangedListedBuildingCheckAndConfirm(request, response);
	}

	await addChangedListedBuilding(
		apiClient,
		appealId,
		lpaQuestionnaireId,
		request.session.affectedListedBuilding
	);

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'changePage',
		appealId,
		text: 'Changed listed building added'
	});

	delete request.session.affectedListedBuilding;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageChangedListedBuildings = async (request, response) => {
	return renderManageChangedListedBuildings(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderManageChangedListedBuildings = async (request, response) => {
	const {
		apiClient,
		currentAppeal,
		params: { appealId, lpaQuestionnaireId }
	} = request;
	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);
	const mappedPageContents = manageChangedListedBuildingPage(currentAppeal, lpaQuestionnaire);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContents
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getRemoveChangedListedBuilding = async (request, response) => {
	return renderRemoveChangedListedBuilding(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderRemoveChangedListedBuilding = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { listedBuildingId, appealId, lpaQuestionnaireId }
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);
	const mappedPageContents = removeChangedListedBuildingPage(
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
export const postRemoveChangedListedBuilding = async (request, response) => {
	const {
		errors,
		params: { appealId, lpaQuestionnaireId, listedBuildingId },
		apiClient
	} = request;

	if (errors) {
		return renderRemoveChangedListedBuilding(request, response);
	}

	if (!areIdParamsValid(appealId, listedBuildingId, lpaQuestionnaireId)) {
		return response.status(400).render('app/400.njk');
	}

	if (!appealId || !listedBuildingId || !lpaQuestionnaireId) {
		return response.status(500).render('app/500.njk');
	}

	await removeChangedListedBuilding(apiClient, appealId, listedBuildingId);

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'changePage',
		appealId,
		text: 'Changed listed building removed'
	});

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeChangedListedBuilding = async (request, response) => {
	return renderChangeChangedListedBuilding(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeChangedListedBuilding = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { listedBuildingId, appealId, lpaQuestionnaireId }
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);

	const mappedPageContents = changeChangedListedBuildingPage(
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
export const postChangeChangedListedBuilding = async (request, response) => {
	request.session.affectedListedBuilding = request.body['changedListedBuilding'];

	if (request.errors) {
		return renderChangeChangedListedBuilding(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId, listedBuildingId }
	} = request;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/changed-listed-buildings/change/${listedBuildingId}/check-and-confirm`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeChangedListedBuildingCheckAndConfirm = async (request, response) => {
	return renderChangeChangedListedBuildingCheckAndConfirm(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeChangedListedBuildingCheckAndConfirm = async (request, response) => {
	const {
		errors,
		currentAppeal,
		params: { listedBuildingId }
	} = request;

	if (!request.session.affectedListedBuilding) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContents = changeChangedListedBuildingCheckAndConfirmPage(
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
export const postChangeChangedListedBuildingCheckAndConfirm = async (request, response) => {
	if (!request.session.affectedListedBuilding) {
		return response.status(500).render('app/500.njk');
	}

	const {
		errors,
		params: { appealId, lpaQuestionnaireId, listedBuildingId }
	} = request;

	if (errors) {
		return renderChangeChangedListedBuildingCheckAndConfirm(request, response);
	}

	await changeChangedListedBuilding(
		request.apiClient,
		appealId,
		listedBuildingId,
		request.session.affectedListedBuilding
	);

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'changePage',
		appealId,
		text: 'Changed listed building updated'
	});

	delete request.session.affectedListedBuilding;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
	);
};
