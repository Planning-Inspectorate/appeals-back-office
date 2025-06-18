import { appealShortReference } from '#lib/appeals-formatter.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import {
	preRenderPageComponents,
	renderPageComponentsToHtml
} from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import {
	mapDocumentDownloadUrl,
	mapUncommittedDocumentDownloadUrl
} from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { getErrorByFieldname } from '#lib/error-handlers/change-screen-error-handlers.js';
import { addBackLinkQueryToUrl, getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import {
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_LPA_COSTS,
	LENGTH_300
} from '@pins/appeals/constants/support.js';
import {
	baseUrl,
	buildLogicData,
	mapDecisionOutcome
} from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('./issue-decision.types.js').InspectorDecisionRequest} InspectorDecisionRequest
 * @typedef {import('./issue-decision.types.js').AppellantCostsDecisionRequest} AppellantCostsDecisionRequest
 * @typedef {import('./issue-decision.types.js').LpaCostsDecisionRequest} LpaCostsDecisionRequest
 * @typedef {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem} FileUploadInfoItem
 * @typedef {import('@pins/express/types/express.js').Request & {specificDecisionType?: string}} Request
 * @typedef {{ key: { text: string; }; value?: { html: string; text?: undefined; } | { text: any; html?: undefined; }; actions: { items: { text: string; href: string; visuallyHiddenText: string; }[]; }; }} PageRow
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
												/** @type {import('@pins/appeals').Address} */ (appealDetails.appealSite)
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
					checked: inspectorDecision?.outcome === 'Invalid',
					conditional: {
						html: renderPageComponentsToHtml([
							{
								type: 'textarea',
								parameters: {
									name: 'invalidReason',
									id: 'invalid-reason',
									value: inspectorDecision?.invalidReason ?? '',
									label: {
										text: 'Reason',
										classes: 'govuk-label--s'
									},
									hint: { text: 'We will share the reason with the relevant parties' },
									errorMessage: errors?.invalidReason
										? {
												text: errors?.invalidReason.msg
										  }
										: null
								}
							}
						])
					}
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
 * @param {AppellantCostsDecisionRequest} appellantCostsDecision
 * @param {string|undefined} backLinkUrl
 * @param {any} errors
 * @returns {PageContent}
 */
export function appellantCostsDecisionPage(
	appealDetails,
	appellantCostsDecision,
	backLinkUrl,
	errors
) {
	/** @type {PageComponent} */
	const selectAppellantCostsDecisionComponent = {
		type: 'radios',
		parameters: {
			name: 'appellantCostsDecision',
			idPrefix: 'appellant-costs-decision',
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
					checked: appellantCostsDecision?.outcome === 'true'
				},
				{
					value: false,
					text: 'No',
					checked: appellantCostsDecision?.outcome === 'false'
				}
			],
			errorMessage: getErrorByFieldname(errors, 'appellantCostsDecision')
		}
	};

	const pageComponents = [selectAppellantCostsDecisionComponent];

	preRenderPageComponents(pageComponents);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the appellant cost decision? - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - issue decision`,
		pageComponents
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealDetails
 * @param {LpaCostsDecisionRequest} lpaCostsDecision
 * @param {string|undefined} backLinkUrl
 * @param {any} errors
 * @returns {PageContent}
 */
export function lpaCostsDecisionPage(appealDetails, lpaCostsDecision, backLinkUrl, errors) {
	/** @type {PageComponent} */
	const selectLpaCostsDecisionComponent = {
		type: 'radios',
		parameters: {
			name: 'lpaCostsDecision',
			idPrefix: 'lpa-costs-decision',
			fieldset: {
				legend: {
					text: "Do you want to issue the LPA's costs decision?",
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					value: true,
					text: 'Yes',
					checked: lpaCostsDecision?.outcome === 'true'
				},
				{
					value: false,
					text: 'No',
					checked: lpaCostsDecision?.outcome === 'false'
				}
			],
			errorMessage: getErrorByFieldname(errors, 'lpaCostsDecision')
		}
	};

	const pageComponents = [selectLpaCostsDecisionComponent];

	preRenderPageComponents(pageComponents);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the  LPA cost decision? - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - issue decision`,
		pageComponents
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData *
 * @param {Request} request
 * @returns {PageRow}[]
 */
