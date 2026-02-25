import { isAnyEnforcementAppealType } from '#appeals/appeal-details/appellant-case/appellant-case.controller.js';
import * as appellantCaseService from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import {
	buildRejectionReasons,
	rejectionReasonHtml
} from '#appeals/appeal-details/representations/common/components/reject-reasons.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	applyEdits,
	clearEdits,
	editLink,
	getSessionValuesForAppeal
} from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { isDefined } from '#lib/ts-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { invalidReasonPage, otherLiveAppealsPage } from './cancel-invalid.mapper.js';

/** @typedef {import('#appeals/appeal-details/appellant-case/appellant-case.types.js').AppellantCaseValidationOutcome} ValidationOutcome */

const getBackLinkUrl = backLinkGenerator('cancelAppeal');

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInvalidReason = async (request, response) => {
	const { currentAppeal } = request;

	const values = getSessionValuesForAppeal(request, 'cancelAppeal', currentAppeal.appealId);

	return renderInvalidReason(request, response, values);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {Record<string, string>} values
 */
const renderInvalidReason = async (request, response, values) => {
	const { errors, currentAppeal } = request;

	const invalidReasons = await appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
		request.apiClient,
		'invalid'
	);

	// Ordered list of IDs of invalid reasons to be shown for this flow
	const invalidReasonIds = [1, 2, 6, 3, 4];
	/** @type {import('@pins/appeals.api/src/server/endpoints/appeals.js').ReasonOption[]} */
	const filteredInvalidReasons = invalidReasonIds
		.map((id) => invalidReasons.find((reason) => reason.id === id))
		.filter(isDefined);

	const cancelUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/cancel`;
	const backUrl = getBackLinkUrl(request, cancelUrl, `${cancelUrl}/invalid/check-details`);

	const pageContent = invalidReasonPage(
		currentAppeal,
		filteredInvalidReasons,
		backUrl,
		values,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInvalidReason = async (request, response) => {
	const { body, currentAppeal, errors } = request;

	if (errors) {
		return renderInvalidReason(request, response, body);
	}

	if (isAnyEnforcementAppealType(currentAppeal.appealType)) {
		return response.redirect(
			preserveQueryString(
				request,
				`/appeals-service/appeal-details/${currentAppeal.appealId}/cancel/invalid/other-live-appeals`
			)
		);
	} else {
		applyEdits(request, 'cancelAppeal');

		return response.redirect(
			preserveQueryString(
				request,
				`/appeals-service/appeal-details/${currentAppeal.appealId}/cancel/invalid/check-details`
			)
		);
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getOtherLiveAppeals = async (request, response) => {
	const { currentAppeal } = request;

	const values = getSessionValuesForAppeal(request, 'cancelAppeal', currentAppeal.appealId);

	return renderOtherLiveAppeals(request, response, values);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {Record<string, string>} values
 */
const renderOtherLiveAppeals = async (request, response, values) => {
	const { errors, currentAppeal } = request;

	const cancelUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/cancel`;
	const backUrl = getBackLinkUrl(
		request,
		`${cancelUrl}/invalid/reason`,
		`${cancelUrl}/invalid/check-details`
	);

	const pageContent = otherLiveAppealsPage(currentAppeal, backUrl, values, errors);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postOtherLiveAppeals = async (request, response) => {
	const { body, currentAppeal, errors } = request;

	if (errors) {
		return renderOtherLiveAppeals(request, response, body);
	}

	applyEdits(request, 'cancelAppeal');

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/cancel/invalid/check-details`
		)
	);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getCheckDetails = async (request, response) => {
	const { currentAppeal, errors } = request;

	clearEdits(request, 'cancelAppeal');

	/** @type {Record<string, any>} */
	const sessionValues = getSessionValuesForAppeal(request, 'cancelAppeal', currentAppeal.appealId);

	const reasonOptions = await appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
		request.apiClient,
		'invalid'
	);

	const invalidReasons = buildRejectionReasons(reasonOptions, sessionValues.invalidReason, {
		[4]: [sessionValues['invalidReason-4']]
	});

	const cancelUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/cancel`;

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and mark appeal as invalid',
			heading: 'Check details and mark appeal as invalid',
			preHeading: `Appeal ${appealShortReference(currentAppeal.appealReference)}`,
			backLinkUrl: `${cancelUrl}/invalid/other-live-appeals`,
			submitButtonText: 'Mark appeal as invalid',
			responses: {
				'Why are you cancelling the appeal?': {
					value: 'Appeal invalid',
					actions: {
						Change: {
							href: editLink(cancelUrl),
							visuallyHiddenText: 'Why are you cancelling the appeal?'
						}
					}
				},
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
							href: editLink(cancelUrl, 'invalid/reason'),
							visuallyHiddenText: 'Why is the appeal invalid?'
						}
					}
				},
				...(isAnyEnforcementAppealType(currentAppeal.appealType)
					? {
							'Are there any other live appeals against the enforcement notice?': {
								value: capitalizeFirstLetter(sessionValues?.otherLiveAppeals || ''),
								actions: {
									Change: {
										href: editLink(cancelUrl, 'invalid/other-live-appeals'),
										visuallyHiddenText:
											'Are there any other live appeals against the enforcement notice?'
									}
								}
							}
						}
					: {})
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
						html: '' // TODO: Implement preview email to appellant
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
						html: '' // TODO: Implement preview email to LPA
					}
				}
			]
		},
		response,
		errors
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckDetails = async (request, response) => {
	try {
		const {
			currentAppeal,
			params: { appealId }
		} = request;

		const sessionValues = /** @type {Record<string, any>} */ (
			getSessionValuesForAppeal(request, 'cancelAppeal', currentAppeal.appealId)
		);
		const invalidReasonIds = /** @type {string[]} */ (sessionValues.invalidReason);

		const invalidReasons = invalidReasonIds.map((reason) => {
			const reasonText = sessionValues[`invalidReason-${reason}`];
			return {
				id: Number(reason),
				...(reasonText && { text: [String(reasonText)] })
			};
		});

		/** @type {import('#appeals/appeal-details/appellant-case/appellant-case.types.js').AppellantCaseValidationOutcomeRequest} */
		const reviewOutcome = {
			validationOutcome: 'invalid',
			invalidReasons,
			otherLiveAppeals: String(sessionValues.otherLiveAppeals)
		};

		await appellantCaseService.setReviewOutcomeForAppellantCase(
			request.apiClient,
			appealId,
			currentAppeal.appellantCaseId,
			reviewOutcome
		);

		delete request.session.cancelAppeal;

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'appellantCaseInvalidOrIncomplete',
			appealId: currentAppeal.appealId,
			text: `Appeal marked as invalid`
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
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
