import { setRepresentationStatus } from '#appeals/appeal-details/representations/representations.service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { confirmAcceptProofOfEvidencePage } from './accept.mapper.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAcceptProofOfEvidence = async (request, response) => {
	const {
		errors,
		currentRepresentation,
		currentAppeal,
		params: { proofOfEvidenceType },
		currentRule6Party
	} = request;

	const pageContent = confirmAcceptProofOfEvidencePage(
		currentAppeal,
		currentRepresentation,
		proofOfEvidenceType,
		currentRule6Party
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		errors,
		pageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postConfirmAcceptProofOfEvidence = async (request, response) => {
	try {
		const {
			params: { appealId },
			session,
			apiClient,
			currentRepresentation
		} = request;

		await setRepresentationStatus(
			apiClient,
			parseInt(appealId, 10),
			currentRepresentation.id,
			'valid'
		);

		const acceptProofOfEvidenceBannerType =
			currentRepresentation.representationType === 'appellant_proofs_evidence'
				? 'appellantProofOfEvidenceAcceptSuccess'
				: currentRepresentation.representationType === 'rule_6_party_proofs_evidence'
				? 'rule6PartyProofOfEvidenceAcceptSuccess'
				: 'lpaProofOfEvidenceAcceptSuccess';

		addNotificationBannerToSession({
			session: session,
			bannerDefinitionKey: acceptProofOfEvidenceBannerType,
			appealId
		});

		delete request.session.reviewProofOfEvidence;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
