/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { checkboxesInput } from '#lib/mappers/components/page-components/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} LPAQuestionnaire
 * @param {Appeal} appealData
 * @param {LPAQuestionnaire} lpaQuestionnaireData
 * @param {string} backLinkUrl
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageContent}
 */
export const manageSignificantChangesLpaPage = (
	appealData,
	lpaQuestionnaireData,
	backLinkUrl,
	errors
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const anySignificantChangesLpaOptions = [
		{
			value: 'anySignificantChangesLpa_localPlanSignificantChanges',
			label: 'Adopted a new local plan',
			text: lpaQuestionnaireData?.anySignificantChangesLpa_localPlanSignificantChanges,
			hasText: true
		},
		{
			value: 'anySignificantChangesLpa_nationalPolicySignificantChanges',
			label: 'National policy change',
			text: lpaQuestionnaireData?.anySignificantChangesLpa_nationalPolicySignificantChanges,
			hasText: true
		},
		{
			value: 'anySignificantChangesLpa_courtJudgementSignificantChanges',
			label: 'Court judgement',
			text: lpaQuestionnaireData?.anySignificantChangesLpa_courtJudgementSignificantChanges,
			hasText: true
		},
		{
			value: 'anySignificantChangesLpa_otherSignificantChanges',
			label: 'Other',
			text: lpaQuestionnaireData?.anySignificantChangesLpa_otherSignificantChanges,
			hasText: true
		}
	];
	const mappedOptions = anySignificantChangesLpaOptions.map((options) => {
		const optionsId = `anySignificantChangesLpaRadio-${options.value}`;
		const optionName = options.value;
		const optionsError = errors?.[`${optionName}`];

		return {
			value: options.value,
			text: options.label,
			checked: options.text,
			conditional: options.hasText
				? {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: `${optionsId}-details`,
									name: optionName,
									// @ts-ignore
									value: options.text ?? '',
									...(optionsError && { errorMessage: { text: optionsError.msg } }),
									label: {
										text: 'Enter details',
										classes: 'govuk-label--s'
									}
								}
							}
						])
					}
				: undefined
		};
	});

	/** @type {PageContent} */
	const pageContent = {
		title: 'Have there been any significant changes that would affect the application?',
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			checkboxesInput({
				name: 'anySignificantChangesReasonLpaCheckboxes',
				items: [
					...mappedOptions,
					{
						divider: 'or'
					},
					{
						text: 'There have been no significant changes',
						value: 'none',
						behaviour: 'exclusive'
					}
				],
				legendText: 'Have there been any significant changes that would affect the application?',
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
