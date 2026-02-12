import nunjucksEnvironments from '#app/config/nunjucks.js';
import { rejectionReasonHtml } from '#appeals/appeal-details/representations/common/components/reject-reasons.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml } from '#lib/enhance-html.js';
import { dateInput } from '#lib/mappers/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { mapReasonsToReasonsListHtml } from '#lib/reasons-formatter.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { LENGTH_300 } from '@pins/appeals/constants/support.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { capitalize } from 'lodash-es';

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
 * @param {string} backLinkUrl
 * @param {number | string} [dueDateDay]
 * @param {number | string} [dueDateMonth]
 * @param {number | string} [dueDateYear]
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function updateFeeReceiptDueDatePage(
	appealData,
	backLinkUrl,
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
		backLinkUrl,
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

/**
 *
 * @param {import('../appellant-case.mapper.js').Appeal} appealDetails
 * @param {import('../appellant-case.service.js').ReasonOption[]} enforcementInvalidReasonOptions
 * @param {import('../appellant-case.service.js').ReasonOption[]} incompleteReasonOptions
 * @param {import('../appellant-case.service.js').ReasonOption[]} missingDocuments
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {PageContent}
 */
export const checkDetailsAndMarkEnforcementAsIncomplete = (
	appealDetails,
	enforcementInvalidReasonOptions,
	incompleteReasonOptions,
	missingDocuments,
	session
) => {
	const {
		enforcementNoticeInvalid,
		enforcementNoticeReason = [],
		otherInformationValidRadio,
		otherInformationDetails,
		validationOutcome
	} = session?.webAppellantCaseReviewOutcome || {};
	// @ts-ignore
	const selectedReasons = enforcementNoticeReason.map((reason) => reason.reasonSelected);
	const mappedInvalidReasonOptions = enforcementInvalidReasonOptions
		.filter((reason) => selectedReasons.includes(reason.id))
		.map(({ name, id }) => ({
			id,
			name,
			text:
				// @ts-ignore
				enforcementNoticeReason.find(({ reasonSelected }) => reasonSelected === id)?.reasonText ||
				''
		}));
	const formatedEnforcementNoticeReasons = mappedInvalidReasonOptions
		.map(({ name, text }) =>
			nunjucksEnvironments.render('appeals/components/page-component.njk', {
				component: {
					type: 'show-more',
					parameters: {
						html: `<li>${name}: ${text}</li>`,
						maximumBeforeHiding: LENGTH_300,
						toggleTextCollapsed: 'Show more',
						toggleTextExpanded: 'Show less'
					}
				}
			})
		)
		.join('');
	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: { text: 'What is the outcome of your review?' },
					value: { text: capitalizeFirstLetter(validationOutcome) },
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case`,
								visuallyHiddenText: 'review outcome'
							}
						]
					}
				},
				{
					key: { text: 'Is the enforcement notice invalid?' },
					value: { text: capitalizeFirstLetter(enforcementNoticeInvalid) },
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/${validationOutcome}/enforcement-notice`,
								visuallyHiddenText: `is the enforcement notice ${validationOutcome}?`
							}
						]
					}
				}
			]
		}
	};
	if (formatedEnforcementNoticeReasons) {
		summaryListComponent.parameters.rows.push({
			key: { text: 'Why is the enforcement notice invalid?' },
			value: {
				html: `<ul class="govuk-list govuk-list--bullet">${formatedEnforcementNoticeReasons}</ul>`
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/${validationOutcome}/enforcement-notice-reason`,
						visuallyHiddenText: `why is the enforcement notice ${validationOutcome}?`
					}
				]
			}
		});
	}

	// appeal incomplete
	if (session?.webAppellantCaseReviewOutcome.reasons) {
		summaryListComponent.parameters.rows.push({
			key: {
				text: `Why is the appeal Incomplete?`
			},
			value: {
				html: mapReasonsToReasonsListHtml(
					incompleteReasonOptions,
					session?.webAppellantCaseReviewOutcome.reasons,
					session?.webAppellantCaseReviewOutcome.reasonsText
				)
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/${validationOutcome}`,
						visuallyHiddenText: `${capitalize(validationOutcome)} reasons`
					}
				]
			}
		});
	}

	// documents incomplete
	if (session?.webAppellantCaseReviewOutcome.missingDocuments) {
		summaryListComponent.parameters.rows.push({
			key: {
				text: `Which documents are incomplete?`
			},
			value: {
				html: nunjucksEnvironments.render('appeals/components/page-component.njk', {
					component: {
						type: 'show-more',
						parameters: {
							html: mapReasonsToReasonsListHtml(
								missingDocuments,
								session?.webAppellantCaseReviewOutcome.missingDocuments,
								session?.webAppellantCaseReviewOutcome.missingDocumentsText
							)
						}
					}
				})
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/${validationOutcome}/missing-documents`,
						visuallyHiddenText: `${capitalize(validationOutcome)} reasons`
					}
				]
			}
		});
	}

	// appeal due date
	if (session?.webAppellantCaseReviewOutcome.updatedDueDate) {
		const dueDate = session.webAppellantCaseReviewOutcome.updatedDueDate;
		summaryListComponent.parameters.rows.push({
			key: { text: 'Appeal due date' },
			value: { text: formatDate(new Date(dueDate.year, dueDate.month, dueDate.day)) },
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/${validationOutcome}/date`,
						visuallyHiddenText: 'Appeal due date'
					}
				]
			}
		});
	}
	// ground and facts
	console.log(session.webAppellantCaseReviewOutcome.enforcementGroundsMismatchText);
	if (session?.webAppellantCaseReviewOutcome.enforcementGroundsMismatchText) {
		summaryListComponent.parameters.rows.push({
			key: { text: 'Grounds and facts do not match' },
			value: {
				html: nunjucksEnvironments.render('appeals/components/page-component.njk', {
					component: {
						type: 'show-more',
						parameters: {
							html: mapGroundsAndFactsListHtml(
								session.webAppellantCaseReviewOutcome.enforcementGroundsMismatchText
							),
							maximumBeforeHiding: LENGTH_300,
							toggleTextCollapsed: 'Show more',
							toggleTextExpanded: 'Show less'
						}
					}
				})
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/${validationOutcome}/grounds-and-facts`,
						visuallyHiddenText: 'Grounds and facts'
					}
				]
			}
		});
	}
	// other information
	if (otherInformationDetails) {
		summaryListComponent.parameters.rows.push({
			key: { text: 'Do you want to add any other information?' },
			value: {
				html: nunjucksEnvironments.render('appeals/components/page-component.njk', {
					component: {
						type: 'show-more',
						parameters: {
							html: otherInformationValidRadio === 'Yes' ? `Yes: ${otherInformationDetails}` : 'No',
							maximumBeforeHiding: LENGTH_300,
							toggleTextCollapsed: 'Show more',
							toggleTextExpanded: 'Show less'
						}
					}
				})
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/${validationOutcome}/enforcement-other-information`,
						visuallyHiddenText: 'do you want to add any other information?'
					}
				]
			}
		});
	}

	const title = 'Check details and mark appeal as incomplete';
	const helperText = `<p class="govuk-body">We will mark the appeal as ${validationOutcome} and send an email to the relevant parties.</p>`; // TO DO CHECK THIS ON OTHER FLOW TOO

	return {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/${validationOutcome}/enforcement-other-information`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		heading: title,
		pageComponents: [
			summaryListComponent,
			{
				type: 'html',
				parameters: {
					html: helperText
				}
			}
		],
		submitButtonProperties: {
			text: `Mark appeal as ${validationOutcome}`,
			id: 'continue'
		}
	};
};

/**
 * @param {any[]} groundsAndFacts
 */
export function mapGroundsAndFactsListHtml(groundsAndFacts) {
	if (!groundsAndFacts || groundsAndFacts.length === 0) {
		return '';
	}
	const items = groundsAndFacts.map(
		(/** @type {{ name: any; text: any; }} */ ground) => `Ground ${ground.name}: ${ground.text}`
	);
	return rejectionReasonHtml(items);
}
