import logger from '#lib/logger.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import {
	postDocumentUpload as postDocumentUploadToApi,
	postUploadDocumentsCheckAndConfirm,
	renderDocumentUpload
} from '../../../appeal-documents/appeal-documents.controller.js';
import { addDocumentDetailsFormDataToFileUploadInfo } from '../../../appeal-documents/appeal-documents.mapper.js';
import {
	getAttachmentsFolder,
	getDocumentRedactionStatuses
} from '../../../appeal-documents/appeal.documents.service.js';
import { cancelAppealEnforcementNoticeWithdrawn } from '../cancel.service.js';
import { enforcementNoticeWithdrawalCheckDetailsPage } from './enforcement-notice-withdrawal-mapper.js';

const UNREDACTED_REDACTION_STATUS_ID = '2';

const getBackLinkUrl = backLinkGenerator('cancelAppeal');

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getDocumentUpload = async (request, response) => {
	return renderEnforcementNoticeWithdrawalUpload(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderEnforcementNoticeWithdrawalUpload = async (request, response) => {
	const { currentAppeal, params } = request;
	const { appealId } = params;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	try {
		const folderPath = `${APPEAL_CASE_STAGE.CANCELLATION}/${APPEAL_DOCUMENT_TYPE.LPA_ENFORCEMENT_NOTICE_WITHDRAWAL}`;
		request.currentFolder = await getAttachmentsFolder(request.apiClient, appealId, folderPath);
	} catch {
		return response.status(404).render('app/404.njk');
	}

	const cancelUrl = `/appeals-service/appeal-details/${appealId}/cancel`;
	const backButtonUrl = getBackLinkUrl(
		request,
		cancelUrl,
		`${cancelUrl}/enforcement-notice-withdrawal/check-details`
	);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl,
		nextPageUrl: `/appeals-service/appeal-details/${appealId}/cancel/enforcement-notice-withdrawal/check-details`,
		pageHeadingTextOverride: 'LPA enforcement notice withdrawal',
		uploadContainerHeadingTextOverride: 'Upload enforcement notice withdrawal',
		allowMultipleFiles: true
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postDocumentUpload = async (request, response) => {
	const { currentAppeal, params } = request;
	const { appealId } = params;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	try {
		const folderPath = `${APPEAL_CASE_STAGE.CANCELLATION}/${APPEAL_DOCUMENT_TYPE.LPA_ENFORCEMENT_NOTICE_WITHDRAWAL}`;
		request.currentFolder = await getAttachmentsFolder(request.apiClient, appealId, folderPath);
	} catch {
		return response.status(404).render('app/404.njk');
	}

	await postDocumentUploadToApi({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/cancel/enforcement-notice-withdrawal/check-details`
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckDetails = async (request, response) => {
	const { currentAppeal, params, session } = request;
	const { appealId } = params;

	const cancelUrl = `/appeals-service/appeal-details/${appealId}/cancel`;
	const backLinkUrl = getBackLinkUrl(
		request,
		`${cancelUrl}/enforcement-notice-withdrawal`,
		`${cancelUrl}/enforcement-notice-withdrawal/check-details`
	);

	try {
		const folderPath = `${APPEAL_CASE_STAGE.CANCELLATION}/${APPEAL_DOCUMENT_TYPE.LPA_ENFORCEMENT_NOTICE_WITHDRAWAL}`;
		request.currentFolder = await getAttachmentsFolder(request.apiClient, appealId, folderPath);
	} catch {
		return response.status(404).render('app/404.njk');
	}

	let appellantPreview = '';
	let lpaPreview = '';
	try {
		const notifyPreviews = await cancelAppealEnforcementNoticeWithdrawn(
			request.apiClient,
			appealId,
			true
		);
		appellantPreview = notifyPreviews.appellant;
		lpaPreview = notifyPreviews.lpa;
	} catch (error) {
		logger.error('Error generating notify previews', { error });
		return response.status(500).render('app/500.njk');
	}

	const pageContent = enforcementNoticeWithdrawalCheckDetailsPage(
		currentAppeal,
		session.fileUploadInfo?.files,
		appellantPreview,
		lpaPreview,
		backLinkUrl
	);

	return response.render('patterns/check-and-confirm-page.pattern.njk', { pageContent });
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckDetails = async (request, response) => {
	try {
		const { currentAppeal, apiClient, params } = request;
		const { appealId } = params;

		if (!objectContainsAllKeys(request.session, ['fileUploadInfo'])) {
			return response.status(500).render('app/500.njk');
		}

		request.currentFolder = {
			folderId: currentAppeal.withdrawal?.withdrawalFolder?.folderId,
			path: `${APPEAL_CASE_STAGE.CANCELLATION}/${APPEAL_DOCUMENT_TYPE.LPA_ENFORCEMENT_NOTICE_WITHDRAWAL}`
		};

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
		if (response.headersSent) return;

		await cancelAppealEnforcementNoticeWithdrawn(request.apiClient, appealId);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'issuedDecisionInvalid',
			appealId: currentAppeal.appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
