import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import {
	postDocumentUpload as postDocumentUploadToApi,
	renderDocumentUpload
} from '../../../appeal-documents/appeal-documents.controller.js';
import { getAttachmentsFolder } from '../../../appeal-documents/appeal.documents.service.js';
import { enforcementNoticeWithdrawalCheckDetailsPage } from './enforcement-notice-withdrawal-mapper.js';

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
		cancelUrl,
		`${cancelUrl}/enforcement-notice-withdrawal/check-details`
	);

	try {
		const folderPath = `${APPEAL_CASE_STAGE.CANCELLATION}/${APPEAL_DOCUMENT_TYPE.LPA_ENFORCEMENT_NOTICE_WITHDRAWAL}`;
		request.currentFolder = await getAttachmentsFolder(request.apiClient, appealId, folderPath);
	} catch {
		return response.status(404).render('app/404.njk');
	}

	const pageContent = enforcementNoticeWithdrawalCheckDetailsPage(
		currentAppeal,
		session.fileUploadInfo?.files,
		'', // TODO: Add appellant notify preview
		'', // TODO: Add lpa notify preview
		backLinkUrl
	);

	return response.render('patterns/check-and-confirm-page.pattern.njk', { pageContent });
};
