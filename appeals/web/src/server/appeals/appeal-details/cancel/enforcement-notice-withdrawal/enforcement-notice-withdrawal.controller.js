import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import {
	postDocumentUpload as postDocumentUploadToApi,
	renderDocumentUpload
} from '../../../appeal-documents/appeal-documents.controller.js';
import { getAttachmentsFolder } from '../../../appeal-documents/appeal.documents.service.js';

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
