import config from '#environment/config.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';
import { appealShortReference, linkedAppealStatus } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import {
	dateISOStringToDisplayDate,
	dateIsInThePast,
	dateISOStringToDayMonthYearHourMinute
} from '#lib/dates.js';
import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import * as authSession from '../../app/auth/auth-session.service.js';
import { appealStatusToStatusTag } from '#lib/nunjucks-filters/status-tag.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { isRepresentationReviewRequired } from '#lib/representation-utilities.js';

/** @typedef {import('@pins/appeals').AppealList} AppealList */
/** @typedef {import('@pins/appeals').Pagination} Pagination */
/** @typedef {import('../../app/auth/auth.service').AccountInfo} AccountInfo */

/**
 * @param {AppealList|void} appealsAssignedToCurrentUser
 * @param {string} urlWithoutQuery
 * @param {string|undefined} appealStatusFilter
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {PageContent}
 */

export function personalListPage(
	appealsAssignedToCurrentUser,
	urlWithoutQuery,
	appealStatusFilter,
	session
) {
	const account = /** @type {AccountInfo} */ (authSession.getAccount(session));
	const userGroups = account?.idTokenClaims?.groups ?? [];
	const isCaseOfficer = userGroups.includes(config.referenceData.appeals.caseOfficerGroupId);

	const filterItemsArray = ['all', ...(appealsAssignedToCurrentUser?.statuses || [])].map(
		(appealStatus) => ({
			text: capitalizeFirstLetter(appealStatusToStatusTag(appealStatus)),
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
						html: mapAppealStatusToActionRequiredHtml(
							appeal.appealId,
							appeal.appealStatus,
							Boolean(appeal.commentCounts?.awaiting_review),
							appeal.lpaQuestionnaireId,
							{
								appellantCase: appeal.documentationSummary?.appellantCase.status,
								lpaQuestionnaire: appeal.documentationSummary?.lpaQuestionnaire.status,
								lpaStatement: appeal.documentationSummary?.lpaStatement.status,
								lpaFinalComments: appeal.documentationSummary?.lpaFinalComments.status,
								lpaFinalCommentsRepresentationStatus:
									appeal.documentationSummary?.lpaFinalComments.representationStatus,
								appellantFinalComments: appeal.documentationSummary?.appellantFinalComments.status,
								appellantFinalCommentsRepresentationStatus:
									appeal.documentationSummary?.appellantFinalComments.representationStatus
							},
							appeal.dueDate,
							isCaseOfficer
						)
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
									status: appeal.appealStatus || 'ERROR'
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
 * @param {number} appealId
 * @param {string} appealStatus
 * @param {boolean} hasAwaitingComments
 * @param {number|null|undefined} lpaQuestionnaireId
 * @param {Object} statuses
 * @param {string} statuses.appellantCase
 * @param {string} statuses.lpaQuestionnaire
 * @param {string} statuses.lpaStatement
 * @param {string} statuses.lpaFinalComments
 * @param {string} statuses.lpaFinalCommentsRepresentationStatus
 * @param {string} statuses.appellantFinalComments
 * @param {string} statuses.appellantFinalCommentsRepresentationStatus
 * @param {string} appealDueDate
 * @param {boolean} [isCaseOfficer]
 * @returns {string}
 */
export function mapAppealStatusToActionRequiredHtml(
	appealId,
	appealStatus,
	hasAwaitingComments,
	lpaQuestionnaireId,
	{
		appellantCase: appellantCaseStatus,
		lpaQuestionnaire: lpaQuestionnaireStatus,
		lpaStatement: lpaStatementStatus,
		lpaFinalComments: lpaFinalCommentsStatus,
		lpaFinalCommentsRepresentationStatus,
		appellantFinalComments: appellantFinalCommentsStatus,
		appellantFinalCommentsRepresentationStatus
	},
	appealDueDate,
	isCaseOfficer = false
) {
	const dueDatePassed = dateIsInThePast(dateISOStringToDayMonthYearHourMinute(appealDueDate));

	switch (appealStatus) {
		case APPEAL_CASE_STATUS.READY_TO_START:
			return isCaseOfficer
				? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/start-case/add">Start case<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				: 'Start case';
		case APPEAL_CASE_STATUS.VALIDATION:
			if (appellantCaseStatus == 'Incomplete') {
				return isCaseOfficer
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Awaiting appellant update<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					: 'Awaiting appellant update';
			}

			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Review appellant case<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE:
			if (dueDatePassed) {
				return 'LPA questionnaire overdue';
			}

			if (lpaQuestionnaireStatus == 'Incomplete') {
				return isCaseOfficer
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}">Awaiting LPA update<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					: 'Awaiting LPA update';
			}

			if (lpaQuestionnaireId) {
				return isCaseOfficer
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}">Review LPA questionnaire<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					: 'Review LPA questionnaire';
			}
			return 'Awaiting LPA questionnaire';
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION:
			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/issue-decision/decision">Issue decision<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		case APPEAL_CASE_STATUS.AWAITING_TRANSFER:
			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/change-appeal-type/add-horizon-reference">Update Horizon reference<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		case APPEAL_CASE_STATUS.STATEMENTS: {
			if (dueDatePassed && !hasAwaitingComments) {
				return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/share">Share IP comments and LPA statement</a>`;
			}

			const lpaStatementAction = (() => {
				switch (lpaStatementStatus) {
					case 'not_received':
						return `<span>Awaiting LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></span>`;
					case 'received':
						return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-statement">Review LPA Statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
					default:
						return null;
				}
			})();

			const ipCommentsAction =
				!dueDatePassed && hasAwaitingComments
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/interested-party-comments">${
							hasAwaitingComments ? 'Review IP comments' : 'Awaiting IP comments'
					  }<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					: null;

			return [lpaStatementAction, ipCommentsAction].filter(Boolean).join('<br>');
		}
		case APPEAL_CASE_STATUS.FINAL_COMMENTS: {
			const lpaReceived = lpaFinalCommentsStatus === 'received';
			const appellantReceived = appellantFinalCommentsStatus === 'received';

			if (!lpaReceived && !appellantReceived) {
				return 'Awaiting final comments';
			}

			const lpaAction =
				lpaReceived && isRepresentationReviewRequired(lpaFinalCommentsRepresentationStatus)
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/lpa">Review LPA final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					: null;
			const appellantAction =
				appellantReceived &&
				isRepresentationReviewRequired(appellantFinalCommentsRepresentationStatus)
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/appellant">Review appellant final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					: null;

			return [lpaAction, appellantAction].filter(Boolean).join('<br>');
		}
		default:
			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">View case<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
	}
}
