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
	REPRESENTATION_ADDED_AS_DOCUMENT,
} from '@pins/appeals/constants/common.js';
import { APPEAL_REPRESENTATION_STATUS } from '@planning-inspectorate/data-model';
import { patchRepresentationAttachments } from '../../document-attachments/attachments-service.js';
import { postRepresentation } from '../../representations.service.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { addressToString } from '#lib/address-formatter.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('#appeals/appeal-details/representations/types.js').RepresentationRequest} RepresentationRequest */
/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').AppealRule6Party} AppealRule6Party */

/**
 * @param {import('@pins/express').Request} request
 * @param {import('express').Response} response
 */
export const renderCheckYourAnswers = async (request, response) => {
	const {
		errors,
		currentAppeal: { appealReference, planningApplicationReference, appealSite },
		session: {
			fileUploadInfo: {
				files: [{ name, blobStoreUrl }]
			},
			addDocument,
			currentRepresentation
		},
		locals: { pageContent }
	} = request;

	let ipCommentEmailPreview;
	const redactionStatus = addDocument[redactionStatusFieldName];
	const day = addDocument['date-day'];
	const month = addDocument['date-month'];
	const year = addDocument['date-year'];
	const baseUrl = request.baseUrl;
	const statementsPassed = isStatePassed(request.currentAppeal, APPEAL_CASE_STATUS.STATEMENTS);
	const finalCommentsPassed = isStatePassed(
		request.currentAppeal,
		APPEAL_CASE_STATUS.FINAL_COMMENTS
	);
	const representationType =
		currentRepresentation?.representationType ?? getRepresentationType(request.baseUrl);

	if (!isValidRedactionStatus(redactionStatus)) {
		throw new Error('Received invalid redaction status');
	}

	clearEdits(request, 'addDocument');

	//Should this code be contained here (in CYA as opposed to the final comments and statements controllers)?
	if (statementsPassed && representationType === 'lpa_statement') {
		let personalisation = {
			appeal_reference_number: appealReference,
			//coverage for enforcement appeal type reference required here
			lpa_reference: planningApplicationReference,
			site_address: appealSite ? addressToString(appealSite) : 'Address not provided',
			case_team_email: request.currentAppeal.assignedTeam.email
		};
		ipCommentEmailPreview = await generateNotifyPreview(
			request.apiClient,
			'lpa-statement-added.content.md',
			personalisation
		);
	} else if (finalCommentsPassed && representationType === 'appellant_final_comment') {
		let personalisation = {
			appeal_reference_number: appealReference,
			//coverage for enforcement appeal type reference required here
			lpa_reference: planningApplicationReference,
			site_address: appealSite ? addressToString(appealSite) : 'Address not provided',
			case_team_email: request.currentAppeal.assignedTeam.email
		};
		ipCommentEmailPreview = await generateNotifyPreview(
			request.apiClient,
			'appellant-final-comment-added.content.md',
			personalisation
		);
	}

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
			},
			...(statementsPassed || finalCommentsPassed &&
				representationType === 'lpa_statement' ||
					representationType === 'appellant_final_comment'
				? {
						after: [
							{
								type: 'details',
								wrapperHtml: {
									opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
									closing: '</div></div>'
								},
								parameters: {
									summaryText: `Preview email to appellant`,
									html: ipCommentEmailPreview.renderedHtml,
									id: 'appellant-preview'
								}
							},
							{
								type: 'details',
								wrapperHtml: {
									opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
									closing: '</div></div>'
								},
								parameters: {
									summaryText: `Preview email to LPA`,
									html: ipCommentEmailPreview.renderedHtml,
									id: 'lpa-preview'
								}
							},
							{
								type: 'hint',
								parameters: {
									html: `
									<p class="govuk-body">
										We’ll share your ${representationType === APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT ? 'statement' : 'comment'} with the relevant parties
									</p>
								`
								}
							}
						]
					}
				: null)
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
		case APPEAL_REPRESENTATION_TYPE.COMMENT:
			nextPageUrl = `${nextPageUrl}/review`;
			bannerDefinitionKey = 'interestedPartyCommentsDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT:
			bannerDefinitionKey = session.createNewRepresentation
				? 'lpaStatementAddedSuccess'
				: 'lpaStatementDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE:
			if (!session.createNewRepresentation) {
				nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			}
			bannerDefinitionKey = 'lpaProofOfEvidenceDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE:
			if (!session.createNewRepresentation) {
				nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			}
			bannerDefinitionKey = 'appellantProofOfEvidenceDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT:
			bannerDefinitionKey = session.createNewRepresentation
				? 'lpaFinalCommentsAddedSuccess'
				: 'finalCommentsDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT:
			bannerDefinitionKey = session.createNewRepresentation
				? 'appellantFinalCommentsAddedSuccess'
				: 'finalCommentsDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT:
			bannerDefinitionKey = session.createNewRepresentation
				? 'rule6PartyStatementAddedSuccess'
				: 'rule6PartyStatementDocumentAddedSuccess';
			if (rule6Party && session.createNewRepresentation) {
				bannerText = `${rule6Party.serviceUser.organisationName} statement added`;
			}
			break;
		case APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE:
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
		case APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT:
			nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			bannerDefinitionKey = session.createNewRepresentation
				? 'appellantStatementAddedSuccess'
				: 'appellantStatementDocumentAddedSuccess';
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

	const isProofOfEvidence = [
		APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
		APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
		APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
	].includes(representationType);

	return {
		attachments: [documentGuid],
		redactionStatus,
		source,
		dateCreated: createdDate,
		representationText: isProofOfEvidence ? null : REPRESENTATION_ADDED_AS_DOCUMENT,
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
