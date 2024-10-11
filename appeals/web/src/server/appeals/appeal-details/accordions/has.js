import { permissionNames } from '#environment/permissions.js';
import { removeSummaryListActions } from '#lib/mappers/mapper-utilities.js';
import { userHasPermission } from '#lib/mappers/permissions.mapper.js';
import { isDefined } from '#lib/ts-utilities.js';
import {
	mapStatusDependentNotifications,
	removeAccordionComponentsActions
} from './utils/index.js';

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {boolean} [ipCommentsAwaitingReview]
 * @returns
 */
export function generateAccordion(appealDetails, mappedData, session, ipCommentsAwaitingReview) {
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

	if (!userHasPermission(permissionNames.viewCaseDetails, session)) {
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
