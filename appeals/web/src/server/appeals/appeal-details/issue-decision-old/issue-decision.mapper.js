import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { dateInput } from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { logger } from '@azure/storage-blob';
import { issueDecisionDateField } from './issue-decision.constants.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */
/**
 * @typedef {import('./issue-decision.types.js').InspectorDecisionRequest} InspectorDecisionRequest
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {InspectorDecisionRequest} inspectorDecision
 * @param {string|undefined} backUrl
 * @returns {PageContent}
 */
export function issueDecisionPage(appealDetails, inspectorDecision, backUrl) {
	/** @type {PageComponent} */
	const selectVisitTypeComponent = {
		type: 'radios',
		parameters: {
			name: 'decision',
			idPrefix: 'decision',
			fieldset: {
				legend: {
					text: 'What is the decision?',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					value: 'Allowed',
					text: 'Allowed',
					checked: inspectorDecision?.outcome === 'Allowed'
				},
				{
					value: 'Dismissed',
					text: 'Dismissed',
					checked: inspectorDecision?.outcome === 'Dismissed'
				},
				{
					value: 'Split',
					text: 'Split Decision',
					checked: inspectorDecision?.outcome === 'Split-decision'
				},
				{
					value: 'Invalid',
					text: 'Invalid',
					checked: inspectorDecision?.outcome === 'Invalid'
				}
			]
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the decision? - ${shortAppealReference}`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectVisitTypeComponent]
	};

	return pageContent;
}

/**
 * @returns {PageComponent[]}
 */
export function decisionLetterUploadPageBodyComponents() {
	const checklistHtml = `<ul class="govuk-list govuk-list--bullet">
	<li>added the correct appeal reference</li>
	<li>added the decision date and visit date</li>
	<li>added the correct site address</li>
	<li>added the decision to the top and bottom of the letter</li>
	<li>signed the letter</li>
</ul>`;

	return [
		{
			type: 'warning-text',
			parameters: {
				text: 'Before uploading, check that you have:'
			}
		},
		{
			type: 'html',
			parameters: {
				html: checklistHtml
			}
		}
	];
}

/**
 *
 * @param {Appeal} appealData
 * @param {string} decisionLetterDay
 * @param {string} decisionLetterMonth
 * @param {string} decisionLetterYear
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function dateDecisionLetterPage(
	appealData,
	decisionLetterDay,
	decisionLetterMonth,
	decisionLetterYear,
	errors
) {
	const title = 'Enter date of decision letter';

	// /** @type {PageComponent} */
	const selectDateComponent = dateInput({
		name: issueDecisionDateField,
		id: issueDecisionDateField,
		namePrefix: issueDecisionDateField,
		value: {
			day: decisionLetterDay,
			month: decisionLetterMonth,
			year: decisionLetterYear
		},
		legendText: 'Select date',
		hint: 'For example, 27 3 2023',
		errors: errors
	});

	return {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/decision-letter-upload`,
		backLinkText: 'Back',
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		pageComponents: [selectDateComponent]
	};
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {Appeal} appealData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {PageContent}
 */
export function checkAndConfirmPage(request, appealData, session) {
	const decisionOutcome = mapDecisionOutcome(session.inspectorDecision?.outcome);
	const decisionLetter = session.fileUploadInfo?.files[0]?.name;
	const letterDate = session.inspectorDecision?.letterDate;
	logger.info(
		`checkAndConfirmPage: decisionOutcome=${decisionOutcome}, decisionLetter=${decisionLetter}, letterDate=${letterDate}`
	);
	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Decision'
					},
					value: {
						text: decisionOutcome
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/decision`,
								visuallyHiddenText: 'decision'
							}
						]
					}
				},
				{
					key: {
						text: 'Decision letter'
					},
					value: {
						text: decisionLetter
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/decision-letter-upload`,
								visuallyHiddenText: 'decision letter'
							}
						]
					}
				},
				{
					key: {
						text: 'Decision date'
					},
					value: {
						text: dateISOStringToDisplayDate(letterDate)
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/decision-letter-date`,
								visuallyHiddenText: 'decision date'
							}
						]
					}
				}
			]
		}
	};

	/** @type {PageComponent} */
	const warningTextComponent = {
		type: 'warning-text',
		parameters: {
			text: 'You are about to send the decision to relevant parties and close the appeal. Make sure you have reviewed the decision information.'
		}
	};

	/** @type {PageComponent} */
	const insetConfirmComponent = {
		type: 'checkboxes',
		parameters: {
			name: 'ready-to-send',
			idPrefix: 'ready-to-send',
			items: [
				{
					text: 'This decision is ready to be sent to the relevant parties',
					value: 'yes',
					checked: false
				}
			]
		}
	};

	const title = 'Check your answers';
	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/decision-letter-date`,
		backLinkText: 'Back',
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		submitButtonText: 'Send decision',
		pageComponents: [summaryListComponent, warningTextComponent, insetConfirmComponent]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {String} invalidReason
 * @returns {PageContent}
 */
export function invalidReasonPage(appealData, invalidReason) {
	const title = 'Why is the appeal invalid?';

	/** @type {PageComponent} */
	const invalidReasonComponent = {
		type: 'character-count',
		parameters: {
			id: 'decision-invalid-reason',
			name: 'decisionInvalidReason',
			rows: '15',
			maxlength: 1000,
			value: invalidReason || '',
			hint: {
				text: 'This information will be shared with all parties.'
			}
		}
	};
	return {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/decision`,
		backLinkText: 'Back',
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		pageComponents: [invalidReasonComponent]
	};
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {Appeal} appealData
 * @param  {import('./issue-decision.types.js').InspectorDecisionRequest} session
 * @returns {PageContent}
 */
export function checkAndConfirmInvalidPage(request, appealData, session) {
	const decisionOutcome = 'Invalid';

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Decision'
					},
					value: {
						text: decisionOutcome
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/decision`,
								visuallyHiddenText: 'decision'
							}
						]
					}
				},
				{
					key: {
						text: 'Reasons'
					},
					value: {
						html: '',
						pageComponents: [
							{
								type: 'show-more',
								parameters: {
									html: displayPageFormatter.formatFreeTextForDisplay(session.invalidReason),
									labelText: 'Read more'
								}
							}
						]
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/invalid-reason`,
								visuallyHiddenText: 'invalid reasons'
							}
						]
					}
				}
			]
		}
	};

	/** @type {PageComponent} */
	const warningTextComponent = {
		type: 'warning-text',
		parameters: {
			text: 'You are about to send the decision to relevant parties and close the appeal. Make sure you have reviewed the decision information.'
		}
	};

	/** @type {PageComponent} */
	const insetConfirmComponent = {
		type: 'checkboxes',
		parameters: {
			name: 'ready-to-send',
			idPrefix: 'ready-to-send',
			items: [
				{
					text: 'This decision is ready to be sent to the relevant parties',
					value: 'yes',
					checked: false
				}
			]
		}
	};

	const title = 'Check your answers';
	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/invalid-reason`,
		backLinkText: 'Back',
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		submitButtonText: 'Send decision',
		pageComponents: [summaryListComponent, warningTextComponent, insetConfirmComponent]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 * Checks if the given outcome is a valid InspectorDecisionRequest and returns the corresponding mapped value.
 * @param {string | undefined} outcome The outcome to check.
 * @returns {string} The mapped decision string, or a default value if the outcome is invalid or undefined.
 */
export function mapDecisionOutcome(outcome) {
	switch (outcome?.toLowerCase()) {
		case 'allowed':
			return 'Allowed';
		case 'dismissed':
			return 'Dismissed';
		case 'split':
		case 'split_decision':
			return 'Split decision';
		case 'invalid':
			return 'Invalid';
		default:
			return '';
	}
}

/**
 * @param {string|number} appealId
 * @returns {string}
 */
export function generateIssueDecisionUrl(appealId) {
	return `/appeals-service/appeal-details/${appealId}/issue-decision/decision`;
}
