import { createNewDocument } from '#app/components/file-uploader.component.js';
import {
	postDocumentDetails as postDocumentDetailsHelper,
	postDocumentUpload,
	renderDocumentDetails as renderDocumentDetailsHelper
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { getDocumentRedactionStatuses } from '#appeals/appeal-documents/appeal.documents.service.js';
import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { clearEdits, editLink, getSessionValues } from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { redactionStatusKeyToId } from '#lib/redaction-statuses.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import config from '@pins/appeals.web/environment/config.js';
import { APPEAL_CASE_STATUS, APPEAL_REDACTED_STATUS } from '@planning-inspectorate/data-model';
import { getAttachmentsFolder } from '../../document-attachments/attachments-service.js';
import { postRepresentation } from '../../representations.service.js';
import { ipAddressPage } from '../interested-party-comments.mapper.js';
import {
	checkAddressPage,
	generateCheckAnswersCommentPageComponents,
	ipDetailsPage,
	mapSessionToRepresentationRequest,
	uploadPage
} from './add-ip-comment.mapper.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem} FileUploadInfoItem */

const getBackLinkUrl = backLinkGenerator('addIpComment');

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderIpDetails(request, response) {
	const { currentAppeal, errors } = request;
	const addIpComment = getSessionValues(request, 'addIpComment');
	const values = {
		firstName: addIpComment?.firstName,
		lastName: addIpComment?.lastName,
		emailAddress: addIpComment?.emailAddress
	};
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`;
	const backUrl = getBackLinkUrl(request, null, `${baseUrl}/add/check-your-answers`, baseUrl);
	const pageContent = ipDetailsPage(currentAppeal, values, backUrl, errors);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		errors: errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderCheckAddress(request, response) {
	const { currentAppeal, errors } = request;
	const addIpComment = getSessionValues(request, 'addIpComment');
	const value = addIpComment?.addressProvided;
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`;
	const backUrl = getBackLinkUrl(
		request,
		`${baseUrl}/add/ip-details`,
		`${baseUrl}/add/check-your-answers`
	);
	const pageContent = checkAddressPage(currentAppeal, value, backUrl, errors);

	return response.status(errors ? 400 : 200).render('patterns/check-and-confirm-page.pattern.njk', {
		errors: errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderIpAddress(request, response) {
	const { currentAppeal, errors } = request;
	const addIpComment = getSessionValues(request, 'addIpComment');
	const address = {
		addressLine1: addIpComment?.addressLine1,
		addressLine2: addIpComment?.addressLine2,
		town: addIpComment?.town,
		county: addIpComment?.county,
		postCode: addIpComment?.postCode
	};
	const operationType = request.query.editAddress === 'true' ? 'update' : 'add';
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add`;
	const pageContent = ipAddressPage(
		currentAppeal,
		address,
		errors,
		getBackLinkUrl(request, `${baseUrl}/check-address`, `${baseUrl}/check-your-answers`),
		operationType
	);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		errors: errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderUpload(request, response) {
	const {
		apiClient,
		currentAppeal,
		errors,
		session: { fileUploadInfo }
	} = request;
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add`;
	const providedAddress = request.session.addIpComment?.addressProvided === 'yes';
	const slug = providedAddress ? 'ip-address' : 'check-address';
	const backUrl = getBackLinkUrl(request, `${baseUrl}/${slug}`, `${baseUrl}/check-your-answers`);

	const { folderId } = await getAttachmentsFolder(apiClient, currentAppeal.appealId);
	const pageContent = uploadPage(currentAppeal, errors, backUrl, folderId, fileUploadInfo);

	return response
		.status(errors ? 400 : 200)
		.render('appeals/documents/document-upload.njk', pageContent);
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function postUpload(request, response) {
	const { currentAppeal } = request;

	request.currentFolder = await getAttachmentsFolder(request.apiClient, currentAppeal.appealId);

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/add-document-details`
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderDocumentDetails(request, response) {
	const {
		currentAppeal,
		locals: { pageContent }
	} = request;

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add`;
	const backLinkUrl = getBackLinkUrl(request, `${baseUrl}/upload`, `${baseUrl}/check-your-answers`);

	request.currentFolder = await getAttachmentsFolder(request.apiClient, currentAppeal.appealId);

	return await renderDocumentDetailsHelper({
		request,
		response,
		backLinkUrl,
		pageHeadingTextOverride:
			pageContent?.addDocument?.pageHeadingTextOverride ||
			`Appeal ${currentAppeal.appealReference}: Interested party comments`
	});
}

/**
 * @type {import('@pins/express/types/express.js').RequestHandler<{}>}
 */
export async function postDocumentDetails(request, response) {
	const { currentAppeal } = request;

	request.currentFolder = await getAttachmentsFolder(request.apiClient, currentAppeal.appealId);

	if (!currentAppeal || !request.currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add`;
	const backLinkUrl = getBackLinkUrl(request, `${baseUrl}/upload`, `${baseUrl}/check-your-answers`);

	const nextPageUrl = preserveQueryString(request, `${baseUrl}/check-your-answers`);

	return await postDocumentDetailsHelper({
		request,
		response,
		backLinkUrl,
		nextPageUrl,
		pageHeadingTextOverride: `Appeal ${currentAppeal.appealReference}: Interested party comments`
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postIpDetails(request, response) {
	if (request.errors) {
		return renderIpDetails(request, response);
	}

	const { currentAppeal } = request;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/check-address`
		)
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postCheckAddress(request, response) {
	if (request.errors) {
		return renderCheckAddress(request, response);
	}

	const { currentAppeal } = request;
	const { addressProvided } = request.body;

	return response.redirect(
		preserveQueryString(
			request,
			addressProvided === 'yes'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/ip-address`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/upload`
		)
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postIpAddress(request, response) {
	if (request.errors) {
		return renderIpAddress(request, response);
	}

	const { currentAppeal } = request;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/upload`
		)
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postIPComment(request, response) {
	try {
		const {
			apiClient,
			currentAppeal,
			session: { fileUploadInfo }
		} = request;

		const { folderId } = await getAttachmentsFolder(request.apiClient, currentAppeal.appealId);

		const { files: uploadFiles } = fileUploadInfo;

		if (request.session?.addIpComment) {
			request.session.addIpComment = {
				...request.session.addIpComment,
				day: request.session.addIpComment['date-day'],
				month: request.session.addIpComment['date-month'],
				year: request.session.addIpComment['date-year']
			};
			delete request.session.addIpComment['date-day'];
			delete request.session.addIpComment['date-month'];
			delete request.session.addIpComment['date-year'];
		}

		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		if (!redactionStatuses) throw new Error('Redaction statuses could not be retrieved');

		const noRedactionRequiredStatusId = redactionStatusKeyToId(
			redactionStatuses,
			APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
		);

		if (!noRedactionRequiredStatusId) {
			throw new Error('Default redaction status not found.');
		}

		const payload = mapSessionToRepresentationRequest(
			request.session?.addIpComment,
			request.session?.fileUploadInfo,
			redactionStatuses
		);

		/** @type {import('@pins/appeals/index.js').AddDocumentsRequest} */
		const addDocumentsRequestPayload = {
			blobStorageHost:
				config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
			blobStorageContainer: config.blobStorageDefaultContainer,
			appellantCaseId: Number(currentAppeal.appellantCaseId),
			documents: uploadFiles.map(
				(/** @type {import('#lib/ts-utilities.js').FileUploadInfoItem} */ document) => {
					/** @type {import('@pins/appeals/index.js').MappedDocument} */
					const mappedDocument = {
						caseId: currentAppeal.appealId,
						documentName: document.name,
						documentType: document.documentType,
						mimeType: document.mimeType,
						documentSize: document.size,
						stage: document.stage,
						folderId,
						GUID: document.GUID,
						receivedDate: document.receivedDate,
						redactionStatusId: document.redactionStatus || noRedactionRequiredStatusId,
						blobStoragePath: document.blobStoreUrl
					};

					return mappedDocument;
				}
			)
		};

		try {
			await createNewDocument(
				request.apiClient,
				currentAppeal.appealId,
				addDocumentsRequestPayload
			);

			await postRepresentation(request.apiClient, currentAppeal.appealId, payload, 'comment');

			delete request.session.addIpComment;
			delete request.session.fileUploadInfo;

			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: isStatePassed(currentAppeal, APPEAL_CASE_STATUS.STATEMENTS)
					? 'interestedPartyCommentAddedAndShared'
					: 'interestedPartyCommentAdded',
				appealId: currentAppeal.appealId
			});

			redirectToIPComments(request, response);
		} catch (error) {
			logger.error(
				error,
				error instanceof Error
					? error.message
					: 'An error occurred while attempting to submit a document.'
			);

			return response.redirect(
				`/appeals-service/error?errorType=fileTypesDoNotMatch&backUrl=${request.originalUrl}`
			);
		}
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when submitting the add ip comments check and confirm page'
		);
	}
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderCheckYourAnswers(request, response) {
	const {
		errors,
		currentAppeal: { appealReference, appealId } = {},
		session: {
			addIpComment: {
				firstName,
				lastName,
				emailAddress,
				addressProvided,
				addressLine1,
				addressLine2,
				town,
				county,
				postCode
			} = {
				firstName: '',
				lastName: '',
				emailAddress: '',
				addressProvided: '',
				addressLine1: '',
				addressLine2: '',
				town: '',
				county: '',
				postCode: ''
			},
			fileUploadInfo
		}
	} = request;

	clearEdits(request, 'addIpComment');

	const { files: uploadFiles } = fileUploadInfo;

	const baseUrl = `/appeals-service/appeal-details/${appealId}/interested-party-comments/add`;

	const redactionStatuses = await getDocumentRedactionStatuses(request.apiClient);
	if (!redactionStatuses) throw new Error('Redaction statuses could not be retrieved');

	const commentPageComponents = generateCheckAnswersCommentPageComponents(
		uploadFiles,
		appealReference,
		baseUrl,
		redactionStatuses
	);

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and add interested party comment',
			heading: 'Check details and add interested party comment',
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/interested-party-comments/add/add-document-details`,
			submitButtonText: 'Add comment',
			responses: {
				'Contact details': {
					html: `${firstName || ''} ${lastName || ''}<br>${emailAddress || ''}`,
					actions: {
						Change: {
							href: editLink(baseUrl, 'ip-details'),
							visuallyHiddenText: 'Contact details'
						}
					}
				},
				'Address Provided': {
					html: addressProvided === 'no' ? 'No' : 'Yes',
					actions: {
						Change: {
							href: editLink(baseUrl, 'check-address'),
							visuallyHiddenText: 'Address'
						}
					}
				},
				...(addressProvided !== 'no' && {
					Address: {
						html: addressToMultilineStringHtml({
							addressLine1,
							addressLine2,
							town,
							county,
							postCode
						}),
						actions: {
							Change: {
								href: editLink(baseUrl, 'ip-address'),
								visuallyHiddenText: 'Address provided'
							}
						}
					}
				})
			},
			after: commentPageComponents
		},
		response,
		errors
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function redirectToAdd(request, response) {
	const { currentAppeal } = request;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/ip-details`
		)
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function redirectToIPComments(request, response) {
	const { currentAppeal } = request;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`
		)
	);
}
