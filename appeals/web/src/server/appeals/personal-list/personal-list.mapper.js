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
			opening: '',
			closing: ''
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
						html: mapAppealStatusToActionRequiredHtml(
							appeal.appealId,
							appeal.appealStatus,
							Boolean(appeal.commentCounts?.awaiting_review),
							appeal.lpaQuestionnaireId,
							appeal.appellantCaseStatus,
							appeal.lpaQuestionnaireStatus,
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
		headingClasses: 'govuk-heading-l govuk-!-margin-bottom-6',
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
 * @param {string} appellantCaseStatus
 * @param {string} lpaQuestionnaireStatus
 * @param {string} appealDueDate
 * @param {boolean} [isCaseOfficer]
 * @returns {string}
 */
export function mapAppealStatusToActionRequiredHtml(
	appealId,
	appealStatus,
	hasAwaitingComments,
	lpaQuestionnaireId,
	appellantCaseStatus,
	lpaQuestionnaireStatus,
	appealDueDate,
	isCaseOfficer = false
) {
	const dueDatePassed = dateIsInThePast(dateISOStringToDayMonthYearHourMinute(appealDueDate));

	switch (appealStatus) {
		case APPEAL_CASE_STATUS.READY_TO_START:
			return isCaseOfficer
				? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/start-case/add">Start case</a>`
				: 'Start case';
		case APPEAL_CASE_STATUS.VALIDATION:
			if (appellantCaseStatus == 'Incomplete') {
				return isCaseOfficer
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Awaiting appellant update</a>`
					: 'Awaiting appellant update';
			}

			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Review appellant case</a>`;
		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE:
			if (dueDatePassed) {
				return 'LPA questionnaire overdue';
			}

			if (lpaQuestionnaireStatus == 'Incomplete') {
				return isCaseOfficer
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}">Awaiting LPA update</a>`
					: 'Awaiting LPA update';
			}

			if (lpaQuestionnaireId) {
				return isCaseOfficer
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}">Review LPA questionnaire</a>`
					: 'Review LPA questionnaire';
			}
			return 'Awaiting LPA questionnaire';
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION:
			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/issue-decision/decision">Issue decision</a>`;
		case APPEAL_CASE_STATUS.AWAITING_TRANSFER:
			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/change-appeal-type/add-horizon-reference">Update Horizon reference</a>`;
		case APPEAL_CASE_STATUS.STATEMENTS:
			if (dueDatePassed && !hasAwaitingComments) {
				return '<a class="govuk-link" href="#">Share IP comments and statements</a>';
			}

			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/interested-party-comments">${
				hasAwaitingComments ? 'Review IP comments' : 'Awaiting IP comments'
			}</a>`;
		default:
			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">View case</a>`;
	}
}