function checkAndConfirmPageRows(appealData, request) {
	const { session, specificDecisionType } = request;
	const { inspectorDecision, appellantCostsDecision, lpaCostsDecision } = session;
	const baseRoute = baseUrl(appealData);

	const rows = [];

	if (inspectorDecision) {
		const decisionOutcome = mapDecisionOutcome(inspectorDecision.outcome);

		if (decisionOutcome) {
			let invalidReasonHtml = inspectorDecision.invalidReason ? `Reason: ` : '';
			if (invalidReasonHtml) {
				invalidReasonHtml = renderPageComponentsToHtml([
					{
						type: 'show-more',
						parameters: {
							text: `${invalidReasonHtml}${inspectorDecision.invalidReason}`,
							maximumBeforeHiding: invalidReasonHtml.length + LENGTH_300, // 300 being the maximum length of the invalid reason before hiding
							toggleTextCollapsed: 'Show more',
							toggleTextExpanded: 'Show less'
						}
					}
				]);
			}
			rows.push({
				key: 'Decision',
				html: `${decisionOutcome}${invalidReasonHtml ? `<br><br>${invalidReasonHtml}` : ''}`,
				actions: [
					{
						text: 'Change',
						href: addBackLinkQueryToUrl(request, `${baseRoute}/decision`),
						visuallyHiddenText: 'decision'
					}
				]
			});
		}

		const file = inspectorDecision?.files?.[0];
		if (file) {
			rows.push({
				key: 'Decision letter',
				value: file.name,
				href: mapUncommittedDocumentDownloadUrl(appealData.appealReference, file.GUID, file.name),
				actions: [
					{
						text: 'Change',
						href: addBackLinkQueryToUrl(request, `${baseRoute}/decision-letter-upload`),
						visuallyHiddenText: 'decision letter'
					}
				]
			});
		}
	}

	const appellantCostsDecisionOutcome = appellantCostsDecision?.outcome;
	if (appellantCostsDecisionOutcome && !specificDecisionType) {
		rows.push({
			key: "Do you want to issue the appellant's costs decision?",
			value: appellantCostsDecisionOutcome === 'true' ? 'Yes' : 'No',
			href: '',
			actions: [
				{
					text: 'Change',
					href: addBackLinkQueryToUrl(request, `${baseRoute}/appellant-costs-decision`),
					visuallyHiddenText: 'appellant cost decision'
				}
			]
		});
	}

	if (
		appellantCostsDecisionOutcome === 'true' ||
		specificDecisionType === DECISION_TYPE_APPELLANT_COSTS
	) {
		const file = appellantCostsDecision?.files?.[0];
		if (file) {
			rows.push({
				key: 'Appellant costs decision letter',
				value: file.name,
				href: mapUncommittedDocumentDownloadUrl(appealData.appealReference, file.GUID, file.name),
				actions: [
					{
						text: 'Change',
						href: addBackLinkQueryToUrl(
							request,
							specificDecisionType
								? `${baseRoute}/issue-appellant-costs-decision-letter-upload`
								: `${baseRoute}/appellant-costs-decision-letter-upload`
						),
						visuallyHiddenText: 'appellant cost decision letter'
					}
				]
			});
		}
	}

	const lpaCostsDecisionOutcome = lpaCostsDecision?.outcome;
	if (lpaCostsDecisionOutcome && !specificDecisionType) {
		rows.push({
			key: "Do you want to issue the LPA's costs decision?",
			value: lpaCostsDecisionOutcome === 'true' ? 'Yes' : 'No',
			href: '',
			actions: [
				{
					text: 'Change',
					href: addBackLinkQueryToUrl(request, `${baseRoute}/lpa-costs-decision`),
					visuallyHiddenText: 'lpa cost decision'
				}
			]
		});
	}

	if (lpaCostsDecisionOutcome === 'true' || specificDecisionType === DECISION_TYPE_LPA_COSTS) {
		const file = lpaCostsDecision?.files?.[0];
		{
			rows.push({
				key: 'LPA costs decision letter',
				value: file.name,
				href: mapUncommittedDocumentDownloadUrl(appealData.appealReference, file.GUID, file.name),
				actions: [
					{
						text: 'Change',
						href: addBackLinkQueryToUrl(
							request,
							specificDecisionType
								? `${baseRoute}/issue-lpa-costs-decision-letter-upload`
								: `${baseRoute}/lpa-costs-decision-letter-upload`
						),
						visuallyHiddenText: 'lpa costs decision letter'
					}
				]
			});
		}
	}

	// @ts-ignore
	return rows.map(({ key, value, html, href, actions }) => {
		return {
			key: { text: key },
			value: html
				? { html }
				: href
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
 * @param {Request} request
 * @returns {PageContent}
 */
export function checkAndConfirmPage(appealData, request) {
	const { currentAppeal, specificDecisionType } = request;

	const {
		appellantHasAppliedForCosts,
		lpaHasAppliedForCosts,
		appellantDecisionHasAlreadyBeenIssued,
		lpaDecisionHasAlreadyBeenIssued
	} = buildLogicData(appealData);

	if (!appellantHasAppliedForCosts || appellantDecisionHasAlreadyBeenIssued) {
		request.session.appellantCostsDecision = {};
	}

	if (!lpaHasAppliedForCosts || lpaDecisionHasAlreadyBeenIssued) {
		request.session.lpaCostsDecision = {};
	}

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: checkAndConfirmPageRows(appealData, request)
		}
	};

	const decisionTypeText = specificDecisionType
		? specificDecisionType.replaceAll('-', ' ')
		: 'decision';

	const baseRoute = baseUrl(currentAppeal);

	let backUrl = getBackLinkUrlFromQuery(request);
	if (!backUrl) {
		if (specificDecisionType) {
			backUrl = `${addBackLinkQueryToUrl(
				request,
				`${baseRoute}/issue-${specificDecisionType}-letter-upload`
			)}`;
		} else {
			backUrl = `${baseRoute}/decision`;
		}
	}

	const title = `Check details and issue ${decisionTypeText}`;
	const pageContent = {
		title,
		backLinkUrl: backUrl,
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		submitButtonText: `Issue ${decisionTypeText}`,
		pageComponents: [summaryListComponent]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @returns {PageRow}[]
 */
export function viewDecisionPageRows(appealData) {
	const { appealId, decision, costs } = appealData || {};
	const appellantCostsDecision = costs.appellantDecisionFolder?.documents[0];
	const lpaCostsDecision = costs.lpaDecisionFolder?.documents[0];

	const rows = [];

	if (decision) {
		const { outcome, documentId, documentName, letterDate, invalidReason } = decision;
		const decisionOutcome = mapDecisionOutcome(outcome);
		let invalidReasonHtml = invalidReason ? `Reason: ` : '';
		if (invalidReasonHtml) {
			invalidReasonHtml = renderPageComponentsToHtml([
				{
					type: 'show-more',
					parameters: {
						text: `${invalidReasonHtml}${invalidReason}`,
						maximumBeforeHiding: invalidReasonHtml.length + LENGTH_300, // 300 being the maximum length of the invalid reason before hiding
						toggleTextCollapsed: 'Show more',
						toggleTextExpanded: 'Show less'
					}
				}
			]);
		}
		if (decisionOutcome) {
			rows.push({
				key: 'Decision',
				html: `${decisionOutcome}${invalidReasonHtml ? `<br><br>${invalidReasonHtml}` : ''}`
			});
		}
		if (documentName) {
			rows.push({
				key: 'Decision letter',
				value: decision.documentName,
				href: mapDocumentDownloadUrl(appealId, documentId || '', documentName || '')
			});
		}
		if (letterDate) {
			rows.push({
				key: 'Decision issue date',
				value: dateISOStringToDisplayDate(letterDate)
			});
		}
	}

	if (appellantCostsDecision) {
		const documentId = appellantCostsDecision.id;
		const { fileName, dateReceived, version } = appellantCostsDecision?.latestDocumentVersion || {};
		rows.push({
			key: 'Appellant costs decision letter',
			value: appellantCostsDecision.name,
			href: mapDocumentDownloadUrl(appealId, documentId, fileName, version)
		});
		rows.push({
			key: 'Appellant costs decision issue date',
			value: dateISOStringToDisplayDate(dateReceived)
		});
	}

	if (lpaCostsDecision) {
		const documentId = lpaCostsDecision.id;
		const { fileName, dateReceived, version } = lpaCostsDecision?.latestDocumentVersion || {};
		rows.push({
			key: 'LPA costs decision letter',
			value: lpaCostsDecision.name,
			href: mapDocumentDownloadUrl(appealId, documentId, fileName, version)
		});
		rows.push({
			key: 'LPA costs decision issue date',
			value: dateISOStringToDisplayDate(dateReceived)
		});
	}

	// @ts-ignore
	return rows.map(({ key, value, html, href }) => {
		return {
			key: { text: key },
			value: html
				? { html }
				: href
				? { html: `<a class="govuk-link" download href="${href}" target="_blank">${value}</a>` }
				: { text: value }
		};
	});
}

/**
 * @param {Appeal} appealData
 * @param {Request} request
 * @returns {PageContent}
 */
export function viewDecisionPage(appealData, request) {
	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: viewDecisionPageRows(appealData)
		}
	};

	const title = `Decision`;
	const pageContent = {
		title,
		backLinkUrl:
			getBackLinkUrlFromQuery(request) || `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
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
		backLinkUrl: `${baseUrl(appealData)}/decision`,
		backLinkText: 'Back',
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		pageComponents: [invalidReasonComponent]
	};
}

/**
 * @param {Request} request
 * @param {Appeal} appealData
 * @returns {PageContent}
 */
export function checkAndConfirmInvalidPage(request, appealData) {
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
								href: `${baseUrl(appealData)}/decision`,
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
						html: displayPageFormatter.formatFreeTextForDisplay(request.session.invalidReason)
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `${baseUrl(appealData)}/invalid-reason`,
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
		backLinkUrl: `${baseUrl(appealData)}/invalid-reason`,
		backLinkText: 'Back',
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: title,
		submitButtonText: 'Issue decision',
		pageComponents: [summaryListComponent, warningTextComponent, insetConfirmComponent]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}
