import logger from '#lib/logger.js';
import { APPEAL_PROOF_OF_EVIDENCE_STATUS } from '@pins/appeals/constants/common.js';
import { reviewProofOfEvidencePage } from './view-and-review.mapper.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 *
 * @param {(appealDetails: Appeal, proofOfEvidenceType: string, proofOfEvidence: Representation, session: import('express-session').Session & Record<string, string>, backUrl: string) => PageContent} contentMapper
 * @param {string} templatePath
 * @returns {import('@pins/express').RenderHandler<any, any, any>}
 */
export const render = (contentMapper, templatePath) => (request, response) => {
	const { errors, currentRepresentation, currentAppeal, session, query } = request;
	const backUrl = query.backUrl ? String(query.backUrl) : '/';

	let { proofOfEvidenceType } = request.params;

	if (!currentRepresentation) {
		return response.status(404).render('app/404.njk');
	}

	const pageContent = contentMapper(
		currentAppeal,
		proofOfEvidenceType.toUpperCase(),
		currentRepresentation,
		session,
		backUrl
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
			params: { appealId, proofOfEvidenceType }
		} = request;

		if (!currentAppeal) {
			logger.error('Current appeal not found.');
			return response.status(500).render('app/500.njk');
		}

		if (errors) {
			return renderReviewProofOfEvidence(request, response, next);
		}

		if (status === APPEAL_PROOF_OF_EVIDENCE_STATUS.INVALID) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}/reject`
			);
		}

		if (status === APPEAL_PROOF_OF_EVIDENCE_STATUS.VALID) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}/accept`
			);
		}

		return renderReviewProofOfEvidence(request, response, next);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
