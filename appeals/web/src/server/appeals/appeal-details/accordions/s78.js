import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/permissions.mapper.js';
import { isDefined } from '#lib/ts-utilities.js';
import { getCaseContacts } from './common/case-contacts.js';
import { getCaseCosts } from './common/case-costs.js';
import { getCaseManagement } from './common/case-management.js';
import { getCaseOverview } from './common/case-overview.js';
import { getCaseTeam } from './common/case-team.js';
import { getSiteDetails } from './common/site-details.js';
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
 * @returns {SharedPageComponentProperties & AccordionPageComponent}
 */
export function generateAccordion(appealDetails, mappedData, session, ipCommentsAwaitingReview) {
	const caseOverview = getCaseOverview(mappedData);

	const siteDetails = getSiteDetails(mappedData);

	/** @type {PageComponent[]} */
	const caseTimetable = [
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
				mappedData.appeal.ipComments.display.tableItem,
				mappedData.appeal.appealDecision.display.tableItem
			].filter(isDefined),
			firstCellIsHeader: true
		}
	};

	const caseCosts = getCaseCosts(mappedData);

	const caseContacts = getCaseContacts(mappedData);

	const caseTeam = getCaseTeam(mappedData);

	const caseManagement = getCaseManagement(mappedData);

	const accordionComponents = [
		caseOverview,
		siteDetails,
		caseTimetable[0],
		caseDocumentation,
		caseContacts,
		caseTeam,
		caseManagement
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
