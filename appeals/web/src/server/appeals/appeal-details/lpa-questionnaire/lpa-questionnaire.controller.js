import * as appealDetailsService from '#appeals/appeal-details/appeal-details.service.js';
import { getDocumentFileType } from '#appeals/appeal-documents/appeal.documents.service.js';
import logger from '#lib/logger.js';
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { uncapitalizeFirstLetter } from '#lib/string-utilities.js';
import { getBackLinkUrlFromQuery, stripQueryString } from '#lib/url-utilities.js';
import { DOCUMENT_FOLDER_DISPLAY_LABELS } from '@pins/appeals/constants/documents.js';
import askEnvironmentServiceTeamReviewQuestion from '@pins/appeals/utils/ask-environment-service-team-review-question.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import {
	postChangeDocumentDetails,
	postChangeDocumentFileName,
	postDeleteDocument,
	postDocumentDetails,
	postDocumentUpload,
	postUploadDocumentsCheckAndConfirm,
	postUploadDocumentVersionCheckAndConfirm,
	renderChangeDocumentDetails,
	renderChangeDocumentFileName,
	renderDeleteDocument,
	renderDocumentDetails,
	renderDocumentUpload,
	renderManageDocument,
	renderManageFolder,
	renderUploadDocumentsCheckAndConfirm
} from '../../appeal-documents/appeal-documents.controller.js';
import {
	checkAndConfirmPage,
	environmentServiceTeamReviewCasePage,
	getValidationOutcomeFromLpaQuestionnaire,
	lpaQuestionnairePage,
	mapWebValidationOutcomeToApiValidationOutcome
} from './lpa-questionnaire.mapper.js';
import * as lpaQuestionnaireService from './lpa-questionnaire.service.js';
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import("@pins/express/types/express.js").ValidationErrors | string | null} errors
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderLpaQuestionnaire = async (request, response, errors = null) => {
	const {
		currentAppeal,
		params: { lpaQuestionnaireId },
		session
	} = request;

	const lpaQuestionnaire = await lpaQuestionnaireService.getLpaQuestionnaireFromId(
		request.apiClient,
		currentAppeal.appealId,
		lpaQuestionnaireId
	);
	if (!lpaQuestionnaire) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = await lpaQuestionnairePage(
		lpaQuestionnaire,
		currentAppeal,
		stripQueryString(request.originalUrl),
		session,
		request,
		getBackLinkUrlFromQuery(request)
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getLpaQuestionnaire = async (request, response) => {
	await renderLpaQuestionnaire(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postLpaQuestionnaire = async (request, response) => {
	const {
		params: { appealId, lpaQuestionnaireId },
		body,
		errors,
		currentAppeal
	} = request;

	if (errors) {
		return renderLpaQuestionnaire(request, response, errors);
	}

	try {
		const reviewOutcome = body['review-outcome'];

		request.session.reviewOutcome = reviewOutcome;

		if (reviewOutcome === 'complete') {
			if (askEnvironmentServiceTeamReviewQuestion(currentAppeal.appealType)) {
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/environment-service-team-review-case`
				);
			}

			await lpaQuestionnaireService.setReviewOutcomeForLpaQuestionnaire(
				request.apiClient,
				appealId,
				lpaQuestionnaireId,
				mapWebValidationOutcomeToApiValidationOutcome('complete')
			);

			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'lpaqReviewComplete',
				appealId
			});

			return response.redirect(`/appeals-service/appeal-details/${appealId}`);
		} else if (reviewOutcome === 'incomplete') {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete`
			);
		}
	} catch (error) {
		let errorMessage = 'Something went wrong when completing lpa questionnaire review';
		if (error instanceof Error) {
			errorMessage += `: ${error.message}`;
		}

		logger.error(error, errorMessage);

		return renderLpaQuestionnaire(request, response, errorMessage);
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import("@pins/express/types/express.js").ValidationErrors | string | null} errors
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderEnvironmentServiceTeamReviewCase = async (request, response, errors = null) => {
	const { currentAppeal } = request;

	const lpaQuestionnaireDetails = await getLpaQuestionnaireDetails(request);
	if (!lpaQuestionnaireDetails) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = environmentServiceTeamReviewCasePage(
		currentAppeal,
		lpaQuestionnaireDetails
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getEnvironmentServiceTeamReviewCase = async (request, response) => {
	return renderEnvironmentServiceTeamReviewCase(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postEnvironmentServiceTeamReviewCase = async (request, response) => {
	const {
		params: { appealId, lpaQuestionnaireId },
		body: { eiaScreeningRequired },
		errors
	} = request;
	if (errors) {
		return renderEnvironmentServiceTeamReviewCase(request, response, errors);
	}

	await appealDetailsService.setEnvironmentalImpactAssessmentScreening(
		request.apiClient,
		appealId,
		eiaScreeningRequired === 'yes'
	);

	await lpaQuestionnaireService.setReviewOutcomeForLpaQuestionnaire(
		request.apiClient,
		appealId,
		lpaQuestionnaireId,
		mapWebValidationOutcomeToApiValidationOutcome('complete')
	);

	delete request.session.reviewOutcome;

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'lpaqReviewComplete',
		appealId
	});

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCheckAndConfirm = async (request, response) => {
	try {
		if (!objectContainsAllKeys(request.session, 'webLPAQuestionnaireReviewOutcome')) {
			return response.status(500).render('app/500.njk');
		}

		const {
			currentAppeal,
			params: { lpaQuestionnaireId },
			session: { webLPAQuestionnaireReviewOutcome }
		} = request;

		const reasonOptions = await lpaQuestionnaireService.getLPAQuestionnaireIncompleteReasonOptions(
			request.apiClient
		);
		if (!reasonOptions) {
			throw new Error('error retrieving invalid reason options');
		}

		const mappedPageContent = checkAndConfirmPage(
			currentAppeal.appealId,
			currentAppeal.appealReference,
			lpaQuestionnaireId,
			reasonOptions,
			'incomplete',
			request.session,
			webLPAQuestionnaireReviewOutcome.reasons,
			webLPAQuestionnaireReviewOutcome.reasonsText,
			webLPAQuestionnaireReviewOutcome.updatedDueDate
		);

		return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
			pageContent: mappedPageContent
		});
	} catch (/** @type {*} */ error) {
		throw new Error(
			`Something went wrong when completing lpa questionnaire review: ${error.message}`
		);
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getCheckAndConfirm = async (request, response) => {
	renderCheckAndConfirm(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postCheckAndConfirm = async (request, response) => {
	try {
		if (!objectContainsAllKeys(request.session, 'webLPAQuestionnaireReviewOutcome')) {
			return response.status(500).render('app/500.njk');
		}

		const {
			currentAppeal,
			params: { lpaQuestionnaireId },
			session: { webLPAQuestionnaireReviewOutcome }
		} = request;

		await lpaQuestionnaireService.setReviewOutcomeForLpaQuestionnaire(
			request.apiClient,
			currentAppeal.appealId,
			lpaQuestionnaireId,
			mapWebValidationOutcomeToApiValidationOutcome(
				'incomplete',
				webLPAQuestionnaireReviewOutcome.reasons,
				webLPAQuestionnaireReviewOutcome.reasonsText,
				webLPAQuestionnaireReviewOutcome.updatedDueDate
			)
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey:
				request.session.reviewOutcome === 'complete'
					? 'lpaqReviewComplete'
					: 'lpaqReviewIncomplete',
			appealId: currentAppeal.appealId
		});

		delete request.session.reviewOutcome;

		if (webLPAQuestionnaireReviewOutcome.updatedDueDate) {
			request.session.lpaQuestionnaireUpdatedDueDate =
				webLPAQuestionnaireReviewOutcome.updatedDueDate;
		}

		delete request.session.webLPAQuestionnaireReviewOutcome;

		return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
	} catch (/** @type {*} */ error) {
		throw new Error(
			`Something went wrong when completing lpa questionnaire review: ${error.message}`
		);
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocuments = async (request, response) => {
	const { currentAppeal, currentFolder } = request;
	const lpaQuestionnaireDetails = await getLpaQuestionnaireDetails(request);

	if (!currentAppeal || !currentFolder || !lpaQuestionnaireDetails) {
		return response.status(404).render('app/404.njk');
	}

	const documentType = currentFolder.path.split('/')[1];

	const pageHeadingTextOverride = {
		[APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED]: 'Upload who you notified about the application',
		[APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE]: 'Upload the site notice',
		[APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS]: 'Upload letter or email notification',
		[APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT]: 'Upload press advertisement',
		[APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES]: 'Upload any other relevant policies',
		[APPEAL_DOCUMENT_TYPE.TREE_PRESERVATION_PLAN]: 'Upload a plan showing the extent of the order',
		[APPEAL_DOCUMENT_TYPE.DEFINITIVE_MAP_STATEMENT]:
			'Upload the definitive map and statement extract',
		[APPEAL_DOCUMENT_TYPE.EIA_SCREENING_DIRECTION]: 'Upload the screening direction',
		[APPEAL_DOCUMENT_TYPE.EIA_SCREENING_OPINION]:
			'Upload your screening opinion and any correspondence',
		[APPEAL_DOCUMENT_TYPE.EIA_SCOPING_OPINION]:
			'Upload your scoping opinion and any correspondence',
		[APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT]:
			'Environmental statement and supporting information',
		[APPEAL_DOCUMENT_TYPE.CONSULTATION_RESPONSES]:
			'Upload the consultation responses and standing advice',
		[APPEAL_DOCUMENT_TYPE.OTHER_PARTY_REPRESENTATIONS]:
			'Upload the representations from members of the public or other parties',
		[APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS]: 'Upload the plans, drawings and list of plans',
		[APPEAL_DOCUMENT_TYPE.PLANNING_OFFICER_REPORT]:
			'Upload the planning officer’s report or what your decision notice would have said',
		[APPEAL_DOCUMENT_TYPE.DEVELOPMENT_PLAN_POLICIES]:
			'Upload relevant policies from your statutory development plan',
		[APPEAL_DOCUMENT_TYPE.EMERGING_PLAN]: 'Upload the emerging plan and supporting information',
		[APPEAL_DOCUMENT_TYPE.SUPPLEMENTARY_PLANNING]: 'Upload supplementary planning documents'
	}[documentType];

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/${request.params.documentType}/add-document-details/{{folderId}}`,
		isLateEntry: getValidationOutcomeFromLpaQuestionnaire(lpaQuestionnaireDetails) === 'complete',
		pageHeadingTextOverride
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocuments = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-document-details/${currentFolder.folderId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const { currentFolder } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const lpaQuestionnaireDetails = await getLpaQuestionnaireDetails(request);
	if (!lpaQuestionnaireDetails) {
		return response.status(404).render('app/404.njk');
	}

	const documentType = currentFolder.path.split('/')[1];
	let pageHeadingTextOverride;

	switch (documentType) {
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED:
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE:
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS:
		case APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT:
			pageHeadingTextOverride = 'Notification documents';
			break;
		case APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT:
			pageHeadingTextOverride = 'Environmental impact assessment';
			break;
		case APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES:
			pageHeadingTextOverride = 'Other relevant policies';
			break;
		default:
			break;
	}

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}`,
		isLateEntry: getValidationOutcomeFromLpaQuestionnaire(lpaQuestionnaireDetails) === 'complete',
		pageHeadingTextOverride
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}/check-your-answers`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	const addDocumentDetailsPageUrl = `/appeals-service/appeal-details/${
		request.currentAppeal.appealId
	}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-document-details/${
		currentFolder.folderId
	}${documentId ? `/${documentId}` : ''}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `/appeals-service/appeal-details/${
			request.currentAppeal.appealId
		}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/${
			currentFolder.folderId
		}${documentId ? `/${documentId}` : ''}`,
		changeDateLinkUrl: addDocumentDetailsPageUrl,
		changeRedactionStatusLinkUrl: addDocumentDetailsPageUrl
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentsCheckAndConfirm({
			request,
			response,
			nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}`,
			successCallback: () => {
				addNotificationBannerToSession({
					session: request.session,
					bannerDefinitionKey: 'documentAdded',
					appealId: currentAppeal.appealId,
					text: `${mapFolderNameToDisplayLabel(currentFolder?.path) || 'Documents'} added`
				});
			}
		});
	} catch (/** @type {*} */ error) {
		throw new Error(
			`Something went wrong when adding documents to lpa questionnaire: ${error.message}`
		);
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersionCheckAndConfirm = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentVersionCheckAndConfirm({
			request,
			response,
			nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}`
		});
	} catch (/** @type {*} */ error) {
		throw new Error(
			`Something went wrong when adding document version to lpa questionnaire: ${error.message}`
		);
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageFolder = async (request, response) => {
	const { currentFolder } = request;

	const documentType = currentFolder.path.split('/')[1];
	let managePageHeadingText = '';

	switch (documentType) {
		case `${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED}`:
			managePageHeadingText = `Notification documents`;
			break;
		case `${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_SITE_NOTICE}`:
			managePageHeadingText = `Site notice documents`;
			break;
		case `${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_LETTER_TO_NEIGHBOURS}`:
			managePageHeadingText = `Letter or email notification documents`;
			break;
		case `${APPEAL_DOCUMENT_TYPE.WHO_NOTIFIED_PRESS_ADVERT}`:
			managePageHeadingText = `Press advert notification documents`;
			break;
		case `${APPEAL_DOCUMENT_TYPE.EIA_ENVIRONMENTAL_STATEMENT}`:
			managePageHeadingText = `Environmental statement documents`;
			break;
		case `${APPEAL_DOCUMENT_TYPE.EIA_SCREENING_OPINION}`:
			managePageHeadingText = `Screening opinion documents`;
			break;
		case `${APPEAL_DOCUMENT_TYPE.EIA_SCREENING_DIRECTION}`:
			managePageHeadingText = `Screening direction documents`;
			break;
		case `${APPEAL_DOCUMENT_TYPE.OTHER_RELEVANT_POLICIES}`:
			managePageHeadingText = `Other relevant policies`;
			break;
		default:
			managePageHeadingText = '';
			break;
	}

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/`,
		viewAndEditUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}/{{documentId}}`,
		addButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}`,
		pageHeadingTextOverride: managePageHeadingText
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageDocument = async (request, response) => {
	await renderManageDocument({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}`,
		uploadUpdatedDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}/{{documentId}}`,
		removeDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}/{{documentId}}/{{versionId}}/delete`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersion = async (request, response) => {
	const { apiClient, currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const lpaQuestionnaireDetails = await getLpaQuestionnaireDetails(request);
	if (!lpaQuestionnaireDetails) {
		return response.status(404).render('app/404.njk');
	}

	const allowedType = await getDocumentFileType(apiClient, request.params.documentId);

	const pageHeading = DOCUMENT_FOLDER_DISPLAY_LABELS[currentFolder.path.split('/')[1]];

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-document-details/${request.params.folderId}/${request.params.documentId}`,
		isLateEntry: getValidationOutcomeFromLpaQuestionnaire(lpaQuestionnaireDetails) === 'complete',
		allowedTypes: allowedType ? [allowedType] : undefined,
		...(pageHeading && {
			pageHeadingTextOverride: pageHeading,
			uploadContainerHeadingTextOverride: `Upload ${uncapitalizeFirstLetter(pageHeading)}`
		})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersion = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-document-details/${currentFolder.folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersionDetails = async (request, response) => {
	const {
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	const lpaQuestionnaireDetails = await getLpaQuestionnaireDetails(request);
	if (!lpaQuestionnaireDetails) {
		return response.status(404).render('app/404.njk');
	}

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/${request.params.folderId}/${request.params.documentId}`,
		isLateEntry: getValidationOutcomeFromLpaQuestionnaire(lpaQuestionnaireDetails) === 'complete',
		documentId
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionDetails = async (request, response) => {
	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/${request.params.folderId}/${request.params.documentId}/check-your-answers`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteDocument = async (request, response) => {
	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}/{{documentId}}`
	});
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteDocumentPage = async (request, response) => {
	await postDeleteDocument({
		request,
		response,
		returnUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}`,
		cancelUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}`
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<void|import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse>}
 */
async function getLpaQuestionnaireDetails(request) {
	return await lpaQuestionnaireService
		.getLpaQuestionnaireFromId(
			request.apiClient,
			request.params.appealId,
			request.params.lpaQuestionnaireId
		)
		.catch((error) => logger.error(error));
}
