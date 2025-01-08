import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

const statusFormatMap = {
	[COMMENT_STATUS.INCOMPLETE]: 'Statement incomplete'
};

/**
 * @type {import('@pins/express').RenderHandler<{}>}
 */
export const renderCheckYourAnswers = (
	{ errors, currentAppeal: { appealReference, appealId }, session: { lpaStatement } },
	response
) => {
	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and confirm statement is incomplete',
			heading: 'Check details and confirm statement is incomplete',
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/lpa-statement`,
			submitButtonText: 'Confirm statement is incomplete',
			responses: {
				'Review decision': {
					value: statusFormatMap[lpaStatement.status],
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/lpa-statement`,
							visuallyHiddenText: 'Review decision'
						}
					}
				}
			}
		},
		response,
		errors
	);
};
