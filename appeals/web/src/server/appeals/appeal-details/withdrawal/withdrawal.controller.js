import { postWithdrawalRequest } from './withdrawal.service.js';
import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import {
	postDocumentUpload,
	postUploadDocumentsCheckAndConfirm,
	renderDocumentUpload
} from '../../appeal-documents/appeal-documents.controller.js';
import { addDocumentDetailsFormDataToFileUploadInfo } from '../../appeal-documents/appeal-documents.mapper.js';
import { getDocumentRedactionStatuses } from '../../appeal-documents/appeal.documents.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { checkAndConfirmPage, manageWithdrawalRequestFolderPage } from './withdrawal.mapper.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { addressToString } from '#lib/address-formatter.js';
import { getEventType } from '@pins/appeals/utils/event-type.js';

const UNREDACTED_REDACTION_STATUS_ID = '2';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getViewWithdrawalDocumentFolder = async (request, response) => {
	const {
		errors,
		currentAppeal,
		params: { appealId }
	} = request;

	if (!currentAppeal || currentAppeal.appealStatus !== APPEAL_CASE_STATUS.WITHDRAWN) {
		return response.status(404).render('app/404');
	}

	request.currentFolder = currentAppeal.withdrawal?.withdrawalFolder;

	const mappedPageContent = manageWithdrawalRequestFolderPage(
		appealId,
		`/appeals-service/appeal-details/${appealId}`,
		currentAppeal.withdrawal?.withdrawalFolder,
		currentAppeal.withdrawal?.withdrawalRequestDate,
		request,
		'Appeal withdrawal request'
	);

	return response.status(200).render('appeals/documents/manage-folder.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getWithdrawalRequestUpload = async (request, response) => {
	return renderWithdrawalRequestUpload(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postWithdrawalRequestRequestUpload = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal || currentAppeal.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN) {
		return response.status(404).render('app/404');
	}

	request.currentFolder = {
		folderId: currentAppeal.withdrawal?.withdrawalFolder?.folderId,
		path: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`
	};

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/withdrawal/check-details`
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderWithdrawalRequestUpload = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal || currentAppeal.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN) {
		return response.status(404).render('app/404');
	}

	request.currentFolder = {
		folderId: currentAppeal.withdrawal?.withdrawalFolder?.folderId,
		path: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`
	};

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/cancel`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/withdrawal/check-details`,
		pageHeadingTextOverride: `Request to withdraw appeal`,
		preHeadingTextOverride: `Appeal ${request.currentAppeal.appealReference} - withdraw appeal`,
		uploadContainerHeadingTextOverride: `Upload request to withdraw appeal`,
		allowMultipleFiles: false
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckYourAnswers = async (request, response) => {
	return renderCheckYourAnswers(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckYourAnswers = async (request, response) => {
	const { currentAppeal } = request;
	if (!currentAppeal || currentAppeal.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN) {
		return response.status(404).render('app/404');
	}
	try {
		const { appealId } = request.params;
		const { errors, currentAppeal, apiClient } = request;

		if (!currentAppeal) {
			return response.status(500).render('app/500.njk');
		}

		if (!objectContainsAllKeys(request.session, ['fileUploadInfo'])) {
			return response.status(500).render('app/500.njk');
		}

		request.currentFolder = {
			folderId: currentAppeal.withdrawal?.withdrawalFolder?.folderId,
			path: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`
		};

		if (errors) {
			return renderCheckYourAnswers(request, response);
		}

		const { documentId } = request.session.fileUploadInfo;

		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		addDocumentDetailsFormDataToFileUploadInfo(
			{
				items: [
					{
						documentId,
						receivedDate: { date: new Date().toISOString() },
						redactionStatus: UNREDACTED_REDACTION_STATUS_ID
					}
				]
			},
			request.session.fileUploadInfo.files,
			redactionStatuses
		);

		await postUploadDocumentsCheckAndConfirm({ request, response });

		await postWithdrawalRequest(request.apiClient, appealId, new Date().toISOString());

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'appealWithdrawn',
			appealId: currentAppeal.appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCheckYourAnswers = async (request, response) => {
	const { errors, currentAppeal, session } = request;

	if (!currentAppeal || currentAppeal.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN) {
		return response.status(404).render('app/404');
	}
	if (!objectContainsAllKeys(session, ['fileUploadInfo'])) {
		return response.status(500).render('app/500.njk');
	}
	const personalisation = {
		appeal_reference_number: currentAppeal.appealReference,
		lpa_reference: currentAppeal.planningApplicationReference,
		site_address: addressToString(currentAppeal.appealSite),
		withdrawal_date: formatDate(new Date(), false),
		event_set: !!getEventType(currentAppeal),
		event_type: getEventType(currentAppeal)
	};
	const appealWithdrawnAppellantTemplateName = 'appeal-withdrawn-appellant.content.md';
	const appealWithdrawnAppellantTemplate = await generateNotifyPreview(
		request.apiClient,
		appealWithdrawnAppellantTemplateName,
		personalisation
	);

	const appealWithdrawnLPATemplateName = 'appeal-withdrawn-lpa.content.md';
	const appealWithdrawnLPATemplate = await generateNotifyPreview(
		request.apiClient,
		appealWithdrawnLPATemplateName,
		personalisation
	);
	const mappedPageContent = checkAndConfirmPage(
		currentAppeal,
		request.session,
		appealWithdrawnAppellantTemplate,
		appealWithdrawnLPATemplate
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
