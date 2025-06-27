import config from '#environment/config.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';
import { appealShortReference, linkedAppealStatus } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import * as authSession from '../../app/auth/auth-session.service.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { mapStatusText, mapStatusFilterLabel } from '#lib/appeal-status.js';
import { getRequiredActionsForAppeal } from '#lib/mappers/utils/required-actions.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @typedef {import('@pins/appeals').AppealSummary} AppealSummary */
/** @typedef {import('@pins/appeals').AppealList} AppealList */
/** @typedef {import('@pins/appeals').Pagination} Pagination */
/** @typedef {import('../../app/auth/auth.service').AccountInfo} AccountInfo */
/** @typedef {Partial<AppealSummary & { appealTimetable: Record<string,string> }>} PersonalListAppeal */

/**
 * @param {AppealList|void} appealsAssignedToCurrentUser
 * @param {string} urlWithoutQuery
 * @param {string|undefined} appealStatusFilter
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {PageContent}
 */

export function personalListPage(
	appealsAssignedToCurrentUser,
	urlWithoutQuery,
	appealStatusFilter,
	session,
	request
) {
	const account = /** @type {AccountInfo} */ (authSession.getAccount(session));
	const userGroups = account?.idTokenClaims?.groups ?? [];
	const isCaseOfficer = userGroups.includes(config.referenceData.appeals.caseOfficerGroupId);
	const filterItemsArray = ['all', ...(appealsAssignedToCurrentUser?.statuses || [])].map(
		(appealStatus) => ({
			text: capitalizeFirstLetter(mapStatusFilterLabel(appealStatus)),
			value: appealStatus,
			selected: appealStatusFilter === appealStatus
		})
	);

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
						html: `<form method="GET">`
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
						html: `<a class="govuk-link" href="${urlWithoutQuery}">Clear filter</a></div></form>`
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
					appeal.isParentAppeal,
					appeal.isChildAppeal
				);

				return [
					{
						html: `<strong><a class="govuk-link" href="/appeals-service/appeal-details/${
							appeal.appealId
						}" aria-label="Appeal ${numberToAccessibleDigitLabel(
							shortReference || ''
						)}">${shortReference}</a></strong>`
					},
					{
						html: '',
						pageComponents:
							linkedAppealStatusText === ''
								? []
								: [
										{
											type: 'status-tag',
											parameters: {
												status: linkedAppealStatusText
											}
										}
								  ]
					},
					{
						classes: 'action-required',
						html: mapActionLinksForAppeal(appeal, isCaseOfficer, request)
					},
					{
						text: dateISOStringToDisplayDate(appeal.dueDate) || ''
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

	/** @type {PageContent} */
	const pageContent = {
		title: 'Personal list',
		heading: 'Cases assigned to you',
		pageComponents: []
	};

	if (
		appealsAssignedToCurrentUser &&
		appealsAssignedToCurrentUser.items &&
		appealsAssignedToCurrentUser.items.length > 0
	) {
		pageContent.pageComponents?.push(filterComponent, casesComponent);
	} else {
		pageContent.heading = 'There are currently no cases assigned to you.';
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
 * @returns {string|undefined}
 */
function mapRequiredActionToPersonalListActionHtml(
	action,
	isCaseOfficer,
	isChildAppeal,
	appealId,
	lpaQuestionnaireId,
	request
) {
	switch (action) {
		case 'addHorizonReference': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/change-appeal-type/add-horizon-reference`
			)}">Update Horizon reference<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
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
		case 'awaitingFinalComments': {
			return 'Awaiting final comments';
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
			return 'Awaiting LPA update';
		}
		case 'issueDecision': {
			return `<a class="govuk-link" href="${addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/issue-decision/decision`
			)}">Issue decision<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
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
	const requiredActions = getRequiredActionsForAppeal({
		...appeal,
		appealTimetable: appeal.appealTimetable || {}
	});

	const { appealId, lpaQuestionnaireId, isChildAppeal = false } = appeal;

	if (appealId === undefined) {
		return '';
	}

	return requiredActions
		.map((action) => {
			return mapRequiredActionToPersonalListActionHtml(
				action,
				isCaseOfficer,
				isChildAppeal,
				appealId,
				lpaQuestionnaireId,
				request
			);
		})
		.filter((action) => action !== undefined)
		.join('<br>');
}
