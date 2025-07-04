import { createNewDocument } from '#app/components/file-uploader.component.js';
import { postDocumentUpload } from '#appeals/appeal-documents/appeal-documents.controller.js';
import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dayMonthYearHourMinuteToDisplayDate } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	postDateSubmittedFactory,
	postRedactionStatusFactory,
	renderRedactionStatusFactory
} from '../common/index.js';
import {
	isValidRedactionStatus,
	name as redactionStatusFieldName,
	statusFormatMap
} from '../common/redaction-status.js';
import { ipAddressPage } from '../interested-party-comments.mapper.js';
import { getAttachmentsFolder } from '../interested-party-comments.service.js';
import {
	checkAddressPage,
	ipDetailsPage,
	mapSessionToRepresentationRequest,
	uploadPage
} from './add-ip-comment.mapper.js';
import { postRepresentationComment } from './add-ip-comment.service.js';
import { APPEAL_REDACTED_STATUS } from 'pins-data-model';
import { dateSubmitted } from './add-ip-comment.mapper.js';
import { getDocumentRedactionStatuses } from '#appeals/appeal-documents/appeal.documents.service.js';
import { mapFileUploadInfoToMappedDocuments } from '#lib/mappers/utils/file-upload-info-to-documents.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderIpDetails(request, response) {
	const {
		currentAppeal,
		errors,
		session: { addIpComment }
	} = request;
	const values = {
		firstName: addIpComment?.firstName,
		lastName: addIpComment?.lastName,
		emailAddress: addIpComment?.emailAddress
	};
	const pageContent = ipDetailsPage(currentAppeal, values, request, errors);
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
	const {
		currentAppeal,
		errors,
		session: { addIpComment }
	} = request;
	const value = addIpComment?.addressProvided;
	const pageContent = checkAddressPage(currentAppeal, value, errors);

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
	const {
		currentAppeal,
		errors,
		session: { addIpComment }
	} = request;
	const address = {
		addressLine1: addIpComment?.addressLine1,
		addressLine2: addIpComment?.addressLine2,
		town: addIpComment?.town,
		county: addIpComment?.county,
		postCode: addIpComment?.postCode
	};
	const operationType = request.query.editAddress === 'true' ? 'update' : 'add';
	const pageContent = ipAddressPage(
		currentAppeal,
		address,
		errors,
		'add/check-address',
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
	const providedAddress = request.session.addIpComment?.addressProvided === 'yes';

	const { folderId } = await getAttachmentsFolder(apiClient, currentAppeal.appealId);
	const pageContent = uploadPage(currentAppeal, errors, providedAddress, folderId, fileUploadInfo);

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
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/redaction-status`
	});
}

export const renderRedactionStatus = renderRedactionStatusFactory({
	getBackLinkUrl: (appealDetails) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/upload`,
	getValue: (request) =>
		request.session.addIpComment?.redactionStatus ||
		request.body.redactionStatus ||
		APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
});

export const postRedactionStatus = postRedactionStatusFactory({
	getRedirectUrl: (appealDetails) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/date-submitted`,
	errorHandler: renderRedactionStatus
});

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export function renderDateSubmitted(request, response) {
	const { currentAppeal, errors, session, body } = request;

	const pageContent = dateSubmitted(
		currentAppeal,
		errors,
		session.addIpComment || body,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/redaction-status`
	);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		errors,
		pageContent
	});
}

export const postDateSubmitted = postDateSubmittedFactory({
	getRedirectUrl: (appealDetails) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/check-your-answers`,
	errorHandler: renderDateSubmitted
});

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
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/check-address`
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
		addressProvided === 'yes'
			? `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/ip-address`
			: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/upload`
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
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/upload`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postIPComment(request, response) {
	try {
		const { apiClient, currentAppeal } = request;

		const { folderId } = await getAttachmentsFolder(request.apiClient, currentAppeal.appealId);
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
		const payload = mapSessionToRepresentationRequest(
			request.session?.addIpComment,
			request.session?.fileUploadInfo
		);

		const redactionStatus = request.session?.addIpComment?.redactionStatus;
		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		if (!redactionStatuses) throw new Error('Redaction statuses could not be retrieved');
		const redactionStatusId = redactionStatuses.find(({ key }) => redactionStatus === key)?.id;
		if (!redactionStatusId) {
			throw new Error(
				'Submitted redaction status did not correspond with a known redaction status key'
			);
		}

		const addDocumentsRequestPayload = mapFileUploadInfoToMappedDocuments({
			caseId: currentAppeal.appealId,
			folderId,
			redactionStatus: redactionStatusId,
			fileUploadInfo: request.session.fileUploadInfo
		});

		try {
			await createNewDocument(
				request.apiClient,
				currentAppeal.appealId,
				addDocumentsRequestPayload
			);

			await postRepresentationComment(request.apiClient, currentAppeal.appealId, payload);

			delete request.session.addIpComment;
			delete request.session.fileUploadInfo;

			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'interestedPartyCommentAdded',
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
export async function renderCheckYourAnswers(
	{
		errors,
		currentAppeal: { appealReference, appealId } = {},
		session: {
			fileUploadInfo: { files: [{ name, blobStoreUrl }] } = {
				files: [{ name: '', blobStoreUrl: '' }]
			},
			addIpComment: {
				[redactionStatusFieldName]: redactionStatus,
				'date-day': day,
				'date-month': month,
				'date-year': year,
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
				redactionStatus: APPEAL_REDACTED_STATUS.NOT_REDACTED,
				'date-day': '',
				'date-month': '',
				'date-year': '',
				firstName: '',
				lastName: '',
				emailAddress: '',
				addressProvided: '',
				addressLine1: '',
				addressLine2: '',
				town: '',
				county: '',
				postCode: ''
			}
		}
	},
	response
) {
	if (!isValidRedactionStatus(redactionStatus)) {
		throw new Error('Received invalid redaction status');
	}

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and add interested party comment',
			heading: 'Check details and add interested party comment',
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/interested-party-comments/add/date-submitted`,
			submitButtonText: 'Add comment',
			responses: {
				'Contact details': {
					html: `${firstName || ''} ${lastName || ''}<br>${emailAddress || ''}`,
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/add/ip-details`,
							visuallyHiddenText: 'Contact details'
						}
					}
				},
				'Address Provided': {
					html: addressProvided === 'no' ? 'No' : 'Yes',
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/add/check-address`,
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
								href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/add/ip-address`,
								visuallyHiddenText: 'Address provided'
							}
						}
					}
				}),
				Comment: {
					html: `<a class="govuk-link" download href="${blobStoreUrl ?? ''}">${name ?? ''}</a>`,
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/add/upload`,
							visuallyHiddenText: 'Comment'
						}
					}
				},
				'Redaction status': {
					value: statusFormatMap[redactionStatus],
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/add/redaction-status`,
							visuallyHiddenText: 'Redaction Status'
						}
					}
				},
				'Date submitted': {
					value: dayMonthYearHourMinuteToDisplayDate({ day, month, year }),
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/add/date-submitted`,
							visuallyHiddenText: 'Date submitted'
						}
					}
				}
			}
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
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/ip-details`
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
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`
	);
}
