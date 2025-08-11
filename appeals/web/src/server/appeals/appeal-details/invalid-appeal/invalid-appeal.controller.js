import logger from '#lib/logger.js';
import * as appellantCaseService from '../appellant-case/appellant-case.service.js';
import { mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters } from '../appellant-case/appellant-case.mapper.js';
import { decisionInvalidConfirmationPage, mapInvalidReasonPage } from './invalid-appeal.mapper.js';
import { getNotValidReasonsTextFromRequestBody } from '#lib/validation-outcome-reasons-formatter.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderInvalidReason = async (request, response) => {
	const { errors, body, currentAppeal } = request;

	if (
		!currentAppeal ||
		currentAppeal.appellantCaseId === null ||
		currentAppeal.appellantCaseId === undefined
	) {
		return response.status(404).render('app/404.njk');
	}

	const [appellantCaseResponse, invalidReasonOptions] = await Promise.all([
		appellantCaseService
			.getAppellantCaseFromAppealId(
				request.apiClient,
				currentAppeal.appealId,
				currentAppeal.appellantCaseId
			)
			.catch((error) => logger.error(error)),
		appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
			request.apiClient,
			'invalid'
		)
	]);

	if (!appellantCaseResponse) {
		return response.status(404).render('app/404.njk');
	}

	if (
		request.session.webAppellantCaseReviewOutcome &&
		(request.session.webAppellantCaseReviewOutcome.appealId !== currentAppeal.appealId ||
			request.session.webAppellantCaseReviewOutcome.validationOutcome !== 'invalid')
	) {
		delete request.session.webAppellantCaseReviewOutcome;
	}

	if (invalidReasonOptions) {
		const mappedInvalidReasonOptions = mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters(
			'invalid',
			invalidReasonOptions,
			body,
			request.session.webAppellantCaseReviewOutcome,
			appellantCaseResponse.validation
		);

		const sourceIsAppellantCase = request.baseUrl.includes('appellant-case');

		const pageContent = mapInvalidReasonPage(
			currentAppeal.appealId,
			currentAppeal.appealReference,
			mappedInvalidReasonOptions,
			errors ? errors['invalidReason']?.msg : undefined,
			sourceIsAppellantCase
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent,
			errors
		});
	}

	return response.status(500).render('app/500.njk');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderDecisionInvalidConfirmationPage = async (request, response) => {
	const {
		currentAppeal: { appealId, appealReference }
	} = request;

	const pageContent = decisionInvalidConfirmationPage(appealId, appealReference);

	response.status(200).render('appeals/confirmation.njk', {
		pageContent
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getInvalidReason = async (request, response) => {
	renderInvalidReason(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postInvalidReason = async (request, response) => {
	const { errors } = request;

	if (errors) {
		return renderInvalidReason(request, response);
	}

	try {
		const {
			currentAppeal: { appealId }
		} = request;

		/** @type {import('../appellant-case/appellant-case.types.js').AppellantCaseSessionValidationOutcome} */
		request.session.webAppellantCaseReviewOutcome = {
			appealId,
			validationOutcome: 'invalid',
			reasons: request.body.invalidReason,
			reasonsText: getNotValidReasonsTextFromRequestBody(request.body, 'invalidReason')
		};

		if (request.baseUrl.includes('appellant-case')) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/appellant-case/check-your-answers`
			);
		} else {
			return response.redirect(`/appeals-service/appeal-details/${appealId}/invalid/check`);
		}
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getConfirmation = async (request, response) => {
	renderDecisionInvalidConfirmationPage(request, response);
};
