import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
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
 * @returns
 */
export function generateAccordion(appealDetails, mappedData, session, ipCommentsAwaitingReview) {
	const caseOverview = getCaseOverview(mappedData);

	const siteDetails = getSiteDetails(mappedData);

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
				{ text: 'Action', classes: 'govuk-!-text-align-right' }
			],
			rows: [
				mappedData.appeal.appellantCase.display.tableItem,
				mappedData.appeal.lpaQuestionnaire.display.tableItem,
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

	mapStatusDependentNotifications(appealDetails, session, accordionComponents, {
		ipComments: ipCommentsAwaitingReview || false,
		appellantFinalComments: false,
		lpaFinalComments: false,
		lpaStatement: false
	});

	if (!userHasPermission(permissionNames.viewCaseDetails, session)) {
		removeAccordionComponentsActions(accordionComponents);
	}

	/** @type {PageComponent} */
	const appealDetailsAccordion = {
		type: 'accordion',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
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
