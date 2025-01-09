import { patchRepresentationRedaction } from '#lib/api/representation.api.js';
import { render } from '../../common/render.js';
import { redactLpaStatementPage, redactConfirmPage } from './redact.mapper.js';
import { setRepresentationStatus } from '../../representations.service.js';

export const renderRedact = render(redactLpaStatementPage, 'patterns/display-page.pattern.njk');

export const renderConfirm = render(redactConfirmPage, 'patterns/display-page.pattern.njk');

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export function postRedact(request, response) {
	const {
		params: { appealId },
		body: { redactedRepresentation },
		session
	} = request;

	session.redactedRepresentation = redactedRepresentation;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/lpa-statement/redact/confirm`
	);
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function postConfirm(request, response) {
	const {
		params: { appealId },
		session,
		apiClient,
		currentRepresentation
	} = request;

	await Promise.all([
		patchRepresentationRedaction(
			apiClient,
			parseInt(appealId),
			currentRepresentation.id,
			session.redactedRepresentation
		),
		setRepresentationStatus(apiClient, parseInt(appealId), currentRepresentation.id, 'valid')
	]);

	delete session.redactedRepresentation;

	return response.redirect(`/appeals-service/appeal-details/${appealId}/lpa-statement`);
}
