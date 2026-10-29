import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {PageContent}
 */
export const mapRedetermineConfirmationPage = (appealDetails) => {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);
	const appealId = appealDetails.appealId;

	/** @type {PageComponent} */
	const warningNotice = {
		type: 'html',
		parameters: {
			html: `
				<div class="govuk-warning-text">
					<span class="govuk-warning-text__icon" aria-hidden="true">!</span>
					<strong class="govuk-warning-text__text">
						<span class="govuk-visually-hidden">Warning</span>
						Reopening this appeal for redetermination will remove the previous inspector decision and site visit records. The case status will be reset to Event so that redetermination evidence can be uploaded and a new site visit or decision can be scheduled and issued.
					</strong>
				</div>
			`
		}
	};

	return {
		title: `Confirm redetermination - ${shortAppealReference}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Confirm redetermination',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		backLinkText: 'Back',
		pageComponents: [warningNotice],
		submitButtonProperties: {
			text: 'Confirm and reopen appeal',
			type: 'submit',
			classes: 'govuk-button'
		}
	};
};
