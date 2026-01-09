import config from '#environment/config.js';
import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { mapStatusFilterLabel, mapStatusText } from '#lib/appeal-status.js';
import { appealShortReference, linkedAppealStatus } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';
import { isChildAppeal, isParentAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { getRequiredActionsForAppeal } from '#lib/mappers/utils/required-actions.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import * as authSession from '../../app/auth/auth-session.service.js';

/** @typedef {import('@pins/appeals').AppealSummary} AppealSummary */
/** @typedef {import('@pins/appeals').CostsDecision} CostsDecision */
/** @typedef {import('@pins/appeals').AppealList} AppealList */
/** @typedef {import('@pins/appeals').Pagination} Pagination */
/** @typedef {import('../../app/auth/auth.service').AccountInfo} AccountInfo */
/** @typedef {Partial<AppealSummary & { appealTimetable: Record<string,string>, awaitingLinkedAppeal: boolean, costsDecision?: CostsDecision}>} PersonalListAppeal */

const ALLOWED_CHILD_APPEAL_ACTION_STATUSES = [
	APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
	APPEAL_CASE_STATUS.VALIDATION,
	APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
];

/**
 * @param {AppealSummary} appeal
 * @return {boolean}
 */
function canDisplayAction(appeal) {
	return (
		!isChildAppeal(appeal) || ALLOWED_CHILD_APPEAL_ACTION_STATUSES.includes(appeal.appealStatus)
	);
}

/**
 * @param {AppealList|void} appealsAssignedToCurrentUser
 * @param {string} urlWithoutQuery
 * @param {string|undefined} appealStatusFilter
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/appeals').CaseOfficer} caseOfficer
 * @param {boolean} isSearchedCO
 * @returns {PageContent}
 */
export function personalListPage(
	appealsAssignedToCurrentUser,
	urlWithoutQuery,
	appealStatusFilter,
	session,
	request,
	caseOfficer,
	isSearchedCO
) {
	const account = /** @type {AccountInfo} */ (authSession.getAccount(session));
	const userGroups = account?.idTokenClaims?.groups ?? [];
	const isCaseOfficer = userGroups.includes(config.referenceData.appeals.caseOfficerGroupId);
	const urlToSearchCaseOfficer = addBackLinkQueryToUrl(
		request,
		'personal-list/search-case-officer'
	);
	const filterItemsArray = ['all', ...(appealsAssignedToCurrentUser?.statuses || [])]
		.map((appealStatus) => ({
			text: mapStatusFilterLabel(appealStatus),
			value: appealStatus,
			selected: appealStatusFilter === appealStatus
		}))
		.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));

	/** @type {PageComponent} */
	const searchAllCasesButton = {
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		type: 'button',
		parameters: {
			id: 'search-all-cases',
			href: '/appeals-service/all-cases',
			classes: 'govuk-button--secondary',
			text: 'Search all cases'
		}
	};
	const existingQueryParams = Object.entries(request.query)
		.filter(([key]) => key !== 'appealStatusFilter')
		.map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
		.join('');

	const clearFilterURL = isSearchedCO
		? urlWithoutQuery + '?caseOfficerId=' + caseOfficer.id
		: urlWithoutQuery;

	/** @type {PageComponent} */
	const filterComponent = {
		type: 'details',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			summaryText: 'Filters',
			html: '',
			pageComponents: [
				{
					type: 'html',
					parameters: {
						html: `<form method="GET">${existingQueryParams}`
					}
				},
				{
					type: 'select',
					parameters: {
						label: {
							text: 'Show cases with status'
						},
						id: 'filters-select',
						name: 'appealStatusFilter',
						value: 'all',
						items: filterItemsArray
					}
				},
				{
					type: 'html',
					parameters: {
						html: '<div class="govuk-button-group">'
					}
				},
				{
					type: 'button',
					parameters: {
						id: 'filters-submit',
						type: 'submit',
						classes: 'govuk-button--secondary',
						text: 'Apply'
					}
				},
				{
					type: 'html',
					parameters: {
						html: `<a class="govuk-link" href="${clearFilterURL}">Clear filter</a></div></form>`
					}
				}
			]
		}
	};

	/** @type {PageComponent} */
	const casesComponent = {
		type: 'table',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			head: [
				{
					text: 'Appeal reference'
				},
				{
					text: 'Lead or child'
				},
				{
					text: 'Action required'
				},
				{
					text: 'Due by'
				},
				{
					text: 'Case status'
				}
			],
			rows: (appealsAssignedToCurrentUser?.items || []).map((appeal) => {
				const shortReference = appealShortReference(appeal.appealReference);
				const linkedAppealStatusText = linkedAppealStatus(
					isParentAppeal(appeal),
					isChildAppeal(appeal)
				);
				const actionLinks = canDisplayAction(appeal)
					? mapActionLinksForAppeal(appeal, isCaseOfficer, request)
					: '';

				const urlToAppealsDetail = addBackLinkQueryToUrl(
					request,
					`/appeals-service/appeal-details/${appeal?.appealId}`
				);
				return [
					{
						html: `<strong><a class="govuk-link" href=${urlToAppealsDetail} aria-label="${numberToAccessibleDigitLabel(
							shortReference || ''
						)}">${shortReference}</a></strong>`
					},
					{
						html: '',
						pageComponents:
							config.featureFlags.featureFlagLinkedAppeals && linkedAppealStatusText !== ''
								? [
										{
											type: 'status-tag',
											parameters: {
												status: linkedAppealStatusText
											}
										}
								  ]
								: []
					},
					{
						classes: 'action-required',
						html: actionLinks || ''
					},
					{
						text: isChildAppeal(appeal) ? '' : dateISOStringToDisplayDate(appeal.dueDate) || ''
					},
					{
						html: '',
						pageComponents: [
							{
								type: 'status-tag',
								parameters: {
									status: appeal.appealStatus
										? mapStatusText(appeal.appealStatus, appeal.appealType, appeal.procedureType)
										: 'ERROR'
								}
							}
						]
					}
				];
			})
		}
	};

	/** @type {PageComponent} */
	const searchOtherCOLink = {
		type: 'html',
		parameters: {
			html: `${`<p class="govuk-body"> <a class="govuk-link" href=${urlToSearchCaseOfficer} data-cy="change-case-officer">View another case officer’s appeals</a></p> `}
                <div class=" govuk-!-margin-top-2 govuk-!-margin-bottom-6"></div>`
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: 'Personal list',
		heading:
			caseOfficer && caseOfficer?.id != account.localAccountId
				? `Appeals assigned to ${caseOfficer.name}`
				: 'Your appeals',
		pageComponents: []
	};

	config.featureFlags.featureFlagSearchCaseOfficer
		? pageContent.pageComponents?.push(searchOtherCOLink)
		: null;

	if (
		appealsAssignedToCurrentUser &&
		appealsAssignedToCurrentUser.items &&
		appealsAssignedToCurrentUser.items.length > 0
	) {
		pageContent.pageComponents?.push(filterComponent, casesComponent);
	} else {
		pageContent.heading =
			isSearchedCO && caseOfficer?.id != account.localAccountId
				? `${caseOfficer.name} is not assigned to any appeals`
				: 'You are not assigned to any appeals';
		pageContent.pageComponents?.push(searchAllCasesButton);
	}

	if (
		!session.account.idTokenClaims.groups.includes(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		)
	) {
		pageContent.pageComponents?.forEach((component) => {
			if (
				'rows' in component.parameters &&
				Array.isArray(component.parameters.rows) &&
				component.type === 'summary-list'
			) {
				component.parameters.rows = component.parameters.rows.map((row) =>
					removeSummaryListActions(row)
				);
			}
		});
	}

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 * @param {import('#lib/mappers/index.js').AppealRequiredAction} action
 * @param {boolean} isCaseOfficer
 * @param {boolean} isChildAppeal
 * @param {number} appealId
 * @param {number|null|undefined} lpaQuestionnaireId
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} procedureType
 * @returns {string|undefined}
 */
