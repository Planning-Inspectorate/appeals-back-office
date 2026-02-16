import {
	baseUrl,
	buildIssueDecisionLogicData,
	checkAndConfirmBackUrl
} from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';
import {
	mapDocumentDownloadUrl,
	mapUncommittedDocumentDownloadUrl
} from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { isFeatureActive } from '#common/feature-flags.js';
import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { getErrorByFieldname } from '#lib/error-handlers/change-screen-error-handlers.js';
import { mapNotificationBannersFromSession } from '#lib/mappers/index.js';
import { preHeadingText } from '#lib/mappers/utils/appeal-preheading.js';
import isLinkedAppeal, { isParentAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import {
	preRenderPageComponents,
	renderPageComponentsToHtml
} from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { toSentenceCase } from '#lib/string-utilities.js';
import { addBackLinkQueryToUrl, getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_LPA_COSTS,
	LENGTH_300
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_DECISION_OUTCOME } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('./issue-decision.types.js').InspectorDecisionRequest} InspectorDecisionRequest
 * @typedef {import('./issue-decision.types.js').DecisionLetterRequest} DecisionLetterRequest
 * @typedef {import('./issue-decision.types.js').AppellantCostsDecisionRequest} AppellantCostsDecisionRequest
 * @typedef {import('./issue-decision.types.js').LpaCostsDecisionRequest} LpaCostsDecisionRequest
 * @typedef {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem} FileUploadInfoItem
 * @typedef {import('@pins/express/types/express.js').Request & {specificDecisionType?: string}} Request
 * @typedef {import('@pins/appeals.api').Appeals.RelatedAppeal} RelatedAppeal
 * @typedef {{ key: { text: string; }; value?: { html: string; text?: undefined; } | { text: any; html?: undefined; }; actions: { items: { text: string; href: string; visuallyHiddenText: string; }[]; }; }} PageRow
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {RelatedAppeal|undefined} childAppealDetails
 * @param {InspectorDecisionRequest} inspectorDecision
 * @param {string|undefined} backUrl
 * @param {import("@pins/express").ValidationErrors} [errors]
 * @returns {PageContent}
 */
export function issueDecisionPage(
	appealDetails,
	childAppealDetails,
	inspectorDecision,
	backUrl,
	errors
) {
	const { appellant } = appealDetails;

	const appellantName =
		!appellant?.firstName && !appellant?.lastName && appellant?.organisationName
			? appellant.organisationName
			: `${appellant?.firstName} ${appellant?.lastName}`;

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
									text: appellantName
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
						text: childAppealDetails ? childAppealDetails.appealType : appealDetails.appealType
					}
				}
			]
		}
	};

	const fieldName = 'decision';

	const shortAppealReference = appealShortReference(appealDetails.appealReference);
	const decisionAppealReference = childAppealDetails
		? childAppealDetails.appealReference
		: shortAppealReference;
	const linkType = childAppealDetails ? 'child' : isParentAppeal(appealDetails) ? 'lead' : '';

	const heading = linkType ? `Decision for ${linkType} appeal ${decisionAppealReference}` : '';

	const {
		ALLOWED,
		DISMISSED,
		NOTICE_UPHELD,
		NOTICE_VARIED_AND_UPHELD,
		PLANNING_PERMISSION_GRANTED,
		QUASHED_ON_LEGAL_GROUNDS,
		SPLIT_DECISION,
		INVALID
	} = APPEAL_CASE_DECISION_OUTCOME;

	const decisionTypes =
		appealDetails.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE
			? [
					NOTICE_UPHELD,
					NOTICE_VARIED_AND_UPHELD,
					PLANNING_PERMISSION_GRANTED,
					QUASHED_ON_LEGAL_GROUNDS,
					SPLIT_DECISION,
					INVALID
				]
			: [ALLOWED, DISMISSED, SPLIT_DECISION, INVALID];

	const items = decisionTypes.map((decisionType) => ({
		value: decisionType,
		text: toSentenceCase(decisionType),
		checked: inspectorDecision?.outcome === decisionType
	}));

	if (
		!isLinkedAppeal(appealDetails) &&
		!isFeatureActive(FEATURE_FLAG_NAMES.INVALID_DECISION_LETTER)
	) {
		const invalidDecisionItem = items.find((item) => item.value === INVALID);
		if (invalidDecisionItem) {
			// @ts-ignore
			invalidDecisionItem.conditional = {
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
			};
		}
	}

	/** @type {PageComponent} */
	const selectVisitTypeComponent = {
		type: 'radios',
		parameters: {
			name: fieldName,
			idPrefix: fieldName,
			fieldset: {
				legend: {
					text: heading || 'Decision',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--m'
				}
			},
			items,
			errorMessage: getErrorByFieldname(errors, fieldName)
		}
	};

	const pageComponents = [summaryBlock, selectVisitTypeComponent];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: heading || `Decision - ${shortAppealReference}`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: preHeadingText(appealDetails, 'issue decision'),
		heading: heading || 'Decision',
		pageComponents
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealDetails
 * @param {DecisionLetterRequest} decisionLetter
 * @param {string|undefined} backLinkUrl
 * @param {any} errors
 * @returns {PageContent}
 */
