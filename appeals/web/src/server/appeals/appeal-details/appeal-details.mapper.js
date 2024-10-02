import logger from '../../lib/logger.js';
import {
	initialiseAndMapAppealData,
	generateDecisionDocumentDownloadHtml
} from '#lib/mappers/appeal/appeal.mapper.js';
import { buildNotificationBanners } from '#lib/mappers/notification-banners.mapper.js';
import { isDefined } from '#lib/ts-utilities.js';
import { removeSummaryListActions } from '#lib/mappers/mapper-utilities.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { mapVirusCheckStatus } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { getAppealTypesFromId } from '#appeals/appeal-details/change-appeal-type/change-appeal-type.service.js';
import { APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { isFeatureActive } from '#common/feature-flags.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import config from '#environment/config.js';
import {
	generateIssueDecisionUrl,
	generateStartTimetableUrl
} from './issue-decision/issue-decision.mapper.js';
import { dateISOStringToDisplayDate, getTodaysISOString } from '#lib/dates.js';

export const pageHeading = 'Case details';

/**
 * @param {import('./appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} currentRoute
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {boolean} [ipCommentsAwaitingReview]
 * @returns {Promise<PageContent>}
 */
export async function appealDetailsPage(
	appealDetails,
	currentRoute,
	session,
	request,
	ipCommentsAwaitingReview
) {
	const mappedData = await initialiseAndMapAppealData(appealDetails, currentRoute, session);
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Case details - ${shortAppealReference}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Case details',
		pageComponents: []
	};

	/** @type {PageComponent|undefined} */
	let statusTag;

	if (mappedData.appeal.appealStatus.display?.statusTag) {
		statusTag = {
			type: 'status-tag',
			parameters: {
				...mappedData.appeal.appealStatus.display.statusTag
			}
		};
	}

	/** @type {PageComponent|undefined} */
	let leadOrChildTag;

	if (mappedData.appeal.leadOrChild.display?.statusTag) {
		leadOrChildTag = {
			type: 'status-tag',
			parameters: {
				...mappedData.appeal.leadOrChild.display.statusTag
			}
		};
	}

	/** @type {PageComponent} */
	const caseSummary = {
		type: 'summary-list',
		parameters: {
			rows: [
				removeSummaryListActions(mappedData.appeal.siteAddress.display.summaryListItem),
				removeSummaryListActions(mappedData.appeal.localPlanningAuthority.display.summaryListItem)
			].filter(isDefined),
			classes: 'govuk-summary-list--no-border'
		}
	};

	/** @type {PageComponent} */
	let appealDetailsAccordion = generateAccordionItems(
		appealDetails,
		mappedData,
		session,
		ipCommentsAwaitingReview
	);

	const notificationBanners = buildNotificationBanners(
		session,
		'appealDetails',
		appealDetails.appealId
	);

	const statusTagsComponentGroup = statusTag ? [statusTag] : [];

	if (leadOrChildTag) {
		statusTagsComponentGroup.push(leadOrChildTag);
	}

	const isAppealComplete = appealDetails.appealStatus === APPEAL_CASE_STATUS.COMPLETE;
	const isAppealWithdrawn = appealDetails.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN;
	if (isAppealComplete && statusTag && appealDetails.decision.documentId) {
		const letterDate = appealDetails.decision?.letterDate
			? dateISOStringToDisplayDate(appealDetails.decision.letterDate)
			: dateISOStringToDisplayDate(getTodaysISOString());

		const virusCheckStatus = mapVirusCheckStatus(
			appealDetails.decision.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
		);

		statusTagsComponentGroup.push({
			type: 'inset-text',
			parameters: {
				html: `<p>Appeal completed: ${letterDate}</p>
						<p>Decision: ${appealDetails.decision?.outcome}</p>
						<p>${
							!(virusCheckStatus.checked && virusCheckStatus.safe)
								? '<span class="govuk-body">View decision letter</span> '
								: ''
						}${generateDecisionDocumentDownloadHtml(appealDetails, 'View decision letter')}</p>`
			}
		});

		shortAppealReference;
	} else if (
		isAppealWithdrawn &&
		statusTag &&
		appealDetails?.withdrawal?.withdrawalFolder?.documents?.length
	) {
		const withdrawalRequestDate =
			appealDetails.withdrawal?.withdrawalRequestDate &&
			dateISOStringToDisplayDate(appealDetails.withdrawal?.withdrawalRequestDate);

		const virusCheckStatus = mapVirusCheckStatus(
			appealDetails?.withdrawal.withdrawalFolder.documents[0].latestDocumentVersion
				.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
		);

		if (withdrawalRequestDate) {
			if (virusCheckStatus.checked && virusCheckStatus.safe) {
				statusTagsComponentGroup.push({
					type: 'inset-text',
					parameters: {
						html: `<p>Withdrawn: ${withdrawalRequestDate}</p>
								<p><a class="govuk-link" href="/appeals-service/appeal-details/${appealDetails.appealId}/withdrawal/view">View withdrawal request</a></p>`
					}
				});
			} else {
				statusTagsComponentGroup.push({
					type: 'inset-text',
					parameters: {
						html: `<p>Withdrawn: ${withdrawalRequestDate}</p>
								<p><span class="govuk-body">View withdrawal request</span>
								<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong></p>`
					}
				});
			}
		}
	} else if (
		appealDetails.appealStatus === APPEAL_CASE_STATUS.CLOSED &&
		appealDetails.resubmitTypeId &&
		appealDetails.appealTimetable?.caseResubmissionDueDate
	) {
		const appealTypesFromId = await getAppealTypesFromId(request.apiClient, appealDetails.appealId);
		const appealTypeById = appealTypesFromId?.find(
			(appealType) => appealType.id === appealDetails.resubmitTypeId
		);
		const appealTypeText =
			appealTypeById?.key && appealTypeById?.type
				? `${appealTypeById.type} (${appealTypeById.key})`
				: '';
		const caseResubmissionDueDate = dateISOStringToDisplayDate(
			appealDetails.appealTimetable.caseResubmissionDueDate
		);

		if (appealTypeText) {
			statusTagsComponentGroup.push({
				type: 'inset-text',
				parameters: {
					html: `<p>This appeal needed to change to ${appealTypeText}</p><p>The appellant has until ${caseResubmissionDueDate} to resubmit.</p>`
				}
			});
		}
	}

	if (appealDetails.appealStatus === 'transferred') {
		if (
			appealDetails.transferStatus &&
			appealDetails.transferStatus.transferredAppealReference &&
			appealDetails.transferStatus.transferredAppealType
		) {
			statusTagsComponentGroup.push({
				type: 'inset-text',
				parameters: {
					html: `<p class="govuk-body">This appeal needed to change to a ${appealDetails.transferStatus.transferredAppealType}</p>
					<p class="govuk-body">It has been transferred to Horizon with the reference ${appealDetails.transferStatus.transferredAppealReference}</p>`,
					classes: 'govuk-!-margin-top-0'
				}
			});
		} else {
			logger.error(
				`appeal ${appealDetails.appealId} status is 'transferred' but transferStatus or one of its properties is not present in the appeal data`
			);
		}
	}

	const pageComponents = [
		...notificationBanners,
		...statusTagsComponentGroup,
		caseSummary,
		appealDetailsAccordion
	];

	preRenderPageComponents(pageComponents);

	pageContent.pageComponents = pageComponents;

	return pageContent;
}

