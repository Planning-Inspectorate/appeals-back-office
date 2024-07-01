import logger from '../../lib/logger.js';
import config from '#environment/config.js';
import {
	initialiseAndMapAppealData,
	generateDecisionDocumentDownloadHtml
} from '#lib/mappers/appeal.mapper.js';
import { buildNotificationBanners } from '#lib/mappers/notification-banners.mapper.js';
import { isDefined } from '#lib/ts-utilities.js';
import { removeSummaryListActions } from '#lib/mappers/mapper-utilities.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { mapVirusCheckStatus } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	generateIssueDecisionUrl,
	generateStartTimetableUrl
} from '#appeals/appeal-details/issue-decision/issue-decision.mapper.js';
import { AVSCAN_STATUS } from '@pins/appeals/constants/documents.js';

export const pageHeading = 'Case details';

/**
 * @param {import('./appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} currentRoute
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {Promise<PageContent>}
 */
export async function appealDetailsPage(appealDetails, currentRoute, session) {
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
	const caseTimetable = appealDetails.startedAt
		? [
				{
					type: 'summary-list',
					parameters: {
						rows: [
							mappedData.appeal.validAt.display.summaryListItem,
							mappedData.appeal.startedAt.display.summaryListItem,
							mappedData.appeal.lpaQuestionnaireDueDate.display.summaryListItem,
							mappedData.appeal.siteVisitDate.display.summaryListItem,
							...(appealDetails.appealType === 'Full planning'
								? [
										mappedData.appeal.issueDeterminationDate?.display.summaryListItem,
										mappedData.appeal.completeDate?.display.summaryListItem
								  ]
								: [])
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
				mappedData.appeal.costsAppellant.display.tableItem,
				mappedData.appeal.costsLpa.display.tableItem,
				mappedData.appeal.appealDecision.display.tableItem,
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
			rows: [mappedData.appeal.caseHistory.display.summaryListItem]
		}
	};

	const accordionComponents = [
		caseSummary,
		caseOverview,
		siteDetails,
		caseTimetable[0],
		caseDocumentation,
		caseContacts,
		caseTeam
	];

	mapStatusDependentNotifications(appealDetails, session, accordionComponents);

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

	const notificationBanners = buildNotificationBanners(
		session,
		'appealDetails',
		appealDetails.appealId
	);

	const statusTagsComponentGroup = statusTag ? [statusTag] : [];

	if (leadOrChildTag) {
		statusTagsComponentGroup.push(leadOrChildTag);
	}

	const isAppealComplete = appealDetails.appealStatus === 'complete';
	if (isAppealComplete && statusTag && appealDetails.decision.documentId) {
		const letterDate = appealDetails.decision?.letterDate
			? new Date(appealDetails.decision.letterDate)
			: new Date();

		const virusCheckStatus = mapVirusCheckStatus(
			appealDetails.decision.virusCheckStatus || AVSCAN_STATUS.NOT_SCANNED
		);

		statusTagsComponentGroup.push({
			type: 'inset-text',
			parameters: {
				html: `<p>
					Appeal completed: ${letterDate.toLocaleDateString('en-gb', {
						day: 'numeric',
						month: 'long',
						year: 'numeric'
					})}
						</p>
						<p>Decision: ${appealDetails.decision?.outcome}</p>
						<p>${
							!(virusCheckStatus.checked && virusCheckStatus.safe)
								? '<span class="govuk-body">View decision letter</span> '
								: ''
						}${generateDecisionDocumentDownloadHtml(appealDetails, 'View decision letter')}</p>`
			}
		});

		shortAppealReference;
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
 * @returns {void}
 */
function mapStatusDependentNotifications(appealDetails, session, accordionComponents) {
	switch (appealDetails.appealStatus) {
		case 'assign_case_officer':
			addNotificationBannerToSession(
				session,
				'assignCaseOfficer',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Appeal ready to be assigned to case officer</p><p><a class="govuk-notification-banner__link" href="/appeals-service/appeal-details/${appealDetails.appealId}/assign-user/case-officer" data-cy="assign-case-officer">Assign case officer</a></p>`
			);
			break;
		case 'issue_determination':
			addNotificationBannerToSession(
				session,
				'readyForDecision',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Ready for decision</p><p><a class="govuk-notification-banner__link" data-cy="issue-determination" href="${generateIssueDecisionUrl(
					appealDetails.appealId
				)}">Issue decision</a></p>`
			);
			break;
		case 'ready_to_start':
			addNotificationBannerToSession(
				session,
				'appealValidAndReadyToStart',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">Appeal valid</p><p><a class="govuk-notification-banner__link" data-cy="ready-to-start" href="${generateStartTimetableUrl(
					appealDetails.appealId
				)}">Start case</a></p>`
			);
			break;
		case 'awaiting_transfer':
			addNotificationBannerToSession(
				session,
				'appealAwaitingTransfer',
				appealDetails.appealId,
				`<p class="govuk-notification-banner__heading">This appeal is awaiting transfer</p><p class="govuk-body">The appeal must be transferred to Horizon. When this is done, <a class="govuk-link" data-cy="awaiting-transfer" href="/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/add-horizon-reference">update the appeal with the new horizon reference</a>.</p>`
			);
			removeAccordionComponentsActions(accordionComponents);
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
