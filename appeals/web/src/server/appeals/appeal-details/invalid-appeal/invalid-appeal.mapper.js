import nunjucksEnvironments from '#app/config/nunjucks.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml } from '#lib/enhance-html.js';
import { yesNoInput } from '#lib/mappers/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { mapReasonsToReasonsListHtml } from '#lib/reasons-formatter.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { LENGTH_300 } from '@pins/appeals/constants/support.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { capitalize } from 'lodash-es';
/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../appellant-case/appellant-case.types.js').AppellantCaseValidationOutcome} AppellantCaseValidationOutcome
 * @typedef {import("@pins/express").ValidationErrors | undefined} ValidationErrors
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption}  ReasonOption
 */

/**
 *
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function decisionInvalidConfirmationPage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal invalid',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'Appeal invalid',
					headingLevel: 1,
					html: `Appeal reference<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: '<p class="govuk-body">The appeal has been closed. The relevant parties have been informed.</p>'
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
 * @param {import('#appeals/appeals.types.js').CheckboxItemParameter[]} mappedInvalidReasonOptions
 * @param {string} appealType
 * @param {string | undefined} errorMessage
 * @param {boolean} sourceIsAppellantCase
 * @returns {PageContent}
 */
export const mapInvalidReasonPage = (
	appealId,
	appealReference,
	mappedInvalidReasonOptions,
	appealType,
	errorMessage = undefined,
	sourceIsAppellantCase
) => {
	const shortAppealReference = appealShortReference(appealReference);
	const isEnforcementNotice = appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE;
	const backLinkUrl = isEnforcementNotice
		? `/appeals-service/appeal-details/${appealId}/appellant-case/invalid/enforcement-notice`
		: `/appeals-service/appeal-details/${appealId}/${
				sourceIsAppellantCase ? 'appellant-case' : 'cancel'
			}`;

	/** @type {PageContent} */
	const pageContent = {
		title: `Why is the appeal invalid?`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}${isEnforcementNotice ? '' : ' - mark as invalid'}`,
		heading: isEnforcementNotice ? 'Why is the appeal invalid?' : undefined,
		hint: isEnforcementNotice ? 'Select all that apply' : undefined,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'invalidReason',
					idPrefix: 'invalid-reason',
					fieldset: isEnforcementNotice
						? undefined
						: {
								legend: {
									text: 'Why is the appeal invalid?',
									isPageHeading: true,
									classes: 'govuk-fieldset__legend--l'
								}
							},
					items: mappedInvalidReasonOptions,
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	mappedInvalidReasonOptions
		// @ts-ignore
		.filter((option) => option.addAnother)
		.forEach((option) =>
			enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml(
				option,
				'invalidReason-',
				'invalid-reason-',
				'Enter a reason'
			)
		);
	return pageContent;
};

/**
 * @param {string} appealId
 * @param {string} appealReference
 * @param {string} invalidDate
 * @param {Object[]} invalidReasons
 * @returns {PageContent}
 */
export const viewInvalidAppealPage = (appealId, appealReference, invalidDate, invalidReasons) => {
	const formattedInvalidReasons = getFormattedReasons(invalidReasons);

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Why is the appeal invalid?'
					},
					value: {
						html: formattedInvalidReasons
					}
				},
				{
					key: {
						text: 'Invalid date'
					},
					value: {
						text: dateISOStringToDisplayDate(invalidDate)
					}
				}
			]
		}
	};

	const title = `Appeal marked as invalid`;
	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: title,
		pageComponents: [summaryListComponent]
	};

	return pageContent;
};

/**
 * @param {Object[]} reasonsArray
 * @returns {string} - List of formatted reasons
 */
export const getFormattedReasons = (reasonsArray) => {
	if (!reasonsArray || reasonsArray.length === 0) {
		throw new Error('No reasons found');
	}

	const reasons = reasonsArray.flatMap((item) => {
		// @ts-ignore
		const reasonName = /** @type {string} */ item.name;
		// @ts-ignore
		const reasonText = /** @type {string[]} */ item.text;

		if (reasonText.length > 0) {
			return reasonText.map((/** @type {string} */ textItem) => `${reasonName.name}: ${textItem}`);
		} else {
			return [reasonName.name];
		}
	});

	const listItems = reasons.map((reason) => `<li>${reason}</li>`).join('');

	return `<ul>${listItems}</ul>`;
};

/**
 * @param {Appeal} appealDetails
 * @param {string} [enforcementNoticeInvalid]
 * @returns {PageContent}
 * */
export const enforcementNoticeInvalidPage = (appealDetails, enforcementNoticeInvalid) => ({
	title: 'Is the enforcement notice invalid',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Is the enforcement notice invalid?',
	pageComponents: [
		yesNoInput({
			name: 'enforcementNoticeInvalid',
			id: 'enforcementNoticeInvalid',
			value: enforcementNoticeInvalid
		})
	]
});

/**
 * @param {Appeal} appealDetails
 * @param {(ReasonOption & { selected: boolean, text: string })[]} reasonOptions
 * @param {ValidationErrors} [errors]
 * @returns {PageContent}
 */
export const enforcementNoticeReasonPage = (appealDetails, reasonOptions, errors) => {
	const mappedInvalidReasonOptions = reasonOptions.map((reason) => {
		const reasonId = `invalid-reason-${reason.id}-1`;
		const reasonName = `invalidReason-${reason.id}`;
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
										text: 'Enter a reason',
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
		title: 'Why is the enforcement notice invalid',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/invalid/enforcement-notice`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'invalidReason',
					idPrefix: 'invalid-reason',
					fieldset: {
						legend: {
							text: 'Why is the enforcement notice invalid?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: mappedInvalidReasonOptions,
					...(errors?.invalidReason && { errorMessage: { text: errors.invalidReason.msg } })
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealDetails
 * @param {string} [otherLiveAppeals]
 * @returns {PageContent}
 * */
export const otherLiveAppealsPage = (appealDetails, otherLiveAppeals) => ({
	title: 'Are there any other live appeals against the enforcement notice',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/invalid`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Are there any other live appeals against the enforcement notice?',
	pageComponents: [
		yesNoInput({
			name: 'otherLiveAppeals',
			id: 'otherLiveAppeals',
			value: otherLiveAppeals
		})
	]
});

/**
 *
 * @param {Appeal} appealDetails
 * @param {ReasonOption[]} reasonOptions
 * @param {ReasonOption[]} incompleteReasonOptions
 * @param {ReasonOption[]} missingDocuments
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {PageContent}
 */
export const checkDetailsAndMarkEnforcementAsInvalid = (
	appealDetails,
	reasonOptions,
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
	const mappedInvalidReasonOptions = reasonOptions
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
				text: `Why is the appeal ${validationOutcome}?`
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

	// ground (a) fee receipt due date
	if (session?.webAppellantCaseReviewOutcome.feeReceiptDueDate) {
		const dueDate = session.webAppellantCaseReviewOutcome.feeReceiptDueDate;
		summaryListComponent.parameters.rows.push({
			key: { text: 'Ground (a) fee receipt due date' },
			value: { text: formatDate(new Date(dueDate.year, dueDate.month, dueDate.day)) },
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/incomplete/receipt-due-date`,
						visuallyHiddenText: 'Ground (a) fee receipt due date'
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

	const title =
		validationOutcome === 'invalid'
			? 'Check details and mark enforcement notice as invalid'
			: 'Check details and mark appeal as incomplete';
	const helperText =
		validationOutcome === 'invalid'
			? `<p class="govuk-body">We will mark the enforcement notice as ${validationOutcome} and send an email to the relevant parties.</p>`
			: `<p class="govuk-body">We will mark the appeal as ${validationOutcome} and send an email to the relevant parties.</p>`; // TO DO CHECK THIS ON OTHER FLOW TOO

	return {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/invalid/enforcement-other-information`,
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
			text:
				validationOutcome === 'invalid'
					? 'Mark enforcement notice as invalid'
					: 'Mark appeal as incomplete',
			id: 'continue'
		}
	};
};
