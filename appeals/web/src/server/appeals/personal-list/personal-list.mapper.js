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
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { isRepresentationReviewRequired } from '#lib/representation-utilities.js';
import { mapStatusText } from '#lib/appeal-status.js';

/** @typedef {import('@pins/appeals').AppealSummary} AppealSummary */
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
						html: mapAppealStatusToActionRequiredHtml(appeal, isCaseOfficer)
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
										? mapStatusText(appeal.appealStatus, appeal.appealType)
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
 * @param {Partial<AppealSummary & { appealTimetable: Record<string,string> }>} appeal
 * @param {boolean} [isCaseOfficer]
 * @returns {string}
 */
export function mapAppealStatusToActionRequiredHtml(appeal, isCaseOfficer = false) {
	const {
		appealId,
		appealStatus,
		lpaQuestionnaireId,
		documentationSummary,
		dueDate: appealDueDate,
		appealTimetable
	} = appeal;

	const {
		appellantCaseStatus,
		lpaQuestionnaireStatus,
		lpaStatementStatus,
		lpaStatementRepresentationStatus,
		ipCommentsStatus,
		lpaFinalCommentsStatus,
		lpaFinalCommentsRepresentationStatus,
		appellantFinalCommentsStatus,
		appellantFinalCommentsRepresentationStatus
	} = mapDocumentSummaryStatuses(documentationSummary || {});

	const { ipComments } = documentationSummary || {};

	const { lpaStatementDueDate, ipCommentsDueDate } = appealTimetable || {};

	const appealDueDatePassed = dateIsInThePast(dateISOStringToDayMonthYearHourMinute(appealDueDate));
	const lpaStatementDueDatePassed = dateIsInThePast(
		dateISOStringToDayMonthYearHourMinute(lpaStatementDueDate)
	);
	const ipCommentsDueDatePassed = dateIsInThePast(
		dateISOStringToDayMonthYearHourMinute(ipCommentsDueDate)
	);

	const hasItemsToShare =
		lpaStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.VALID ||
		(ipComments?.counts?.valid ?? 0) > 0;

	const lpaStatementIncomplete =
		lpaStatementRepresentationStatus === APPEAL_REPRESENTATION_STATUS.INCOMPLETE;

	const nothingHasBeenReceived =
		ipCommentsStatus === 'not_received' && lpaStatementStatus === 'not_received';

	const ipCommentsAwaitingReview =
		(documentationSummary?.ipComments?.counts?.[APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW] ??
			0) > 0;

	const lpaStatementAwaitingReview =
		lpaStatementStatus === 'received' || lpaStatementStatus === 'incomplete';

	const allIpCommentsHaveBeenRejected = (ipComments?.counts?.valid ?? 0) === 0;

	switch (appealStatus) {
		case APPEAL_CASE_STATUS.READY_TO_START:
			return isCaseOfficer
				? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/start-case/add">Start case<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				: 'Start case';
		case APPEAL_CASE_STATUS.VALIDATION:
			if (appellantCaseStatus === 'Incomplete') {
				return isCaseOfficer
					? `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Awaiting appellant update<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					: 'Awaiting appellant update';
			}

			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/appellant-case">Review appellant case<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE:
			if (appealDueDatePassed) {
				return 'LPA questionnaire overdue';
			}

			if (lpaQuestionnaireStatus === 'Incomplete') {
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
		case APPEAL_CASE_STATUS.EVENT:
			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/site-visit/schedule-visit">Set up site visit<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		case APPEAL_CASE_STATUS.AWAITING_EVENT:
			return '';
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION:
			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/issue-decision/decision">Issue decision<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		case APPEAL_CASE_STATUS.AWAITING_TRANSFER:
			return `<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/change-appeal-type/add-horizon-reference">Update Horizon reference<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`;
		case APPEAL_CASE_STATUS.STATEMENTS: {
			// Build list of actions
			const actions = [];

			if (lpaStatementIncomplete) {
				actions.push(
					`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-statement">Update LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				);
			}

			if (lpaStatementDueDatePassed && lpaStatementStatus === 'not_received') {
				actions.push(
					`<span>Awaiting LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></span>`
				);
			}

			if (ipCommentsAwaitingReview || lpaStatementAwaitingReview) {
				actions.push(
					`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/interested-party-comments">Review IP comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				);
				if (!lpaStatementIncomplete && lpaStatementAwaitingReview) {
					actions.push(
						`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/lpa-statement">Review LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					);
				}
			} else if (
				lpaStatementDueDatePassed &&
				ipCommentsDueDatePassed &&
				!ipCommentsAwaitingReview &&
				!lpaStatementAwaitingReview
			) {
				if (hasItemsToShare) {
					actions.push(
						`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/share">Share IP comments and LPA statement<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					);
				} else if (
					(lpaStatementStatus === 'not_received' && allIpCommentsHaveBeenRejected) ||
					nothingHasBeenReceived
				) {
					actions.push(
						`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/share">Progress to final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					);
				}
			}

			if (!ipCommentsDueDatePassed && !ipCommentsAwaitingReview) {
				actions.push(
					`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/interested-party-comments">Awaiting IP comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
				);
			}

			return actions.join('<br>');
		}
		case APPEAL_CASE_STATUS.FINAL_COMMENTS: {
			const finalCommentsDueDate = appealTimetable?.finalCommentsDueDate;
			const isFinalCommentsDueDatePassed = finalCommentsDueDate
				? dateIsInThePast(dateISOStringToDayMonthYearHourMinute(finalCommentsDueDate))
				: false;

			const hasValidFinalCommentsAppellant =
				documentationSummary.appellantFinalComments?.representationStatus ===
				APPEAL_REPRESENTATION_STATUS.VALID;

			const hasValidFinalCommentsLPA =
				documentationSummary.lpaFinalComments?.representationStatus ===
				APPEAL_REPRESENTATION_STATUS.VALID;

			const lpaReceived = lpaFinalCommentsStatus === 'received';
			const appellantReceived = appellantFinalCommentsStatus === 'received';

			const appellantFinalCommentsAwaitingReview =
				appellantReceived &&
				isRepresentationReviewRequired(appellantFinalCommentsRepresentationStatus);
			const lpaFinalCommentsAwaitingReview =
				lpaReceived && isRepresentationReviewRequired(lpaFinalCommentsRepresentationStatus);

			// Build list of required actions
			const actions = [];
			if (appellantFinalCommentsAwaitingReview || lpaFinalCommentsAwaitingReview) {
				if (appellantFinalCommentsAwaitingReview) {
					actions.push(
						`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/appellant">Review appellant final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					);
				}
				if (lpaFinalCommentsAwaitingReview) {
					actions.push(
						`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/final-comments/lpa">Review LPA final comments<span class="govuk-visually-hidden"> for appeal ${appealId}</span></a>`
					);
				}
			} else {
				if (!lpaReceived && !appellantReceived) {
					actions.push('Awaiting final comments');
				}
				if (isFinalCommentsDueDatePassed) {
					if (hasValidFinalCommentsAppellant || hasValidFinalCommentsLPA) {
						actions.push(
							`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/share">Share final comments</a>`
						);
					} else {
						actions.push(
							`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/share">Progress case</a>`
						);
					}
				}
			}
			return actions.join('<br>');
		}
		default:
			return '';
	}
}

/**
 *
 * @param {Record<string, {status: string, representationStatus: string}>} documentSummary
 * @returns {Record<string, string>}
 */
function mapDocumentSummaryStatuses(documentSummary) {
	const statuses = {};
	for (const [key, value] of Object.entries(documentSummary)) {
		if (value.status) {
			// @ts-ignore
			statuses[key + 'Status'] = value.status;
		}
		if (value.representationStatus) {
			// @ts-ignore
			statuses[key + 'RepresentationStatus'] = value.representationStatus;
		}
	}
	// @ts-ignore
	return statuses;
}