function mapRequiredActionToPersonalListActionHtml(
	action,
	isCaseOfficer,
	isChildAppeal,
	appealId,
	lpaQuestionnaireId,
	request,
	procedureType
) {
	switch (action) {
		case 'addHorizonReference': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/change-appeal-type/add-horizon-reference`
			)}">Mark as transferred<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'arrangeSiteVisit': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/site-visit/schedule-visit`
			)}">Set up site visit<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'awaitingAppellantUpdate': {
			return isCaseOfficer
				? `<a class="govuk-link" href="${addBackLinkQueryToUrl(
						request,
						`/appeals-service/appeal-details/${appealId}/appellant-case`
				  )}">Awaiting appellant update<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				: 'Awaiting appellant update';
		}
		case 'assignCaseOfficer': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/assign-case-officer/search-case-officer`
			)}">Assign case officer<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'awaitingFinalComments': {
			return 'Awaiting final comments';
		}
		case 'awaitingLinkedAppeal': {
			return 'Awaiting linked appeal';
		}
		case 'awaitingIpComments': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/interested-party-comments`
			)}">Awaiting IP comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'awaitingLpaQuestionnaire': {
			return 'Awaiting LPA questionnaire';
		}
		case 'awaitingLpaStatement': {
			return `<span>Awaiting LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></span>`;
		}
		case 'awaitingLpaUpdate': {
			if (!lpaQuestionnaireId) {
				return '';
			}
			return isCaseOfficer
				? `<a class="govuk-link" href="${addBackLinkQueryToUrl(
						request,
						`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
				  )}">Update questionnaire<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				: 'Update questionnaire';
		}
		case 'issueDecision': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/issue-decision/decision`
			)}">Issue decision<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'issueAppellantCostsDecision': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/issue-decision/issue-appellant-costs-decision-letter-upload`
			)}">Issue appellant costs decision<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'issueLpaCostsDecision': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/issue-decision/issue-lpa-costs-decision-letter-upload`
			)}">Issue LPA costs decision<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'lpaQuestionnaireOverdue': {
			return 'LPA questionnaire overdue';
		}
		case 'progressFromFinalComments': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/share`
			)}">Progress case</a>`;
		}
		case 'progressHearingCaseWithNoRepsFromStatements': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/share`
			)}">Progress to hearing ready to set up<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'progressHearingCaseWithNoRepsAndHearingSetUpFromStatements': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/share`
			)}">Progress to awaiting hearing<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'addInquiryAddress': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/inquiry/change/address-details`
			)}">Add inquiry address<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'progressFromStatements': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/share`
			)}">Progress to final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'reviewAppellantCase': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/appellant-case`
			)}">Review appellant case<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'reviewAppellantFinalComments': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/final-comments/appellant`
			)}">Review appellant final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'reviewIpComments': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/interested-party-comments`
			)}">Review IP comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'reviewLpaFinalComments': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/final-comments/lpa`
			)}">Review LPA final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'reviewLpaQuestionnaire': {
			if (!lpaQuestionnaireId) {
				return '';
			}
			return isCaseOfficer
				? `<a class="govuk-link" href="${addBackLinkQueryToUrl(
						request,
						`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
				  )}">Review LPA questionnaire<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				: 'Review LPA questionnaire';
		}
		case 'reviewLpaStatement': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/lpa-statement`
			)}">Review LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'shareFinalComments': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/share`
			)}">Share final comments</a>`;
		}
		case 'shareIpCommentsAndLpaStatement': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/share`
			)}">Share IP comments and LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'startAppeal': {
			if (isChildAppeal) {
				return;
			}
			return isCaseOfficer
				? `<a class="govuk-link" href="${addBackLinkQueryToUrl(
						request,
						`/appeals-service/appeal-details/${appealId}/start-case/add`
				  )}">Start case<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				: 'Start case';
		}
		case 'updateLpaStatement': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/lpa-statement`
			)}">Update LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'setupHearing': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/hearing/setup/date`
			)}">Set up hearing</a>`;
		}
		case 'addHearingAddress': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/hearing/change/address-details`
			)}">Add hearing address</a>`;
		}
		case 'addResidencesNetChange': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/residential-units/new`
			)}">Add number of residential units<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'progressToInquiry': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/share`
			)}">Progress to inquiry<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		}
		case 'progressToProofOfEvidenceAndWitnesses': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/share`
			)}">Progress to proof of evidence and witnesses</a>`;
		}
		case 'awaitingProofOfEvidenceAndWitnesses': {
			return 'Awaiting proof of evidence and witnesses';
		}
		case 'awaitingLpaProofOfEvidenceAndWitnesses': {
			return 'Awaiting LPA proof of evidence and witnesses';
		}
		case 'awaitingAppellantProofOfEvidenceAndWitnesses': {
			return 'Awaiting appellant proof of evidence and witnesses';
		}
		case 'reviewLpaProofOfEvidence': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/proof-of-evidence/lpa`
			)}">Review LPA proof of evidence and witnesses</a>`;
		}
		case 'reviewAppellantProofOfEvidence': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/proof-of-evidence/appellant`
			)}">Review appellant proof of evidence and witnesses</a>`;
		}
		case 'awaitingAppellantStatement': {
			return 'Awaiting appellant statement';
		}
		case 'reviewAppellantStatement': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/appellant-statement`
			)}">Review appellant statement</a>`;
		}
		case 'awaitingEvent': {
			return `Awaiting ${
				[APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY].includes(
					procedureType.toLowerCase()
				)
					? procedureType.toLowerCase()
					: 'site visit'
			}`;
		}
		default: {
			return '';
		}
	}
}

/**
 * @param {PersonalListAppeal} appeal
 * @param {boolean} isCaseOfficer
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {string}
 */
export function mapActionLinksForAppeal(appeal, isCaseOfficer, request) {
	const requiredActions = getRequiredActionsForAppeal(
		{
			...appeal,
			appealTimetable: appeal.appealTimetable || {}
		},
		'summary'
	);

	const { appealId, lpaQuestionnaireId, procedureType } = appeal;

	if (appealId === undefined) {
		return '';
	}

	return requiredActions
		.map((action) => {
			return mapRequiredActionToPersonalListActionHtml(
				action,
				isCaseOfficer,
				isChildAppeal(appeal),
				appealId,
				lpaQuestionnaireId,
				request,
				procedureType ?? ''
			);
		})
		.filter((action) => action?.trim())
		.join('<br>');
}
