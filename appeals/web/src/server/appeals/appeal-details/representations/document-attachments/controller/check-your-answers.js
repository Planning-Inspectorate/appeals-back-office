import { createNewDocument } from '#app/components/file-uploader.component.js';
import {
	isValidRedactionStatus,
	name as redactionStatusFieldName,
	statusFormatMap
} from '#appeals/appeal-details/representations/interested-party-comments/common/redaction-status.js';
import { getDocumentRedactionStatuses } from '#appeals/appeal-documents/appeal.documents.service.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dayMonthYearHourMinuteToDisplayDate } from '#lib/dates.js';
import { clearEdits, editLink } from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { mapFileUploadInfoToMappedDocuments } from '#lib/mappers/utils/file-upload-info-to-documents.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	APPEAL_REPRESENTATION_TYPE,
	REPRESENTATION_ADDED_AS_DOCUMENT
} from '@pins/appeals/constants/common.js';
import { APPEAL_REPRESENTATION_STATUS } from '@planning-inspectorate/data-model';
import { patchRepresentationAttachments } from '../../document-attachments/attachments-service.js';
import { postRepresentation } from '../../representations.service.js';

/** @typedef {import('#appeals/appeal-details/representations/types.js').RepresentationRequest} RepresentationRequest */
/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').AppealRule6Party} AppealRule6Party */

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
			addDocument
		},
		locals: { pageContent }
	} = request;

	const redactionStatus = addDocument[redactionStatusFieldName];
	const day = addDocument['date-day'];
	const month = addDocument['date-month'];
	const year = addDocument['date-year'];
	const baseUrl = request.baseUrl;

	if (!isValidRedactionStatus(redactionStatus)) {
		throw new Error('Received invalid redaction status');
	}

	clearEdits(request, 'addDocument');

	return renderCheckYourAnswersComponent(
		{
			title:
				pageContent?.checkYourAnswer?.pageHeadingTextOverride || 'Check details and add document',
			heading:
				pageContent?.checkYourAnswer?.pageHeadingTextOverride || 'Check details and add document',
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `${baseUrl}/date-submitted`,
			submitButtonText: pageContent?.checkYourAnswer?.submitButtonTextOverride || 'Add document',
			responses: {
				[pageContent?.checkYourAnswer?.supportingDocumentTextOverride || 'Supporting document']: {
					html: `<a class="govuk-link" download href="${blobStoreUrl ?? ''}">${name ?? ''}</a>`,
					actions: {
						Change: {
							href: editLink(baseUrl),
							visuallyHiddenText: 'supporting document'
						}
					}
				},
				'Redaction status': {
					// @ts-ignore
					value: statusFormatMap[redactionStatus],
					actions: {
						Change: {
							href: editLink(baseUrl, 'redaction-status'),
							visuallyHiddenText: 'redaction status'
						}
					}
				},
				[pageContent?.checkYourAnswer?.dateSubmittedTextOverride || 'Date submitted']: {
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
		currentAppeal,
		currentRepresentation,
		params: { rule6PartyId }
	} = request;
	const { appealId } = currentAppeal;

	const representationType =
		currentRepresentation?.representationType ?? getRepresentationType(request.baseUrl);
	const id = currentRepresentation?.id;

	if (
		session.createNewRepresentation &&
		onlySingularRepresentationAllowed(representationType, currentRepresentation?.status)
	) {
		return response.status(409).render('app/409.njk');
	}

	const rule6Party = currentAppeal.appealRule6Parties?.find(
		(/** @type {AppealRule6Party} */ { id }) => id === Number(rule6PartyId)
	);

	const {
		fileUploadInfo: {
			files: [document],
			folderId
		},
		addDocument
	} = session;

	const redactionStatus = addDocument[redactionStatusFieldName];
	const day = addDocument['date-day'];
	const month = addDocument['date-month'];
	const year = addDocument['date-year'];

	try {
		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		if (!redactionStatuses) throw new Error('Redaction statuses could not be retrieved');

		const redactionStatusId = redactionStatuses.find(({ key }) => redactionStatus === key)?.id;

		if (!redactionStatusId) {
			throw new Error(
				'Submitted redaction status did not correspond with a known redaction status key'
			);
		}

		const createdDate = new Date(`${year}-${month}-${day}`).toISOString();

		try {
			const addDocumentsRequestPayload = mapFileUploadInfoToMappedDocuments({
				caseId: appealId,
				folderId,
				redactionStatus: redactionStatusId,
				fileUploadInfo: session.fileUploadInfo
			});

			addDocumentsRequestPayload.documents = addDocumentsRequestPayload.documents.map((doc) => ({
				...doc,
				receivedDate: createdDate
			}));

			await createNewDocument(apiClient, appealId, addDocumentsRequestPayload);

			const representedId = rule6Party?.serviceUserId;

			const payload = buildPayload(
				representationType,
				document.GUID,
				redactionStatus,
				createdDate,
				representedId
			);
			session.createNewRepresentation
				? await postRepresentation(request.apiClient, appealId, payload, representationType)
				: await patchRepresentationAttachments(apiClient, appealId, id, [document.GUID]);
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
	/** @type {string|undefined} */
	let bannerText = undefined;

	switch (representationType) {
		case 'comment':
			nextPageUrl = `${nextPageUrl}/review`;
			bannerDefinitionKey = 'interestedPartyCommentsDocumentAddedSuccess';
			break;
		case 'lpa_statement':
			bannerDefinitionKey = session.createNewRepresentation
				? 'lpaStatementAddedSuccess'
				: 'lpaStatementDocumentAddedSuccess';
			break;
		case 'lpa_proofs_evidence':
			if (!session.createNewRepresentation) {
				nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			}
			bannerDefinitionKey = 'lpaProofOfEvidenceDocumentAddedSuccess';
			break;

		case 'appellant_proofs_evidence':
			if (!session.createNewRepresentation) {
				nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			}
			bannerDefinitionKey = 'appellantProofOfEvidenceDocumentAddedSuccess';
			break;
		case 'lpa_final_comment':
			bannerDefinitionKey = session.createNewRepresentation
				? 'lpaFinalCommentsAddedSuccess'
				: 'finalCommentsDocumentAddedSuccess';
			break;
		case 'appellant_final_comment':
			bannerDefinitionKey = session.createNewRepresentation
				? 'appellantFinalCommentsAddedSuccess'
				: 'finalCommentsDocumentAddedSuccess';
			break;
		case 'rule_6_party_statement':
			bannerDefinitionKey = session.createNewRepresentation
				? 'rule6PartyStatementAddedSuccess'
				: 'rule6PartyStatementDocumentAddedSuccess';
			if (rule6Party && session.createNewRepresentation) {
				bannerText = `${rule6Party.serviceUser.organisationName} statement added`;
			}
			break;
		case 'rule_6_party_proofs_evidence':
			if (!session.createNewRepresentation) {
				nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			}
			bannerDefinitionKey = session.createNewRepresentation
				? 'rule6PartyProofOfEvidenceAddedSuccess'
				: 'rule6PartyProofOfEvidenceDocumentAddedSuccess';
			if (rule6Party && session.createNewRepresentation) {
				bannerText = `${rule6Party.serviceUser.organisationName} proof of evidence and witnesses added`;
			}
			break;
		default:
			bannerDefinitionKey = 'finalCommentsDocumentAddedSuccess';
			break;
	}

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey: bannerDefinitionKey,
		appealId,
		text: bannerText
	});

	if (session.createNewRepresentation) {
		delete session.createNewRepresentation;
	}

	return response.redirect(nextPageUrl);
};

/**
 * @param {string} representationType
 * @param {string} documentGuid
 * @param {string} redactionStatus
 * @param {string} createdDate
 * @param {number} [representedId]
 * @return {RepresentationRequest}
 */
export const buildPayload = (
	representationType,
	documentGuid,
	redactionStatus,
	createdDate,
	representedId
) => {
	const source = [
		APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
		APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT,
		APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
		APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT,
		APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
	].includes(representationType)
		? 'citizen'
		: 'lpa';

	return {
		attachments: [documentGuid],
		redactionStatus,
		source,
		dateCreated: createdDate,
		representationText:
			representationType === APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
				? null
				: REPRESENTATION_ADDED_AS_DOCUMENT,
		...(representedId ? { representedId } : {})
	};
};

/**
 * @param {string} url
 * @return {string}
 */
export const getRepresentationType = (url) => {
	const parts = url.split('/');

	const immediateParent = parts[parts.length - 2];
	const grandParent = parts[parts.length - 3];
	const greatGrandParent = parts[parts.length - 4];

	if (grandParent === 'final-comments') {
		return `${immediateParent}_final_comment`;
	}
	if (grandParent === 'rule-6-party-statement') {
		return 'rule_6_party_statement';
	}
	if (greatGrandParent === 'proof-of-evidence' && grandParent === 'rule-6-party') {
		return 'rule_6_party_proofs_evidence';
	}

	return immediateParent.replace(/-/g, '_');
};

/**
 * @param {string} representationType
 * @param {string} repStatus
 * @return {boolean}
 */
export const onlySingularRepresentationAllowed = (representationType, repStatus) => {
	return (
		[
			APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
			APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
			APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
			APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
		].includes(representationType) &&
		repStatus !== undefined &&
		repStatus !== APPEAL_REPRESENTATION_STATUS.INVALID
	);
};
