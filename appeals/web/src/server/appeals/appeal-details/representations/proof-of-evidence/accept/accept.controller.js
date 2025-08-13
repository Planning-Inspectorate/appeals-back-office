import logger from '#lib/logger.js';
import { confirmAcceptProofOfEvidencePage } from './accept.mapper.js';
import { setRepresentationStatus } from '#appeals/appeal-details/representations/representations.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAcceptProofOfEvidence = async (request, response) => {
	const {
		errors,
		currentRepresentation,
		currentAppeal,
		params: { proofOfEvidenceType }
	} = request;

	const pageContent = confirmAcceptProofOfEvidencePage(
		currentAppeal,
		currentRepresentation,
		proofOfEvidenceType
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
				: 'lpaProofOfEvidenceAcceptSuccess';

		addNotificationBannerToSession({
			session: session,
			bannerDefinitionKey: acceptProofOfEvidenceBannerType,
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
