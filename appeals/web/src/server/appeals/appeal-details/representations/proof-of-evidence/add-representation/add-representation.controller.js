import { createNewDocument } from '#app/components/file-uploader.component.js';
import {
	postDocumentUpload as postDocumentUploadHelper,
	renderDocumentUpload as renderDocumentUploadHelper
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { getDocumentRedactionStatuses } from '#appeals/appeal-documents/appeal.documents.service.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { clearEdits, editLink, isAtEditEntrypoint } from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import config from '@pins/appeals.web/environment/config.js';
import { APPEAL_DOCUMENT_TYPE, APPEAL_REDACTED_STATUS } from '@planning-inspectorate/data-model';
import { formatProofOfEvidenceTypeText } from '../view-and-review/view-and-review.mapper.js';
import { postRepresentationProofOfEvidence } from './add-representation.service.js';

/** @type {import('@pins/express').RequestHandler<{}>}  */
export const renderDocumentUpload = async (request, response) => {
	const {
		currentAppeal,
		params: { proofOfEvidenceType },
		query
	} = request;

	const baseUrl = request.baseUrl;

	const backButtonUrl = isAtEditEntrypoint(request)
		? preserveQueryString(request, `${baseUrl}/check-your-answers`, {
				exclude: ['editEntrypoint']
		  })
		: query.backUrl
		? String(query.backUrl)
		: `/appeals-service/appeal-details/${currentAppeal.appealId}`;

	return renderDocumentUploadHelper({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl,
		documentTitle: 'Proof of evidence and witnesses',
		nextPageUrl: `${baseUrl}/check-your-answers`,
		preHeadingTextOverride: 'Proof of evidence and witnesses',
		pageHeadingTextOverride: 'Proof of evidence and witnesses',
		uploadContainerHeadingTextOverride: 'Upload proof of evidence and witnesses',
		allowMultipleFiles: true,
		documentType:
			proofOfEvidenceType === 'lpa'
				? APPEAL_DOCUMENT_TYPE.LPA_PROOF_OF_EVIDENCE
				: APPEAL_DOCUMENT_TYPE.APPELLANT_PROOF_OF_EVIDENCE
	});
};

/**
 * @type {import('@pins/express/types/express.js').RequestHandler<{}>}
 */
export const postDocumentUpload = async (request, response) => {
	const baseUrl = request.baseUrl;

	await postDocumentUploadHelper({
		request,
		response,
		nextPageUrl: `${baseUrl}/check-your-answers`
	});
};

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
			}
		},
		params: { proofOfEvidenceType }
	} = request;
	const baseUrl = request.baseUrl;

	clearEdits(request, 'addDocument');

	return renderCheckYourAnswersComponent(
		{
			title: `Check details and add ${formatProofOfEvidenceTypeText(
				proofOfEvidenceType
			)} proof of evidence and witnesses`,
			heading: `Check details and add ${formatProofOfEvidenceTypeText(
				proofOfEvidenceType
			)} proof of evidence and witnesses`,
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: baseUrl,
			submitButtonText: `Add ${formatProofOfEvidenceTypeText(
				proofOfEvidenceType
			)} proof of evidence and witnesses`,
			responses: {
				'Proof of evidence and witnesses': {
					html: `<a class="govuk-link" download href="${blobStoreUrl ?? ''}">${name ?? ''}</a>`,
					actions: {
						Change: {
							href: editLink(baseUrl),
							visuallyHiddenText: 'proof of evidence and witnesses'
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
		params: { proofOfEvidenceType }
	} = request;

	const {
		fileUploadInfo: {
			files: [document],
			folderId
		}
	} = session;

	/**@type {import('../../../../../lib/mappers/index.js').NotificationBannerDefinitionKey} */
	try {
		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		if (!redactionStatuses) throw new Error('Redaction statuses could not be retrieved');

		const redactionStatusId = redactionStatuses.find(
			({ key }) => APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED === key
		)?.id;

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
						receivedDate: new Date().toISOString(),
						redactionStatusId,
						blobStoragePath: document.blobStoreUrl
					}
				]
			});
			await postRepresentationProofOfEvidence(
				apiClient,
				appealId,
				[document.GUID],
				proofOfEvidenceType
			);
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

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey:
			proofOfEvidenceType === 'lpa'
				? 'lpaProofOfEvidenceDocumentAddedSuccess'
				: 'appellantProofOfEvidenceDocumentAddedSuccess',
		appealId
	});
	return response.redirect(nextPageUrl);
};
