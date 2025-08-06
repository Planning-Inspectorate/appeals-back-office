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
import {
	checkAndConfirmPage,
	dateWithdrawalRequestPage,
	manageWithdrawalRequestFolderPage,
	withdrawalDocumentRedactionStatusPage
} from './withdrawal.mapper.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import {
	dayMonthYearHourMinuteToISOString,
	dateISOStringToDayMonthYearHourMinute
} from '#lib/dates.js';

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
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/withdrawal/withdrawal-request-date`
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
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/withdrawal/withdrawal-request-date`,
		pageHeadingTextOverride: `Upload appellant's withdrawal request`,
		allowMultipleFiles: false
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getDateWithdrawalRequest = async (request, response) => {
	return renderDateWithdrawalRequest(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postDateWithdrawalRequest = async (request, response) => {
	const { currentAppeal } = request;
	if (!currentAppeal || currentAppeal.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN) {
		return response.status(404).render('app/404');
	}

	try {
		const { appealId } = request.params;
		const {
			'withdrawal-request-date-day': day,
			'withdrawal-request-date-month': month,
			'withdrawal-request-date-year': year
		} = request.body;
		const { errors } = request;

		if (errors) {
			return renderDateWithdrawalRequest(request, response);
		}

		const withdrawalRequestDate = dayMonthYearHourMinuteToISOString({ day, month, year });

		/** @type {import('./withdrawal.types.js').WithdrawalRequest} */
		request.session.withdrawal = {
			...request.session.withdrawal,
			withdrawalRequestDate
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/withdrawal/redaction-status`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderDateWithdrawalRequest = async (request, response) => {
	const { errors, currentAppeal, session } = request;

	if (!currentAppeal || currentAppeal.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN) {
		return response.status(404).render('app/404');
	}

	if (!objectContainsAllKeys(session, ['fileUploadInfo'])) {
		return response.status(500).render('app/500.njk');
	}

	/** @type {import('./withdrawal.types.js').WithdrawalRequest} */
	request.session.withdrawal = {
		...session.withdrawal,
		documentId: session.fileUploadInfo.files[0].GUID
	};

	let withdrawalRequestDay = request.body['withdrawal-request-date-day'];
	let withdrawalRequestMonth = request.body['withdrawal-request-date-month'];
	let withdrawalRequestYear = request.body['withdrawal-request-date-year'];

	if (!withdrawalRequestDay || !withdrawalRequestMonth || !withdrawalRequestYear) {
		if (request.session.withdrawal?.withdrawalRequestDate) {
			const { day, month, year } = dateISOStringToDayMonthYearHourMinute(
				request.session.withdrawal.withdrawalRequestDate
			);

			withdrawalRequestDay = day;
			withdrawalRequestMonth = month;
			withdrawalRequestYear = year;
		}
	}

	const mappedPageContent = dateWithdrawalRequestPage(
		currentAppeal,
		withdrawalRequestDay,
		withdrawalRequestMonth,
		withdrawalRequestYear,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getRedactionStatus = async (request, response) => {
	return renderRedactionStatus(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRedactionStatus = async (request, response) => {
	const { currentAppeal } = request;
	if (!currentAppeal || currentAppeal.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN) {
		return response.status(404).render('app/404');
	}

	try {
		const { appealId } = request.params;
		const { 'withdrawal-redaction-status': redactionStatus } = request.body;
		const { errors } = request;

		if (errors) {
			return renderRedactionStatus(request, response);
		}

		/** @type {import('./withdrawal.types.js').WithdrawalRequest} */
		request.session.withdrawal = {
			...request.session.withdrawal,
			redactionStatus
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/withdrawal/check-your-answers`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderRedactionStatus = async (request, response) => {
	const { apiClient, errors, currentAppeal, session } = request;

	if (!currentAppeal || currentAppeal.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN) {
		return response.status(404).render('app/404');
	}

	if (!objectContainsAllKeys(session, ['fileUploadInfo', 'withdrawal'])) {
		return response.status(500).render('app/500.njk');
	}

	const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

	const mappedPageContent = withdrawalDocumentRedactionStatusPage(
		currentAppeal,
		redactionStatuses,
		session.withdrawal
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
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

		if (!objectContainsAllKeys(request.session, ['fileUploadInfo', 'withdrawal'])) {
			return response.status(500).render('app/500.njk');
		}

		request.currentFolder = {
			folderId: currentAppeal.withdrawal?.withdrawalFolder?.folderId,
			path: `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`
		};

		if (errors) {
			return renderCheckYourAnswers(request, response);
		}

		const { documentId, redactionStatus } = request.session.withdrawal;

		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		addDocumentDetailsFormDataToFileUploadInfo(
			{ items: [{ documentId, receivedDate: {}, redactionStatus }] },
			request.session.fileUploadInfo.files,
			redactionStatuses
		);

		await postUploadDocumentsCheckAndConfirm({ request, response });

		await postWithdrawalRequest(
			request.apiClient,
			appealId,
			request.session.withdrawal.withdrawalRequestDate
		);

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
	if (!objectContainsAllKeys(session, ['fileUploadInfo', 'withdrawal'])) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = checkAndConfirmPage(currentAppeal, request.session);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
