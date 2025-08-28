import { createNewDocument } from '#app/components/file-uploader.component.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dayMonthYearHourMinuteToDisplayDate } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import config from '@pins/appeals.web/environment/config.js';
import {
	isValidRedactionStatus,
	name as redactionStatusFieldName,
	statusFormatMap
} from '#appeals/appeal-details/representations/interested-party-comments/common/redaction-status.js';
import { getDocumentRedactionStatuses } from '#appeals/appeal-documents/appeal.documents.service.js';
import { patchRepresentationAttachments } from '../../final-comments/final-comments.service.js';
import { clearEdits, editLink } from '#lib/edit-utilities.js';

/**
 * @param {import('@pins/express').Request} request
 * @param {import('express').Response} response
 */
export const renderCheckYourAnswers = (request, response) => {
	const {
		errors,
		currentAppeal: { appealReference },
		session: {
			fileUploadInfo: {
				files: [{ name, blobStoreUrl }]
			},
			addDocument: { [redactionStatusFieldName]: redactionStatus, day, month, year }
		}
	} = request;
	const baseUrl = request.baseUrl;

	if (!isValidRedactionStatus(redactionStatus)) {
		throw new Error('Received invalid redaction status');
	}

	clearEdits(request, 'addDocument');

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and add document',
			heading: 'Check details and add document',
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `${baseUrl}/date-submitted`,
			submitButtonText: 'Add document',
			responses: {
				'Supporting document': {
					html: `<a class="govuk-link" download href="${blobStoreUrl ?? ''}">${name ?? ''}</a>`,
					actions: {
						Change: {
							href: editLink(baseUrl),
							visuallyHiddenText: 'supporting document'
						}
					}
				},
				'Redaction status': {
					value: statusFormatMap[redactionStatus],
					actions: {
						Change: {
							href: editLink(baseUrl, 'redaction-status'),
							visuallyHiddenText: 'redaction status'
						}
					}
				},
				'Date submitted': {
					value: dayMonthYearHourMinuteToDisplayDate({ day, month, year }),
					actions: {
						Change: {
							href: editLink(baseUrl, 'date-submitted'),
							visuallyHiddenText: 'date submitted'
						}
					}
				}
			}
		},
		response,
		errors
	);
};

/**
 * @type {import('@pins/express').RequestHandler<{}>}
 */
export const postCheckYourAnswers = async (request, response) => {
	const {
		apiClient,
		session,
		currentAppeal: { appealId },
		currentRepresentation: { id, representationType }
	} = request;

	const {
		fileUploadInfo: {
			files: [document],
			folderId
		},
		addDocument: { [redactionStatusFieldName]: redactionStatus, day, month, year }
	} = session;

	try {
		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		if (!redactionStatuses) throw new Error('Redaction statuses could not be retrieved');

		const redactionStatusId = redactionStatuses.find(({ key }) => redactionStatus === key)?.id;

		if (!redactionStatusId) {
			throw new Error(
				'Submitted redaction status did not correspond with a known redaction status key'
			);
		}

		try {
			await createNewDocument(apiClient, appealId, {
				blobStorageHost:
					config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
				blobStorageContainer: config.blobStorageDefaultContainer,
				documents: [
					{
						caseId: appealId,
						documentName: document.name,
						documentType: document.documentType,
						mimeType: document.mimeType,
						documentSize: document.size,
						stage: document.stage,
						folderId: folderId,
						GUID: document.GUID,
						receivedDate: new Date(`${year}-${month}-${day}`).toISOString(),
						redactionStatusId,
						blobStoragePath: document.blobStoreUrl
					}
				]
			});

			await patchRepresentationAttachments(apiClient, appealId, id, [document.GUID]);
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
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}

	delete session.fileUploadInfo;

	let nextPageUrl = request.baseUrl.split('/').slice(0, -1).join('/');

	/**@type {import('../../../../../lib/mappers/index.js').NotificationBannerDefinitionKey} */
	let bannerDefinitionKey;

	switch (representationType) {
		case 'comment':
			nextPageUrl = `${nextPageUrl}/review`;
			bannerDefinitionKey = 'interestedPartyCommentsDocumentAddedSuccess';
			break;
		case 'lpa_statement':
			bannerDefinitionKey = 'lpaStatementDocumentAddedSuccess';
			break;
		default:
			bannerDefinitionKey = 'finalCommentsDocumentAddedSuccess';
			break;
	}

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey: bannerDefinitionKey,
		appealId
	});
	return response.redirect(nextPageUrl);
};
