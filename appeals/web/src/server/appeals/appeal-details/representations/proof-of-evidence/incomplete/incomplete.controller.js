import { preserveQueryString } from '#lib/url-utilities.js';
import { mapRejectionReasonOptionsToCheckboxItemParameters } from '../../common/render-select-rejection-reasons.js';
import { getRepresentationRejectionReasonOptions } from '../../representations.service.js';
import { incompleteProofOfEvidencePage } from './incomplete.mapper.js';

/**
 * @param {string} path
 * @param {string} sessionKey
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const redirectAndClearSession = (path, sessionKey) => (request, response) => {
	delete request.session[sessionKey];

	response.redirect(preserveQueryString(request, `${request.baseUrl}${path}`));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 **/
export async function renderReasons(request, response) {
	const {
		params: { proofOfEvidenceType, appealId },
		currentAppeal,
		currentRepresentation,
		apiClient,
		session,
		errors
	} = request;

	const incompleteReasons = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);

	const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
		currentRepresentation,
		incompleteReasons,
		session,
		['proofOfEvidence', appealId],
		errors
	);
	console.log('proofOfEvidenceType: ', proofOfEvidenceType);
	const pageContent = incompleteProofOfEvidencePage(currentAppeal, proofOfEvidenceType);

	return response.status(200).render('appeals/appeal/reject-representation.njk', {
		errors,
		pageContent,
		rejectionReasons: mappedRejectionReasons
	});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postReasons = async (request, response) => {
	const {
		params: { appealId, proofOfEvidenceType },
		errors
	} = request;

	if (errors) {
		return renderReasons(request, response);
	}

	return response
		.status(200)
		.redirect(
			`/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}/incomplete/confirm`
		);
};
