import { appealShortReference } from '#lib/appeals-formatter.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import { mapUncommittedDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { getErrorByFieldname } from '#lib/error-handlers/change-screen-error-handlers.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('./issue-decision.types.js').InspectorDecisionRequest} InspectorDecisionRequest
 * @typedef {import('./issue-decision.types.js').AppellantCostDecisionRequest} AppellantCostDecisionRequest
 * @typedef {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem} FileUploadInfoItem
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {InspectorDecisionRequest} inspectorDecision
 * @param {string|undefined} backUrl
 * @param {import("@pins/express").ValidationErrors} [errors]
 * @returns {PageContent}
 */
export function issueDecisionPage(appealDetails, inspectorDecision, backUrl, errors) {
	/** @type {PageComponent} */
	const summaryBlock = {
		type: 'inset-text',
		parameters: {
			classes: 'govuk-!-margin-top-0',
			html: '',
			pageComponents: [
				{
					type: 'summary-list',
					parameters: {
						rows: [
							...(appealDetails.appellant
								? [
										{
											key: {
												text: 'Appellant'
											},
											value: {
												text: `${appealDetails.appellant.firstName} ${appealDetails.appellant.lastName}`
											}
										}
								  ]
								: []),
							...(appealDetails.appealSite
								? [
										{
											key: {
												text: 'Site address'
											},
											value: {
												html: appealDetails.appealSite
													? addressToMultilineStringHtml(
															/** @type {import('@pins/appeals').Address} */ (
																appealDetails.appealSite
															)
													  )
													: null
											}
										}
								  ]
								: []),
							{
								key: {
									text: 'Appeal type'
								},
								value: {
									text: appealDetails.appealType
								}
							}
						]
					}
				}
			]
		}
	};

	const fieldName = 'decision';

	/** @type {PageComponent} */
	const selectVisitTypeComponent = {
		type: 'radios',
		parameters: {
			name: fieldName,
			idPrefix: fieldName,
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
					checked: inspectorDecision?.outcome === 'Split'
				},
				{
					value: 'Invalid',
					text: 'Invalid',
					checked: inspectorDecision?.outcome === 'Invalid'
				}
			],
			errorMessage: getErrorByFieldname(errors, fieldName)
		}
	};

	const pageComponents = [summaryBlock, selectVisitTypeComponent];

	preRenderPageComponents(pageComponents);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the decision? - ${shortAppealReference}`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - issue decision`,
		heading: 'Decision',
		pageComponents
	};

	return pageContent;
}
/**
 *
 * @param {Appeal} appealDetails
 * @param {AppellantCostDecisionRequest} appellantCostDecision
 * @param {string|undefined} backUrl
 * @param {any} errors
 * @returns {PageContent}
 */