/**
 * @param {import('./appeal-details.types.js').WebAppeal} appealDetails
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {PageComponent[]} accordionComponents
 * @param {boolean} [ipCommentsAwaitingReview]
 * @returns {void}
 */
function mapStatusDependentNotifications(
	appealDetails,
	session,
	accordionComponents,
	ipCommentsAwaitingReview = false
) {
	switch (appealDetails.appealStatus) {
		case APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER:
			addNotificationBannerToSession(
				session,
				'assignCaseOfficer',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Appeal ready to be assigned to case officer</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/assign-user/case-officer" data-cy="banner-assign-case-officer">Assign case officer</a></p>`
			);
			break;
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION:
			addNotificationBannerToSession(
				session,
				'readyForDecision',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Ready for decision</p><p><a class="govuk-notification-banner__link" data-cy="issue-determination" href="${generateIssueDecisionUrl(
					appealDetails.appealId
				)}">Issue decision</a></p>`
			);
			break;
		case APPEAL_CASE_STATUS.READY_TO_START:
			addNotificationBannerToSession(
				session,
				'appealValidAndReadyToStart',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Appeal valid</p><p><a class="govuk-notification-banner__link" data-cy="ready-to-start" href="${generateStartTimetableUrl(
					appealDetails.appealId
				)}">Start case</a></p>`
			);
			break;
		case APPEAL_CASE_STATUS.AWAITING_TRANSFER:
			addNotificationBannerToSession(
				session,
				'appealAwaitingTransfer',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">This appeal is awaiting transfer</p><p class="govuk-body">The appeal must be transferred to Horizon. When this is done, <a class="govuk-link" data-cy="awaiting-transfer" href="/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/add-horizon-reference">update the appeal with the new horizon reference</a>.</p>`
			);
			removeAccordionComponentsActions(accordionComponents);
			break;
		case APPEAL_CASE_STATUS.STATEMENTS:
			if (ipCommentsAwaitingReview) {
				addNotificationBannerToSession(
					session,
					'interestedPartyCommentsAwaitingReview',
					appealDetails.appealId,
					`<p class="govuk-notification-banner__heading">Review comments</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments" data-cy="banner-review-ip-comments">Review <span class="govuk-visually-hidden">interested party comments</span></a></p>`
				);
			}
			break;
		default:
			break;
	}

	if (
		'notificationBanners' in session &&
		'appealAwaitingTransfer' in session.notificationBanners &&
		appealDetails.appealStatus !== 'awaiting_transfer'
	) {
		delete session.notificationBanners.appealAwaitingTransfer;
	}
}

