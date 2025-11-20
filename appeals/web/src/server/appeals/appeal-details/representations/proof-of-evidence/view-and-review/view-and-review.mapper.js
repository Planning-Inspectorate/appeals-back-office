import { appealShortReference } from '#lib/appeals-formatter.js';
import { mapNotificationBannersFromSession } from '#lib/mappers/index.js';
import { APPEAL_PROOF_OF_EVIDENCE_STATUS } from '@pins/appeals/constants/common.js';
import { generateProofOfEvidenceSummaryList } from './page-components/common.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {string} proofOfEvidenceType
 * @param {Representation} proofOfEvidence
 * @param {import('@pins/express').Session} session
 * @param {string | undefined} backUrl
 * @returns {PageContent}
 */
export function reviewProofOfEvidencePage(
	appealDetails,
	proofOfEvidenceType,
	proofOfEvidence,
	session,
	backUrl
) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const notificationBanners = mapNotificationBannersFromSession(
		session,
		'viewProofOfEvidence',
		appealDetails.appealId
	);

	const proofOfEvidenceSummaryList = generateProofOfEvidenceSummaryList(
		appealDetails.appealId,
		proofOfEvidence
	);

	const title = `Review ${formatProofOfEvidenceTypeText(
		proofOfEvidenceType
	)} proof of evidence and witnesses`;

	const pageContent = {
		title,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: title,
		submitButtonText: 'Continue',
		pageComponents: [...notificationBanners, proofOfEvidenceSummaryList]
	};

	pageContent.pageComponents.push({
		type: 'radios',
		parameters: {
			name: 'status',
			idPrefix: 'status',
			fieldset: {
				legend: {
					text: 'Review decision',
					isPageHeading: false,
					classes: 'govuk-fieldset__legend--m'
				}
			},
			items: [
				{
					value: APPEAL_PROOF_OF_EVIDENCE_STATUS.VALID,
					text: 'Complete',
					checked:
						proofOfEvidence?.status === APPEAL_PROOF_OF_EVIDENCE_STATUS.VALID ||
						session.reviewProofOfEvidence?.status === APPEAL_PROOF_OF_EVIDENCE_STATUS.VALID
				},
				{
					value: APPEAL_PROOF_OF_EVIDENCE_STATUS.INVALID,
					text: 'Mark as incomplete',
					checked:
						proofOfEvidence?.status === APPEAL_PROOF_OF_EVIDENCE_STATUS.INVALID ||
						proofOfEvidence?.status === APPEAL_PROOF_OF_EVIDENCE_STATUS.AWAITING_REVIEW ||
						session.reviewProofOfEvidence?.status === APPEAL_PROOF_OF_EVIDENCE_STATUS.INVALID
				}
			]
		}
	});

	return pageContent;
}

/**
 * @param {string} proofOfEvidenceType
 * @param {boolean} [capitaliseFirstLetter]
 * @returns {string}
 */
export function formatProofOfEvidenceTypeText(proofOfEvidenceType, capitaliseFirstLetter = false) {
	return proofOfEvidenceType.toLowerCase() === 'lpa'
		? 'LPA'
		: `${capitaliseFirstLetter ? 'A' : 'a'}ppellant`;
}
