import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { renderSelectRejectionReasons } from '../../common/render-select-rejection-reasons.js';
import { rejectLpaStatementPage } from './incomplete.mapper.js';
import { rejectionReasonHtml } from '../../common/components/reject-reasons.js';
import { getRepresentationRejectionReasonOptions } from '../../representations.service.js';
import { ensureArray } from '#lib/array-utilities.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';

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
	const rejectionReasons = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);
	const selectedReasons = ensureArray(lpaStatement?.rejectionReason);

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
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/lpa-statement`,
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
					html: rejectionReasonHtml(selectedReasons, rejectionReasons),
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/lpa-statement/incomplete/reasons`,
							visuallyHiddenText: 'Incomplete reasons'
						}
					}
				}
			}
		},
		response,
		errors
	);
};