export function appellantCostDecisionPage(appealDetails, appellantCostDecision, backUrl, errors) {
	/** @type {PageComponent} */
	const selectAppellantCostDecisionComponent = {
		type: 'radios',
		parameters: {
			name: 'appellantCostDecision',
			idPrefix: 'appellant-cost-decision',
			fieldset: {
				legend: {
					text: "Do you want to issue the appellant's costs decision?",
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					value: true,
					text: 'Yes',
					checked: appellantCostDecision?.outcome === 'true'
				},
				{
					value: false,
					text: 'No',
					checked: appellantCostDecision?.outcome === 'false'
				}
			],
			errorMessage: errors?.appellantCostDecision?.msg
		}
	};

	const pageComponents = [selectAppellantCostDecisionComponent];

	preRenderPageComponents(pageComponents);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the appellant cost decision? - ${shortAppealReference}`,
		backLinkUrl:
			backUrl ||
			`/appeals-service/appeal-details/${appealDetails.appealId}/issue-decision/decision-letter-upload`,
		preHeading: `Appeal ${shortAppealReference} - issue decision`,
		pageComponents
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {string} decisionLetterDay
 * @param {string} decisionLetterMonth
 * @param {string} decisionLetterYear
 * @returns {PageContent}
 */
export function dateDecisionLetterPage(
	appealData,
	decisionLetterDay,
	decisionLetterMonth,
	decisionLetterYear
) {
	const title = 'Enter date of decision letter';

	/** @type {PageComponent} */
	const selectDateComponent = {
		type: 'date-input',
		parameters: {
			id: 'decision-letter-date',
			namePrefix: 'decision-letter-date',
			fieldset: {
				legend: {
					text: '',
					classes: 'govuk-fieldset__legend--m'
				}
			},
			hint: {
				text: 'For example, 27 3 2023'
			},
			items: [
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'day',
					value: decisionLetterDay || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
					name: 'month',
					value: decisionLetterMonth || ''
				},
				{
					classes: 'govuk-input govuk-date-input__input govuk-input--width-4',
					name: 'year',
					value: decisionLetterYear || ''
				}
			]
		}
	};

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
 *
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {string} documentType
 * @returns {FileUploadInfoItem|undefined}
 */
function findFileInformaton(session, documentType) {
	return session.fileUploadInfo?.files?.find(
		(/** @type {FileUploadInfoItem} */ fileInfo) => fileInfo.documentType === documentType
	);
}

/**
 *
 * @param {Appeal} appealData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {{ key: { text: string; }; value: { html: string; text?: undefined; } | { text: string; html?: undefined; }; actions: { items: { text: string; href: string; visuallyHiddenText: string; }[]; }; }[]}
 */
function checkAndConfirmPageRows(appealData, session) {
	const decisionOutcome = mapDecisionOutcome(session.inspectorDecision?.outcome);
	const baseRoute = `/appeals-service/appeal-details/${appealData.appealId}/issue-decision`;
	const currentRoute = encodeURIComponent(`${baseRoute}/check-your-decision`);
	const rows = [
		{
			key: 'Decision',
			value: decisionOutcome,
			href: '',
			actions: [
				{
					text: 'Change',
					href: `${baseRoute}/decision?backUrl=${currentRoute}`,
					visuallyHiddenText: 'decision'
				}
			]
		}
	];

	const caseDecisionLetter = findFileInformaton(session, 'caseDecisionLetter');

	if (caseDecisionLetter) {
		const href = mapUncommittedDocumentDownloadUrl(
			appealData.appealReference,
			caseDecisionLetter.GUID,
			caseDecisionLetter.name
		);
		rows.push({
			key: 'Decision letter',
			value: caseDecisionLetter.name,
			href,
			actions: [
				{
					text: 'Change',
					href: `${baseRoute}/decision-letter-upload?backUrl=${currentRoute}`,
					visuallyHiddenText: 'decision letter'
				}
			]
		});
	}

	const appellantCostDecisionOutcome = session.appellantCostDecision?.outcome;
	if (appellantCostDecisionOutcome) {
		rows.push({
			key: "Do you want to issue the appellant's costs decision?",
			value: appellantCostDecisionOutcome === 'true' ? 'Yes' : 'No',
			href: '',
			actions: [
				{
					text: 'Change',
					href: `${baseRoute}/appellant-cost-decision?backUrl=${currentRoute}`,
					visuallyHiddenText: 'appellant cost decision'
				}
			]
		});
	}

	return rows.map(({ key, value, href = '', actions }) => {
		return {
			key: { text: key },
			value: href
				? { html: `<a class="govuk-link" download href="${href}" target="_blank">${value}</a>` }
				: { text: value },
			actions: {
				items: actions
			}
		};
	});
}

/**
 * @param {Appeal} appealData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {PageContent}
 */
export function checkAndConfirmPage(appealData, session) {
	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: checkAndConfirmPageRows(appealData, session)
		}
	};

	const title = 'Check details and issue decision';
	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/issue-decision/decision`,
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		submitButtonText: 'Send decision',
		pageComponents: [summaryListComponent]
	};

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
						html: displayPageFormatter.formatFreeTextForDisplay(session.invalidReason)
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
