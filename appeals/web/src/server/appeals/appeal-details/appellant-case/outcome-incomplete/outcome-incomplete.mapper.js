import { appealShortReference } from '#lib/appeals-formatter.js';
import { enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml } from '#lib/enhance-html.js';
import { dateInput } from '#lib/mappers/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function decisionIncompleteConfirmationPage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal incomplete',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'Appeal incomplete',
					headingLevel: 1,
					html: `Appeal reference<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: '<p class="govuk-body">The relevant parties have been informed. We have told them what to do next and the due date for missing information.</p>'
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">Go back to case details</a></p>`
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {string} appealId
 * @param {string} appealReference
 * @param {string} appealType
 * @param {import('#appeals/appeals.types.js').CheckboxItemParameter[]} mappedIncompleteReasonOptions
 * @param {string | undefined} errorMessage
 * @returns {PageContent}
 */
export const mapIncompleteReasonPage = (
	appealId,
	appealReference,
	appealType,
	mappedIncompleteReasonOptions,
	errorMessage = undefined
) => {
	const shortAppealReference = appealShortReference(appealReference);

	mappedIncompleteReasonOptions.sort((a, b) => {
		// identify id 10 'other' and send to back of item list
		if (a.value === '10') return 1;

		if (b.value === '10') return -1;

		return +a.value - +b.value;
	});

	/** @type {PageContent} */
	const pageContent = {
		title: `Why is the appeal incomplete?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/appellant-case${appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE ? '/incomplete/enforcement-notice' : ''}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'incompleteReason',
					idPrefix: 'incomplete-reason',
					fieldset: {
						legend: {
							text: 'Why is the appeal incomplete?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: mappedIncompleteReasonOptions,
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	mappedIncompleteReasonOptions
		// @ts-ignore
		.filter((option) => option.addAnother)
		.forEach((option) =>
			enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml(
				option,
				'incompleteReason-',
				'incomplete-reason-',
				'Which part is incorrect or incomplete?'
			)
		);
	return pageContent;
};

/**
 * @param {string} appealId
 * @param {string} appealReference
 * @param {(any & { selected: boolean, text: string })[]} reasonOptions
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageContent}
 */
export const enforcementMissingDocumentsPage = (
	appealId,
	appealReference,
	reasonOptions,
	errors
) => {
	const mappedEnforcementMissingDocuments = reasonOptions.map((reason) => {
		const reasonId = `missing-documents-${reason.id}-1`;
		const reasonName = `missingDocuments-${reason.id}`;
		const reasonError = errors?.[`${reasonName}-1`];
		return {
			value: reason.id,
			text: reason.name,
			checked: reason.selected || !!reason.text,
			conditional: reason.hasText
				? {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: reasonId,
									name: reasonName,
									value: reason.text ?? '',
									...(reasonError && { errorMessage: { text: reasonError.msg } }),
									label: {
										text: 'Enter more information',
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
		title: 'Which documents are missing?',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/appellant-case/incomplete`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'missingDocuments',
					idPrefix: 'missing-documents',
					fieldset: {
						legend: {
							text: 'Which documents are missing?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: mappedEnforcementMissingDocuments,
					...(errors?.missingDocuments && { errorMessage: { text: errors.missingDocuments.msg } })
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {import('../appellant-case.mapper.js').Appeal} appealData
 * @param {number | string} [dueDateDay]
 * @param {number | string} [dueDateMonth]
 * @param {number | string} [dueDateYear]
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function updateFeeReceiptDueDatePage(
	appealData,
	errors,
	dueDateDay,
	dueDateMonth,
	dueDateYear
) {
	let existingDueDate = {
		day: dueDateDay,
		month: dueDateMonth,
		year: dueDateYear
	};

	/** @type {PageContent} */
	const pageContent = {
		title: 'Ground (a) fee receipt due date',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case/incomplete/`,
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: 'Ground (a) fee receipt due date',
		submitButtonProperties: {
			text: 'Continue',
			type: 'submit'
		},
		pageComponents: [
			dateInput({
				name: 'fee-receipt-due-date',
				id: 'fee-receipt-due-date',
				namePrefix: 'fee-receipt-due-date',
				hint: 'For example, 31 3 2025',
				value: {
					day: existingDueDate.day,
					month: existingDueDate.month,
					year: existingDueDate.year
				},
				legendText: '',
				errors: errors
			})
		]
	};

	return pageContent;
}
