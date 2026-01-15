import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { getFeedbackLinkFromAppealTypeName } from '#lib/feedback-form-link.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { getNotValidReasonsTextFromRequestBody } from '#lib/validation-outcome-reasons-formatter.js';
import { APPEAL_TYPE, FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import {
	CHANGE_APPEAL_TYPE_INVALID_REASON,
	ENFORCEMENT_APPEAL_INVALID_GROUND_A_BARRED,
	ENFORCEMENT_APPEAL_INVALID_LEGAL_INTEREST,
	INVALID_APPEAL_OTHER_REASON
} from '@pins/appeals/constants/support.js';
import { mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters } from '../appellant-case/appellant-case.mapper.js';
import * as appellantCaseService from '../appellant-case/appellant-case.service.js';
import {
	buildRejectionReasons,
	rejectionReasonHtml
} from '../representations/common/components/reject-reasons.js';
import { getTeamFromAppealId } from '../update-case-team/update-case-team.service.js';
import {
	checkDetailsAndMarkEnforcementAsInvalid,
	decisionInvalidConfirmationPage,
	enforcementNoticeInvalidPage,
	enforcementNoticeReasonPage,
	mapInvalidReasonPage,
	otherLiveAppealsPage,
	viewInvalidAppealPage
} from './invalid-appeal.mapper.js';
import {
	getInvalidStatusCreatedDate,
	setReviewOutcomeForEnforcementNoticeAppellantCase
} from './invalid-appeal.service.js';

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
			request.session.webAppellantCaseReviewOutcome.validationOutcome !== 'invalid') &&
		!request.session.webAppellantCaseReviewOutcome?.enforcementNoticeInvalid
	) {
		delete request.session.webAppellantCaseReviewOutcome;
	}

	// @ts-ignore
	const filteredReasonOptions = invalidReasonOptions.reduce((acc, reason) => {
		if (reason.name === CHANGE_APPEAL_TYPE_INVALID_REASON) {
			return acc;
		}

		if (currentAppeal.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE) {
			if (reason.name !== INVALID_APPEAL_OTHER_REASON) {
				// @ts-ignore
				acc.push(reason);
			}
		} else {
			if (
				reason.name !== ENFORCEMENT_APPEAL_INVALID_LEGAL_INTEREST &&
				reason.name !== ENFORCEMENT_APPEAL_INVALID_GROUND_A_BARRED
			) {
				// @ts-ignore
				acc.push(reason);
			}
		}

		return acc;
	}, []);

	if (filteredReasonOptions) {
		const mappedInvalidReasonOptions = mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters(
			'invalid',
			filteredReasonOptions,
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
			currentAppeal.appealType,
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
			currentAppeal: { appealId, appealType }
		} = request;

		/** @type {import('../appellant-case/appellant-case.types.js').AppellantCaseSessionValidationOutcome} */
		request.session.webAppellantCaseReviewOutcome = {
			...request.session.webAppellantCaseReviewOutcome,
			appealId,
			validationOutcome: 'invalid',
			reasons: request.body.invalidReason,
			reasonsText: getNotValidReasonsTextFromRequestBody(request.body, 'invalidReason')
		};

		if (request.baseUrl.includes('appellant-case')) {
			if (appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE) {
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/appellant-case/invalid/other-live-appeals`
				);
			}

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
	return renderDecisionInvalidConfirmationPage(request, response);
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

		const filteredReasonOptions = reasonOptions.filter(
			(reason) => reason.name !== CHANGE_APPEAL_TYPE_INVALID_REASON
		);

		if (!filteredReasonOptions) {
			throw new Error('error retrieving invalid reason options');
		}

		const invalidReasons = buildRejectionReasons(
			filteredReasonOptions,
			webAppellantCaseReviewOutcome.reasons,
			webAppellantCaseReviewOutcome.reasonsText
		);

		const { email: assignedTeamEmail } = await getTeamFromAppealId(
			request.apiClient,
			currentAppeal.appealId
		);

		const personalisation = {
			appeal_reference_number: currentAppeal.appealReference,
			lpa_reference: currentAppeal.planningApplicationReference || '',
			site_address: appealSiteToAddressString(currentAppeal.appealSite),
			reasons: invalidReasons,
			team_email_address: assignedTeamEmail
		};

		const { appellantTemplate, lpaTemplate } = await generateInvalidAppealNotifyPreviews(
			request.apiClient,
			personalisation,
			currentAppeal.appealType
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
 * @param {string} appeal_type
 * @returns {Promise<{appellantTemplate: any, lpaTemplate: any}>}
 */
const generateInvalidAppealNotifyPreviews = async (apiClient, personalisation, appeal_type) => {
	const appellantTemplateName = 'appeal-invalid.content.md';
	const lpaTemplateName = 'appeal-invalid-lpa.content.md';

	const [appellantTemplate, lpaTemplate] = await Promise.all([
		generateNotifyPreview(apiClient, appellantTemplateName, {
			...personalisation,
			feedback_link: getFeedbackLinkFromAppealTypeName(appeal_type)
		}),
		generateNotifyPreview(apiClient, lpaTemplateName, {
			...personalisation,
			feedback_link: FEEDBACK_FORM_LINKS.LPA
		})
	]);
	return { appellantTemplate, lpaTemplate };
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getEnforcementNoticeInvalid = async (request, response) => {
	return renderEnforcementNoticeInvalidPage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postEnforcementNoticeInvalid = async (request, response) => {
	const { errors, body, currentAppeal, session } = request;

	if (errors) {
		return renderEnforcementNoticeInvalidPage(request, response);
	}

	try {
		session.webAppellantCaseReviewOutcome = {
			...session.webAppellantCaseReviewOutcome,
			enforcementNoticeInvalid: body.enforcementNoticeInvalid
		};

		if (session.webAppellantCaseReviewOutcome.enforcementNoticeInvalid === 'no') {
			delete session.webAppellantCaseReviewOutcome.enforcementNoticeReason;
			return response.redirect(
				`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/invalid`
			);
		}
		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/invalid/enforcement-notice-reason`
		);
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

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/express').ValidationErrors} [apiErrors]
 */
const renderEnforcementNoticeInvalidPage = async (request, response, apiErrors) => {
	let errors = request.errors || apiErrors;

	const mappedPageContent = enforcementNoticeInvalidPage(
		request.currentAppeal,
		request.session.webAppellantCaseReviewOutcome?.enforcementNoticeInvalid
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getEnforcementNoticeReason = async (request, response) => {
	return renderEnforcementNoticeReasonPage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postEnforcementNoticeReason = async (request, response) => {
	const { errors, body, currentAppeal, session } = request;

	if (errors) {
		return renderEnforcementNoticeReasonPage(request, response);
	}

	try {
		session.webAppellantCaseReviewOutcome = {
			...session.webAppellantCaseReviewOutcome,
			enforcementNoticeReason: body.invalidReason
				? [body.invalidReason].flat().map((reason) => ({
						reasonSelected: Number(reason),
						reasonText: body[`invalidReason-${reason}`]
				  }))
				: null
		};

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/invalid/enforcement-other-information`
		);
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

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/express').ValidationErrors} [apiErrors]
 */
const renderEnforcementNoticeReasonPage = async (request, response, apiErrors) => {
	const { errors = apiErrors, body, currentAppeal, session } = request;

	if (typeof currentAppeal?.appellantCaseId !== 'number') {
		return response.status(404).render('app/404.njk');
	}

	const [appellantCaseResponse, invalidReasonOptions] = await Promise.all([
		appellantCaseService
			.getAppellantCaseFromAppealId(
				request.apiClient,
				currentAppeal.appealId,
				currentAppeal.appellantCaseId
			)
			.catch((error) => {
				logger.error(error);
			}),
		appellantCaseService.getAppellantCaseEnforcementInvalidReasonOptions(request.apiClient)
	]);

	if (!appellantCaseResponse) {
		return response.status(404).render('app/404.njk');
	}

	if (invalidReasonOptions) {
		const pageContent = enforcementNoticeReasonPage(
			currentAppeal,
			invalidReasonOptions.map((option) => {
				if (errors) {
					const selected = body.invalidReason?.includes(option.id.toString()) ?? false;
					return {
						...option,
						selected,
						text: (selected && body[`invalidReason-${option.id}`]) ?? ''
					};
				}
				const reason = session?.webAppellantCaseReviewOutcome?.enforcementNoticeReason?.find(
					(/** @type {{reasonSelected:number, reasonText:string}} */ reason) =>
						reason.reasonSelected === option.id
				);
				const selected = reason?.reasonSelected ?? false;
				return { ...option, selected, text: (selected && reason?.reasonText) ?? '' };
			}),
			errors
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent,
			errors
		});
	}

	return response.status(500).render('app/500.njk');
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getOtherLiveAppeals = async (request, response) => {
	return renderOtherLiveAppealsPage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postOtherLiveAppeals = async (request, response) => {
	const { errors, body, currentAppeal, session } = request;

	if (errors) {
		return renderOtherLiveAppealsPage(request, response);
	}

	try {
		session.webAppellantCaseReviewOutcome = {
			...session.webAppellantCaseReviewOutcome,
			otherLiveAppeals: body.otherLiveAppeals
		};

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/check-your-answers`
		);
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

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/express').ValidationErrors} [apiErrors]
 */
const renderOtherLiveAppealsPage = async (request, response, apiErrors) => {
	let errors = request.errors || apiErrors;

	const mappedPageContent = otherLiveAppealsPage(
		request.currentAppeal,
		request.session.webAppellantCaseReviewOutcome?.otherLiveAppeals
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getCheckDetailsAndMarkEnforcementAsInvalid = async (request, response) => {
	return renderCheckDetailsAndMarkEnforcementAsInvalid(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postCheckDetailsAndMarkEnforcementAsInvalid = async (request, response) => {
	const { currentAppeal } = request;

	if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
		return response.status(500).render('app/500.njk');
	}

	const { webAppellantCaseReviewOutcome, enforcementDecision } = request.session;

	try {
		await setReviewOutcomeForEnforcementNoticeAppellantCase(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId,
			{
				...webAppellantCaseReviewOutcome,
				...enforcementDecision
			}
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'appellantCaseInvalidOrIncomplete',
			appealId: currentAppeal.appealId,
			text: 'Appeal marked as invalid'
		});

		delete request.session.webAppellantCaseReviewOutcome;
		delete request.session.enforcementDecision;

		return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing enforcement invalid review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCheckDetailsAndMarkEnforcementAsInvalid = async (request, response) => {
	try {
		if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
			return response.status(500).render('app/500.njk');
		}

		const reasonOptions =
			await appellantCaseService.getAppellantCaseEnforcementInvalidReasonOptions(request.apiClient);

		if (!reasonOptions) {
			throw new Error('error retrieving invalid enforcement reason options');
		}

		const mappedPageContent = checkDetailsAndMarkEnforcementAsInvalid(
			request.currentAppeal,
			reasonOptions,
			request.session
		);

		return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
			pageContent: mappedPageContent
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing enforcement invalid review'
		);

		return response.status(500).render('app/500.njk');
	}
};
