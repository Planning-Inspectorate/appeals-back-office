import logger from '#lib/logger.js';
import * as appellantCaseService from '../appellant-case/appellant-case.service.js';
import { mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters } from '../appellant-case/appellant-case.mapper.js';
import {
	decisionInvalidConfirmationPage,
	mapInvalidReasonPage,
	viewInvalidAppealPage
} from './invalid-appeal.mapper.js';
import { getNotValidReasonsTextFromRequestBody } from '#lib/validation-outcome-reasons-formatter.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import {
	buildRejectionReasons,
	rejectionReasonHtml
} from '../representations/common/components/reject-reasons.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { getInvalidStatusCreatedDate } from './invalid-appeal.service.js';

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
			appellantCaseResponse.validation,
			errors
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

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getCheckPage = async (request, response) => {
	try {
		if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
			return response.status(500).render('app/500.njk');
		}

		const {
			currentAppeal,
			session: { webAppellantCaseReviewOutcome },
			errors
		} = request;

		const reasonOptions =
			await appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
				request.apiClient,
				webAppellantCaseReviewOutcome.validationOutcome
			);
		if (!reasonOptions) {
			throw new Error('error retrieving invalid reason options');
		}

		const invalidReasons = buildRejectionReasons(
			reasonOptions,
			webAppellantCaseReviewOutcome.reasons,
			webAppellantCaseReviewOutcome.reasonsText
		);

		const personalisation = {
			appeal_reference_number: currentAppeal.appealReference,
			lpa_reference: currentAppeal.planningApplicationReference || '',
			site_address: appealSiteToAddressString(currentAppeal.appealSite),
			reasons: invalidReasons
		};

		const { appellantTemplate, lpaTemplate } = await generateInvalidAppealNotifyPreviews(
			request.apiClient,
			personalisation
		);

		return renderCheckYourAnswersComponent(
			{
				title: 'Check details and mark appeal as invalid',
				heading: 'Check details and mark appeal as invalid',
				preHeading: `Appeal ${appealShortReference(currentAppeal.appealReference)}`,
				backLinkUrl: `${request.baseUrl}/new`,
				submitButtonText: 'Mark appeal as invalid',
				responses: {
					'Why is the appeal invalid?': {
						html: '',
						pageComponents: [
							{
								type: 'show-more',
								parameters: {
									html: rejectionReasonHtml(invalidReasons),
									labelText: 'Read more'
								}
							}
						],
						actions: {
							Change: {
								href: `${addBackLinkQueryToUrl(request, `${request.baseUrl}/new`)}`,
								visuallyHiddenText: 'Why is the appeal invalid?'
							}
						}
					}
				},
				after: [
					{
						type: 'details',
						wrapperHtml: {
							opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
							closing: '</div></div>'
						},
						parameters: {
							summaryText: `Preview email to appellant`,
							html: appellantTemplate.renderedHtml
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
							html: lpaTemplate.renderedHtml
						}
					}
				]
			},
			response,
			errors
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong whilst marking appeal as invalid'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getInvalidPage = async (request, response) => {
	const { currentAppeal } = request;

	const appellantCase = await appellantCaseService
		.getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		)
		.catch((error) => logger.error(error));

	const invalidDate = await getInvalidStatusCreatedDate(
		request.apiClient,
		currentAppeal.appealId
	).catch((error) => logger.error(error));

	const pageContent = viewInvalidAppealPage(
		currentAppeal.appealId,
		currentAppeal.appealReference,
		invalidDate.createdDate,
		appellantCase.validation.invalidReasons
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent
	});
};

/**
 * Generate Notify preview templates for appellant and LPA
 * @param {import('got').Got} apiClient
 * @param {object} personalisation
 * @returns {Promise<{appellantTemplate: any, lpaTemplate: any}>}
 */
const generateInvalidAppealNotifyPreviews = async (apiClient, personalisation) => {
	const appellantTemplateName = 'appeal-invalid.content.md';
	const lpaTemplateName = 'appeal-invalid-lpa.content.md';

	const [appellantTemplate, lpaTemplate] = await Promise.all([
		generateNotifyPreview(apiClient, appellantTemplateName, personalisation),
		generateNotifyPreview(apiClient, lpaTemplateName, personalisation)
	]);
	return { appellantTemplate, lpaTemplate };
};