const caseDocumentationTableActionColumnIndex = 3;

/**
 * @param {PageComponent[]} accordionComponents
 * @returns {void}
 */
function removeAccordionComponentsActions(accordionComponents) {
	accordionComponents.forEach((component) => {
		switch (component.type) {
			case 'summary-list':
				component.parameters.rows = component.parameters.rows.map(
					(/** @type {SummaryListRowProperties} */ row) => removeSummaryListActions(row)
				);
				break;
			case 'table':
				component.parameters.rows.forEach((/** @type {TableCellProperties[]} */ row) =>
					row.forEach((cell, index) => {
						if (index === caseDocumentationTableActionColumnIndex && 'html' in cell) {
							cell.html = '';
						}
					})
				);
				break;
			default:
				break;
		}
	});
}

/**
 *
 * @param {import('./appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {boolean} [ipCommentsAwaitingReview]
 * @returns {PageComponent}
 */
function generateAccordionItems(appealDetails, mappedData, session, ipCommentsAwaitingReview) {
	switch (appealDetails.appealType) {
		case APPEAL_TYPE.D:
			return generateAccordion(appealDetails, mappedData, session);
		case APPEAL_TYPE.W:
			if (!isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
				throw new Error('Feature flag inactive for S78');
			}
			return generateAccordion(appealDetails, mappedData, session, ipCommentsAwaitingReview);
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}

/**
 *
 * @param {import('./appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {boolean} [ipCommentsAwaitingReview]
 * @returns
 */
function generateAccordion(appealDetails, mappedData, session, ipCommentsAwaitingReview) {
	/** @type {PageComponent} */
	const caseOverview = {
		type: 'summary-list',
		parameters: {
			rows: [
				mappedData.appeal.appealType.display.summaryListItem,
				removeSummaryListActions(mappedData.appeal?.caseProcedure?.display.summaryListItem),
				mappedData.appeal?.linkedAppeals?.display.summaryListItem,
				mappedData.appeal?.otherAppeals?.display.summaryListItem,
				mappedData.appeal?.allocationDetails?.display.summaryListItem,
				removeSummaryListActions(mappedData.appeal?.lpaReference?.display.summaryListItem),
				mappedData.appeal?.decision?.display.summaryListItem
			].filter(isDefined)
		}
	};

	/** @type {PageComponent} */
	const siteDetails = {
		type: 'summary-list',
		parameters: {
			rows: [
				mappedData.appeal.lpaInspectorAccess.display.summaryListItem,
				mappedData.appeal.appellantInspectorAccess.display.summaryListItem,
				mappedData.appeal.neighbouringSiteIsAffected.display.summaryListItem,
				mappedData.appeal.lpaNeighbouringSites.display.summaryListItem,
				mappedData.appeal.inspectorNeighbouringSites.display.summaryListItem,
				mappedData.appeal.lpaHealthAndSafety.display.summaryListItem,
				mappedData.appeal.appellantHealthAndSafety.display.summaryListItem,
				mappedData.appeal.visitType.display.summaryListItem
			].filter(isDefined)
		}
	};

	/** @type {PageComponent[]} */
	const caseTimetable = (() => {
		switch (appealDetails.appealType) {
			case APPEAL_TYPE.D:
				return appealDetails.startedAt
					? [
							{
								type: 'summary-list',
								parameters: {
									rows: [
										mappedData.appeal.validAt.display.summaryListItem,
										mappedData.appeal.startedAt.display.summaryListItem,
										mappedData.appeal.lpaQuestionnaireDueDate.display.summaryListItem,
										mappedData.appeal.siteVisitDate.display.summaryListItem
									].filter(isDefined)
								}
							}
					  ]
					: [
							{
								type: 'summary-list',
								parameters: {
									rows: [
										mappedData.appeal.validAt.display.summaryListItem,
										mappedData.appeal.startedAt.display.summaryListItem
									].filter(isDefined)
								}
							}
					  ];
			case APPEAL_TYPE.W:
				if (!isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
					throw new Error('Feature flag inactive for S78');
				}
				return [
					{
						type: 'summary-list',
						parameters: {
							rows: [
								mappedData.appeal.validAt.display.summaryListItem,
								mappedData.appeal.startedAt.display.summaryListItem,
								mappedData.appeal.lpaQuestionnaireDueDate.display.summaryListItem,
								mappedData.appeal.lpaStatementDueDate.display.summaryListItem,
								mappedData.appeal.ipCommentsDueDate.display.summaryListItem,
								mappedData.appeal.appellantFinalCommentDueDate.display.summaryListItem,
								mappedData.appeal.lpaFinalCommentDueDate.display.summaryListItem,
								mappedData.appeal.s106ObligationDueDate.display.summaryListItem
							].filter(isDefined)
						}
					}
				];
			default:
				throw new Error('Invalid appealType, unable to generate display page');
		}
	})();

	/** @type {PageComponent} */
	const caseDocumentation = {
		type: 'table',
		parameters: {
			head: [
				{ text: 'Documentation' },
				{ text: 'Status' },
				{ text: 'Received' },
				{ text: 'Action' }
			],
			rows: [
				mappedData.appeal.appellantCase.display.tableItem,
				mappedData.appeal.lpaQuestionnaire.display.tableItem,
				mappedData.appeal.appealDecision.display.tableItem
			].filter(isDefined),
			firstCellIsHeader: true
		}
	};

	/** @type {PageComponent} */
	const caseCosts = {
		type: 'table',
		parameters: {
			head: [{ text: 'Documentation' }, { text: 'Status' }, { text: 'Action' }],
			rows: [
				mappedData.appeal.costsAppellantApplication.display.tableItem,
				mappedData.appeal.costsAppellantWithdrawal.display.tableItem,
				mappedData.appeal.costsAppellantCorrespondence.display.tableItem,
				mappedData.appeal.costsLpaApplication.display.tableItem,
				mappedData.appeal.costsLpaWithdrawal.display.tableItem,
				mappedData.appeal.costsLpaCorrespondence.display.tableItem,
				mappedData.appeal.costsDecision.display.tableItem
			].filter(isDefined),
			firstCellIsHeader: true
		}
	};

	/** @type {PageComponent} */
	const caseContacts = {
		type: 'summary-list',
		parameters: {
			rows: [
				mappedData.appeal.appellant.display.summaryListItem,
				mappedData.appeal.agent.display.summaryListItem,
				removeSummaryListActions({
					...mappedData.appeal.localPlanningAuthority.display.summaryListItem,
					key: {
						text: 'LPA'
					}
				})
			].filter(isDefined)
		}
	};

	/** @type {PageComponent} */
	const caseTeam = {
		type: 'summary-list',
		parameters: {
			rows: [
				mappedData.appeal.caseOfficer.display.summaryListItem,
				mappedData.appeal.inspector.display.summaryListItem
			].filter(isDefined)
		}
	};

	/** @type {PageComponent} */
	const caseManagement = {
		type: 'summary-list',
		parameters: {
			rows: [
				mappedData.appeal.crossTeamCorrespondence.display.summaryListItem,
				mappedData.appeal.inspectorCorrespondence.display.summaryListItem,
				mappedData.appeal.caseHistory.display.summaryListItem,
				mappedData.appeal.appealWithdrawal.display.summaryListItem
			]
		}
	};

	const accordionComponents = [
		caseOverview,
		siteDetails,
		caseTimetable[0],
		caseDocumentation,
		caseContacts,
		caseTeam
	];

	mapStatusDependentNotifications(
		appealDetails,
		session,
		accordionComponents,
		ipCommentsAwaitingReview
	);

	if (
		!session.account.idTokenClaims.groups.includes(config.referenceData.appeals.caseOfficerGroupId)
	) {
		removeAccordionComponentsActions(accordionComponents);
	}

	/** @type {PageComponent} */
	const appealDetailsAccordion = {
		type: 'accordion',
		parameters: {
			id: 'accordion-default' + appealDetails.appealId,
			items: [
				{
					heading: { text: 'Overview' },
					content: { html: '', pageComponents: [caseOverview] }
				},
				{
					heading: { text: 'Site' },
					content: { html: '', pageComponents: [siteDetails] }
				},
				{
					heading: { text: 'Timetable' },
					content: { html: '', pageComponents: caseTimetable }
				},
				{
					heading: { text: 'Documentation' },
					content: { html: '', pageComponents: [caseDocumentation] }
				},
				{
					heading: { text: 'Costs' },
					content: { html: '', pageComponents: [caseCosts] }
				},
				{
					heading: { text: 'Contacts' },
					content: { html: '', pageComponents: [caseContacts] }
				},
				{
					heading: { text: 'Team' },
					content: { html: '', pageComponents: [caseTeam] }
				},
				{
					heading: { text: 'Case management' },
					content: { html: '', pageComponents: [caseManagement] }
				}
			]
		}
	};

	return appealDetailsAccordion;
}
