import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { renderSelectRejectionReasons } from '../../common/render-select-rejection-reasons.js';
import { rejectLpaStatementPage, setNewDatePage } from './incomplete.mapper.js';
import { getRepresentationRejectionReasonOptions } from '../../representations.service.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { simpleHtmlComponent } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate, addBusinessDays } from '#lib/dates.js';
import { capitalize } from 'lodash-es';
import {
	rejectionReasonHtml,
	prepareRejectionReasons
} from '#appeals/appeal-details/representations/common/components/reject-reasons.js';

const statusFormatMap = {
	[COMMENT_STATUS.INCOMPLETE]: 'Statement incomplete'
};

export const renderReasons = renderSelectRejectionReasons(rejectLpaStatementPage, 'lpaStatement');

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('express').NextFunction} next
 */
export const postReasons = async (request, response, next) => {
	const {
		params: { appealId },
		errors
	} = request;

	if (errors) {
		return renderReasons(request, response, next);
	}

	return response
		.status(200)
		.redirect(`/appeals-service/appeal-details/${appealId}/lpa-statement/incomplete/date`);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderSetNewDate(request, response) {
	const extendedDeadline = await addBusinessDays(request.apiClient, new Date(), 7);
	const deadlineString = dateISOStringToDisplayDate(extendedDeadline.toISOString());
	const pageContent = setNewDatePage(request.currentAppeal, deadlineString);

	return response
		.status(request.errors ? 400 : 200)
		.render('patterns/check-and-confirm-page.pattern.njk', {
			errors: request.errors,
			pageContent
		});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postSetNewDate = async (request, response) => {
	const {
		params: { appealId },
		errors
	} = request;

	if (errors) {
		return renderSetNewDate(request, response);
	}

	return response
		.status(200)
		.redirect(`/appeals-service/appeal-details/${appealId}/lpa-statement/incomplete/confirm`);
};

/**
 * @type {import('@pins/express').RenderHandler<{}>}
 */
export const renderCheckYourAnswers = async (
	{
		errors,
		currentAppeal: { appealReference, appealId },
		currentRepresentation,
		session: { lpaStatement },
		apiClient
	},
	response
) => {
	const reasonOptions = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);

	const rejectionReasons = prepareRejectionReasons(
		lpaStatement,
		lpaStatement.rejectionReason,
		reasonOptions
	);

	const attachmentsList =
		currentRepresentation.attachments.length > 0
			? buildHtmUnorderedList(
					currentRepresentation.attachments.map(
						(a) => `<a class="govuk-link" href="#">${a.documentVersion.document.name}</a>`
					)
			  )
			: null;

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and confirm statement is incomplete',
			heading: 'Check details and confirm statement is incomplete',
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/lpa-statement/incomplete/date`,
			submitButtonText: 'Confirm statement is incomplete',
			responses: {
				Statement: {
					html: '',
					pageComponents: [
						{
							type: 'show-more',
							parameters: {
								text: currentRepresentation.originalRepresentation,
								labelText: 'Statement'
							}
						}
					]
				},
				'Supporting documents': {
					value: !attachmentsList?.length ? 'Not provided' : undefined,
					html: attachmentsList?.length ? attachmentsList : undefined,
					actions: {
						Manage: {
							href: `#`,
							visuallyHiddenText: 'supporting documents'
						},

						Add: {
							href: `#`,
							visuallyHiddenText: 'supporting documents'
						}
					}
				},
				'Review decision': {
					value: statusFormatMap[lpaStatement.status],
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/lpa-statement`,
							visuallyHiddenText: 'Review decision'
						}
					}
				},
				'Why is the statement incomplete?': {
					html: rejectionReasonHtml(rejectionReasons),
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/lpa-statement/incomplete/reasons`,
							visuallyHiddenText: 'Incomplete reasons'
						}
					}
				},
				'Do you want to allow the LPA to resubmit their statement?': {
					html: capitalize(lpaStatement?.setNewDate),
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/lpa-statement/incomplete/date`,
							visuallyHiddenText: 'Incomplete reasons'
						}
					}
				}
			},
			after: [
				simpleHtmlComponent(
					'p',
					{ class: 'govuk-body' },
					'We’ll send an email to the LPA to explain why their statement is incomplete.'
				)
			]
		},
		response,
		errors
	);
};
