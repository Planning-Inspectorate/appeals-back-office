import * as appellantCaseService from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import { getTeamFromAppealId } from '#appeals/appeal-details/update-case-team/update-case-team.service.js';
import featureFlags from '#common/feature-flags.js';
import { addressToString } from '#lib/address-formatter.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { editLink, getSessionValuesForAppeal } from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { addBackLinkQueryToUrl, preserveQueryString } from '#lib/url-utilities.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { ENFORCEMENT_APPEAL_INVALID_GROUND_A_FEE_NOT_PAID } from '@pins/appeals/constants/support.js';
import { mapCancelAppealPage } from './cancel.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCancelAppealPage = async (request, response) => {
	return renderCancelAppealPage(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCancelAppealPage = async (request, response) => {
	const { errors, currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	const values = getSessionValuesForAppeal(request, 'cancelAppeal', currentAppeal.appealId);

	const path = (() => {
		switch (values.cancelReasonRadio) {
			case CANCEL_REASON.ENFORCEMENT_NOTICE_WITHDRAWN:
				return 'enforcement-notice-withdrawal';
			case CANCEL_REASON.INVALID:
				return 'invalid';
		}
	})();
	const cyaUrl = path
		? `/appeals-service/appeal-details/${currentAppeal.appealId}/cancel/${path}/check-details`
		: '';
	const backLinkUrl = backLinkGenerator('cancelAppeal')(request, null, cyaUrl);

	const appealId = currentAppeal.appealId;
	const mappedPageContent = mapCancelAppealPage(
		currentAppeal,
		backLinkUrl,
		errors ? errors['cancelReasonRadio'].msg : undefined,
		values
	);

	if (!appealId || !mappedPageContent) {
		return response.status(500).render('app/500.njk');
	}

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCancelAppeal = async (request, response) => {
	const { currentAppeal } = request;

	if (request.errors) {
		return renderCancelAppealPage(request, response);
	}

	const cancelReason = request.body['cancelReasonRadio'];

	const baseUrl = `/appeals-service/appeal-details/${request.currentAppeal.appealId}`;
	const invalidFlowEntrypoint =
		currentAppeal.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE &&
		featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_CANCEL)
			? `${baseUrl}/cancel/invalid/reason`
			: `${baseUrl}/invalid/new`;

	switch (cancelReason) {
		case CANCEL_REASON.INVALID:
			return response.redirect(
				addBackLinkQueryToUrl(request, preserveQueryString(request, invalidFlowEntrypoint))
			);
		case CANCEL_REASON.WITHDRAWAL:
			return response.redirect(preserveQueryString(request, `${baseUrl}/withdrawal/new`));
		case CANCEL_REASON.ENFORCEMENT_NOTICE_WITHDRAWN:
			return response.redirect(
				preserveQueryString(request, `${baseUrl}/cancel/enforcement-notice-withdrawal`)
			);
		case CANCEL_REASON.DID_NOT_PAY:
			return response.redirect(preserveQueryString(request, `${baseUrl}/cancel/check-details`));
		default:
			return response.status(500).render('app/500.njk');
	}
};

const CANCEL_REASON = {
	INVALID: 'invalid',
	WITHDRAWAL: 'withdrawal',
	ENFORCEMENT_NOTICE_WITHDRAWN: 'enforcement-notice-withdrawn',
	DID_NOT_PAY: 'did-not-pay'
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckYourAnswers = async (request, response) => {
	return renderCheckYourAnswers(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckYourAnswers = async (request, response) => {
	try {
		const { appealId } = request.params;
		const { errors, currentAppeal, session } = request;
		if (errors) {
			return renderCheckYourAnswers(request, response);
		}

		const invalidReasons =
			await appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
				request.apiClient,
				'invalid'
			);
		const feeNotPaidReason = invalidReasons.find(
			(reason) => reason.name === ENFORCEMENT_APPEAL_INVALID_GROUND_A_FEE_NOT_PAID
		);
		if (!feeNotPaidReason) {
			return response.status(500).render('app/500.njk');
		}

		/** @type {import('#appeals/appeal-details/appellant-case/appellant-case.types.js').AppellantCaseValidationOutcomeRequest} */
		const reviewOutcome = {
			validationOutcome: 'invalid',
			invalidReasons: [{ id: feeNotPaidReason.id }]
		};

		await appellantCaseService.setReviewOutcomeForAppellantCase(
			request.apiClient,
			appealId,
			currentAppeal.appellantCaseId,
			reviewOutcome
		);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'issuedDecisionInvalid',
			appealId: currentAppeal.appealId
		});
		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCheckYourAnswers = async (request, response) => {
	const { errors, currentAppeal } = request;
	const { email: assignedTeamEmail } = await getTeamFromAppealId(
		request.apiClient,
		currentAppeal.appealId
	);
	const personalisation = {
		appeal_reference_number: currentAppeal.appealReference,
		lpa_reference: currentAppeal.planningApplicationReference,
		site_address: addressToString(currentAppeal.appealSite),
		team_email_address: assignedTeamEmail,
		enforcement_reference: currentAppeal.enforcementNotice?.appellantCase?.reference || '',
		due_date:
			dateISOStringToDisplayDate(
				currentAppeal.enforcementNotice?.appellantCase?.groundAFeeDueDate
			) || '',
		issue_date:
			dateISOStringToDisplayDate(currentAppeal.enforcementNotice?.appellantCase?.issueDate) || ''
	};
	const appellantTemplate = await generateNotifyPreview(
		request.apiClient,
		'enforcement-cancel-appeal-no-fee-appellant.content.md',
		personalisation
	);

	const lpaTemplate = await generateNotifyPreview(
		request.apiClient,
		'enforcement-cancel-appeal-no-fee-lpa.content.md',
		personalisation
	);

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and cancel appeal',
			heading: 'Check details and cancel appeal',
			preHeading: `Appeal ${appealShortReference(currentAppeal.appealReference)}`,
			backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/cancel`,
			submitButtonText: 'Cancel appeal',
			responses: {
				'Why are you cancelling the appeal?': {
					value: 'Did not pay the ground (a) fee',
					actions: {
						Change: {
							href: editLink(`/appeals-service/appeal-details/${currentAppeal.appealId}/cancel`),
							visuallyHiddenText: 'Why are you cancelling the appeal?'
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
						html: appellantTemplate.renderedHtml,
						id: 'appellant-preview'
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
						html: lpaTemplate.renderedHtml,
						id: 'lpa-preview'
					}
				}
			]
		},
		response,
		errors
	);
};