export function decisionLetterPage(appealDetails, decisionLetter, backLinkUrl, errors) {
	/** @type {PageComponent} */
	const selectDecisionLetterComponent = {
		type: 'radios',
		parameters: {
			name: 'decisionLetter',
			idPrefix: 'decision-letter',
			fieldset: {
				legend: {
					text: 'Do you want to issue a decision letter?',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					value: true,
					text: 'Yes',
					checked: decisionLetter?.outcome === 'true'
				},
				{
					value: false,
					text: 'No',
					checked: decisionLetter?.outcome === 'false'
				}
			],
			errorMessage: getErrorByFieldname(errors, 'decisionLetter')
		}
	};

	const pageComponents = [selectDecisionLetterComponent];

	preRenderPageComponents(pageComponents);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Do you want to issue a decision letter? - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: preHeadingText(appealDetails, 'issue decision'),
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
		preHeading: preHeadingText(appealDetails, 'issue decision'),
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
		preHeading: preHeadingText(appealDetails, 'issue decision'),
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
	const {
		inspectorDecision,
		decisionLetter,
		appellantCostsDecision,
		lpaCostsDecision,
		childDecisions
	} = session;
	const childDecisionsExist = childDecisions.decisions?.length > 0;
	const baseRoute = baseUrl(appealData);

	const rows = [];

	if (inspectorDecision) {
		if (inspectorDecision.outcome) {
			let outcomeHtml = toSentenceCase(inspectorDecision.outcome);
			if (!isFeatureActive(FEATURE_FLAG_NAMES.INVALID_DECISION_LETTER)) {
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
				outcomeHtml = invalidReasonHtml
					? `${outcomeHtml}<br><br>${invalidReasonHtml}`
					: outcomeHtml;
			}
			rows.push({
				key: childDecisionsExist
					? `Decision for lead appeal ${appealShortReference(appealData.appealReference)}`
					: 'Decision',
				html: outcomeHtml,
				actions: [
					{
						text: 'Change',
						href: addBackLinkQueryToUrl(request, `${baseRoute}/decision`),
						visuallyHiddenText: childDecisionsExist
							? `decision for lead appeal ${appealShortReference(appealData.appealReference)}`
							: 'decision'
					}
				]
			});
			if (childDecisionsExist) {
				// @ts-ignore
				childDecisions.decisions.forEach((childDecision) => {
					rows.push({
						key: `Decision for child appeal ${childDecision.appealReference}`,
						html: toSentenceCase(childDecision.outcome),
						actions: [
							{
								text: 'Change',
								href: addBackLinkQueryToUrl(
									request,
									`${baseRoute}/${childDecision.appealId}/decision`
								),
								visuallyHiddenText: `decision for child appeal ${childDecision.appealReference}`
							}
						]
					});
				});
			}
		}

		const decisionLetterOutcome = decisionLetter?.outcome;
		if (decisionLetterOutcome && !specificDecisionType) {
			rows.push({
				key: 'Do you want to issue a decision letter?',
				value: decisionLetterOutcome === 'true' ? 'Yes' : 'No',
				href: '',
				actions: [
					{
						text: 'Change',
						href: addBackLinkQueryToUrl(request, `${baseRoute}/decision-letter`),
						visuallyHiddenText: 'decision letter'
					}
				]
			});
		}

		if (
			inspectorDecision.invalidReason &&
			isFeatureActive(FEATURE_FLAG_NAMES.INVALID_DECISION_LETTER)
		) {
			const invalidReasonHtml = renderPageComponentsToHtml([
				{
					type: 'show-more',
					parameters: {
						text: inspectorDecision.invalidReason,
						maximumBeforeHiding: LENGTH_300, // 300 being the maximum length of the invalid reason before hiding
						toggleTextCollapsed: 'Show more',
						toggleTextExpanded: 'Show less'
					}
				}
			]);
			rows.push({
				key: 'Why is the appeal invalid?',
				html: invalidReasonHtml,
				actions: [
					{
						text: 'Change',
						href: addBackLinkQueryToUrl(request, `${baseRoute}/invalid-reason`),
						visuallyHiddenText: 'invalid reason'
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
	} = buildIssueDecisionLogicData(appealData);

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
		? specificDecisionType.replaceAll('-', ' ').replace('lpa', 'LPA')
		: 'decision';

	const title = `Check details and issue ${decisionTypeText}`;
	const pageContent = {
		title,
		backLinkUrl: checkAndConfirmBackUrl(currentAppeal, request, specificDecisionType),
		preHeading: preHeadingText(appealData),
		heading: title,
		submitButtonText: `Issue ${decisionTypeText}`,
		pageComponents: [summaryListComponent]
	};

	return pageContent;
}

/**
 * @param {Appeal & {leadDecisionLetter : { caseId: string, documents : *[] }}} appealData
 * @param {Request} request
 * @param {string|undefined} latestDecsionDocumentText
 * @returns {PageRow}[]
 */
export function viewDecisionPageRows(appealData, request, latestDecsionDocumentText) {
	const { appealId, decision, costs } = appealData || {};
	const appellantCostsDecision = costs.appellantDecisionFolder?.documents[0];
	const lpaCostsDecision = costs.lpaDecisionFolder?.documents[0];

	const rows = [];

	if (decision) {
		const { outcome, documentId, documentName, letterDate, invalidReason } = decision;
		// @ts-ignore
		const decisionOutcome = toSentenceCase(outcome);
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
				// @ts-ignore
				key: appealData.linkedAppeals?.length
					? `Decision for ${
							appealData.isParentAppeal ? 'lead' : 'child'
						} appeal ${appealShortReference(appealData.appealReference)}`
					: 'Decision',
				html: `${toSentenceCase(decisionOutcome)}${
					invalidReasonHtml ? `<br><br>${invalidReasonHtml}` : ''
				}`
			});
		}
		if (appealData.isParentAppeal && appealData.linkedAppeals?.length) {
			appealData.linkedAppeals.forEach((linkedAppeal) => {
				if (linkedAppeal.inspectorDecision) {
					rows.push({
						key: `Decision for ${linkedAppeal.isParentAppeal ? 'lead' : 'child'} appeal ${
							linkedAppeal.appealReference
						}`,
						html: toSentenceCase(linkedAppeal.inspectorDecision)
					});
				}
			});
		}
		if (letterDate) {
			rows.push({
				key: 'Decision issue date',
				value: latestDecsionDocumentText || dateISOStringToDisplayDate(letterDate)
			});
		}
		// @ts-ignore
		if (appealData.leadDecisionLetter) {
			const { caseId, documents } = appealData.leadDecisionLetter;
			const documentId = documents[0]?.id;
			const documentName = documents[0]?.name;
			rows.push({
				key: 'Decision letter',
				value: documentName,
				href: mapDocumentDownloadUrl(caseId, documentId || '', documentName || '')
			});
		} else if (documentName) {
			rows.push({
				key: 'Decision letter',
				value: decision.documentName,
				href: mapDocumentDownloadUrl(appealId, documentId || '', documentName || ''),
				actions: [
					{
						text: 'Change',
						href: `${addBackLinkQueryToUrl(
							request,
							`/appeals-service/appeal-details/${appealId}/update-decision-letter/upload-decision-letter`
						)}`,
						visuallyHiddenText: 'decision letter'
					}
				]
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
 * @param {Appeal & {leadDecisionLetter : { caseId: string, documents : *[] }}} appealData
 * @param {Request} request
 * @param {string|undefined} latestDecsionDocumentText
 * @returns {PageContent}
 */
export function viewDecisionPage(appealData, request, latestDecsionDocumentText) {
	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: viewDecisionPageRows(appealData, request, latestDecsionDocumentText)
		}
	};

	const notificationBanners = mapNotificationBannersFromSession(
		request.session,
		'appealDecision',
		appealData.appealId
	);

	const title = `Decision`;
	const pageContent = {
		title,
		backLinkUrl:
			getBackLinkUrlFromQuery(request) || `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: preHeadingText(appealData),
		heading: title,
		pageComponents: [...notificationBanners, summaryListComponent]
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealDetails
 * @param {String} invalidReason
 * @param {string|undefined} backLinkUrl
 * @param {any} errors
 * @returns {PageContent}
 */
export function invalidReasonPage(appealDetails, invalidReason, backLinkUrl, errors) {
	const title = 'Why is the appeal invalid?';

	/** @type {PageComponent} */
	const invalidReasonComponent = {
		type: 'textarea',
		parameters: {
			name: 'invalidReason',
			id: 'invalid-reason',
			value: invalidReason ?? '',
			hint: { text: 'We will share the reason with the relevant parties' },
			errorMessage: errors?.invalidReason
				? {
						text: errors?.invalidReason.msg
					}
				: null
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Do you want to issue a decision letter? - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: preHeadingText(appealDetails, 'issue decision'),
		heading: title,
		pageComponents: [invalidReasonComponent]
	};

	return pageContent;
}
