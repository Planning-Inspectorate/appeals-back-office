import { appealShortReference } from '#lib/appeals-formatter.js';
import { APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1 } from '@pins/appeals/constants/support.js';

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
						Reopening this appeal for redetermination will remove the previous inspector decision and site visit records. The case will move to Redetermination Stage 1 so that redetermination evidence can be uploaded and the case progressed to stage 2 and event.
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

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {PageContent}
 */
export const mapProgressConfirmationPage = (appealDetails) => {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);
	const appealId = appealDetails.appealId;
	const isStage1 = appealDetails.appealStatus === APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1;
	const targetStageText = isStage1 ? 'stage 2' : 'event';
	const submitButtonText = isStage1 ? 'Progress to stage 2' : 'Progress to event';

	/** @type {PageComponent} */
	const notice = {
		type: 'html',
		parameters: {
			html: `
				<p class="govuk-body">
					Are you sure you want to progress this redetermined appeal to <strong>${targetStageText}</strong>?
				</p>
			`
		}
	};

	return {
		title: `Progress redetermination - ${shortAppealReference}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Progress redetermination to ${targetStageText}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		backLinkText: 'Back',
		pageComponents: [notice],
		submitButtonProperties: {
			text: submitButtonText,
			type: 'submit',
			classes: 'govuk-button'
		}
	};
};
