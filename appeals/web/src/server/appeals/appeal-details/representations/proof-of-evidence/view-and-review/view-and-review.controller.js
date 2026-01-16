import logger from '#lib/logger.js';
import { APPEAL_PROOF_OF_EVIDENCE_STATUS } from '@pins/appeals/constants/common.js';
import { reviewProofOfEvidencePage } from './view-and-review.mapper.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('../proof-of-evidence.middleware.js').AppealRule6Party} AppealRule6Party */

/**
 *
 * @param {(appealDetails: Appeal, proofOfEvidenceType: string, proofOfEvidence: Representation, session: import('express-session').Session & Record<string, string>, backUrl: string, rule6Party: AppealRule6Party) => PageContent} contentMapper
 * @param {string} templatePath
 * @returns {import('@pins/express').RenderHandler<any, any, any>}
 */
export const render = (contentMapper, templatePath) => (request, response) => {
	const { errors, currentRepresentation, currentAppeal, session, query, currentRule6Party } =
		request;

	let { proofOfEvidenceType, appealId } = request.params;
	const backUrl = query.backUrl
		? String(query.backUrl)
		: `/appeals-service/appeal-details/${appealId}`;

	if (!currentRepresentation) {
		return response.status(404).render('app/404.njk');
	}

	const pageContent = contentMapper(
		currentAppeal,
		proofOfEvidenceType.toUpperCase(),
		currentRepresentation,
		session,
		backUrl,
		currentRule6Party
	);

	return response.status(200).render(templatePath, {
		errors,
		pageContent
	});
};

export const renderReviewProofOfEvidence = render(
	reviewProofOfEvidencePage,
	'patterns/display-page.pattern.njk'
);

/**
 * @type {import('@pins/express').RenderHandler<any, any, any>}
 */
export const postReviewProofOfEvidence = async (request, response, next) => {
	try {
		const {
			errors,
			currentAppeal,
			body: { status },
			params: { appealId, proofOfEvidenceType },
			currentRule6Party
		} = request;

		if (!currentAppeal) {
			logger.error('Current appeal not found.');
			return response.status(500).render('app/500.njk');
		}

		if (errors) {
			return renderReviewProofOfEvidence(request, response, next);
		}

		if (status === APPEAL_PROOF_OF_EVIDENCE_STATUS.INVALID) {
			request.session.reviewProofOfEvidence.status = APPEAL_PROOF_OF_EVIDENCE_STATUS.INVALID;
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}${
					proofOfEvidenceType.toLowerCase() === 'rule-6-party' ? `/${currentRule6Party?.id}` : ''
				}/incomplete`
			);
		}

		if (status === APPEAL_PROOF_OF_EVIDENCE_STATUS.VALID) {
			request.session.reviewProofOfEvidence.status = APPEAL_PROOF_OF_EVIDENCE_STATUS.VALID;
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}${
					proofOfEvidenceType.toLowerCase() === 'rule-6-party' ? `/${currentRule6Party.id}` : ''
				}/accept`
			);
		}

		return renderReviewProofOfEvidence(request, response, next);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
