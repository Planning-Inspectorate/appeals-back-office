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
} from '../../common/redaction-status.js';
import { getDocumentRedactionStatuses } from '#appeals/appeal-documents/appeal.documents.service.js';

/**
 * @type {import('@pins/express').RenderHandler<{}>}
 */
export const renderCheckYourAnswers = (
	{
		errors,
		currentAppeal: { appealReference, appealId },
		currentRepresentation: { id: commentId },
		session: {
			fileUploadInfo: {
				files: [{ name, blobStoreUrl }]
			},
			addDocument: { [redactionStatusFieldName]: redactionStatus, day, month, year }
		}
	},
	response
) => {
	if (!isValidRedactionStatus(redactionStatus)) {
		throw new Error('Received invalid redaction status');
	}

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and add document',
			heading: 'Check details and add document',
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/add-document/date-submitted`,
			submitButtonText: 'Add document',
			responses: {
				'Supporting document': {
					html: `<a class="govuk-link" download href="${blobStoreUrl ?? ''}">${name ?? ''}</a>`,
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/add-document`,
							visuallyHiddenText: 'supporting document'
						}
					}
				},
				'Redaction status': {
					value: statusFormatMap[redactionStatus],
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/add-document/redaction-status`,
							visuallyHiddenText: 'redaction status'
						}
					}
				},
				'Date submitted': {
					value: dayMonthYearHourMinuteToDisplayDate({ day, month, year }),
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/add-document/date-submitted`,
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
export const postCheckYourAnswers = async (
	{ apiClient, session, currentAppeal: { appealId }, currentRepresentation: { id: commentId } },
	response
) => {
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

		if (!redactionStatusId)
			throw new Error(
				'Submitted redaction status did not correspond with a known redaction status key'
			);

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
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}

	delete session.fileUploadInfo;

	addNotificationBannerToSession(session, 'interestedPartyCommentsDocumentAddedSuccess', appealId);

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/review`
	);
};
