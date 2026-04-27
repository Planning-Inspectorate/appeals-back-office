/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { checkboxesInput } from '#lib/mappers/components/page-components/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {string} backLinkUrl
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageContent}
 */
export const manageSignificantChangesPage = (
	appealData,
	appellantCaseData,
	backLinkUrl,
	errors
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const anySignificantChangesOptions = [
		{
			value: 'anySignificantChanges_localPlanSignificantChanges',
			label: 'Adopted a new local plan',
			text: appellantCaseData?.anySignificantChanges_localPlanSignificantChanges,
			hasText: true
		},
		{
			value: 'anySignificantChanges_nationalPolicySignificantChanges',
			label: 'National policy change',
			text: appellantCaseData?.anySignificantChanges_nationalPolicySignificantChanges,
			hasText: true
		},
		{
			value: 'anySignificantChanges_courtJudgementSignificantChanges',
			label: 'Court judgement',
			text: appellantCaseData?.anySignificantChanges_courtJudgementSignificantChanges,
			hasText: true
		},
		{
			value: 'anySignificantChanges_otherSignificantChanges',
			label: 'Other',
			text: appellantCaseData?.anySignificantChanges_otherSignificantChanges,
			hasText: true
		}
	];
	const mappedOptions = anySignificantChangesOptions.map((options) => {
		const optionsId = `anySignificantChangesRadio-${options.value}`;
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
				name: 'anySignificantChangesReasonCheckboxes',
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
