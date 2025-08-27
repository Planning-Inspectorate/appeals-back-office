import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';
import { getCaseContacts } from './common/case-contacts.js';
import { getCaseCosts } from './common/case-costs.js';
import { getCaseManagement } from './common/case-management.js';
import { getCaseOverview } from './common/case-overview.js';
import { getCaseTeam } from './common/case-team.js';
import { getSiteDetails } from './common/site-details.js';
import { removeAccordionComponentsActions } from './utils/index.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {SharedPageComponentProperties & AccordionPageComponent}
 */
export function generateAccordion(appealDetails, mappedData, session) {
	const caseOverview = getCaseOverview(mappedData, appealDetails);

	const siteDetails = isChildAppeal(appealDetails) ? [] : getSiteDetails(mappedData, appealDetails);

	/** @type {PageComponent[]} */
	const caseTimetable = appealDetails.startedAt
		? [
				{
					type: 'summary-list',
					parameters: {
						classes: 'appeal-case-timetable',
						rows: [
							mappedData.appeal.validAt.display.summaryListItem,
							mappedData.appeal.startedAt.display.summaryListItem,
							...(appealDetails.startedAt
								? [mappedData.appeal.lpaQuestionnaireDueDate.display.summaryListItem]
								: []),
							mappedData.appeal.siteVisitTimetable.display.summaryListItem
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
				mappedData.appeal.lpaQuestionnaire.display.tableItem
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
		...(siteDetails ?? []),
		caseTimetable[0],
		caseDocumentation,
		caseContacts,
		caseTeam,
		caseManagement
	];

	if (
		!userHasPermission(permissionNames.viewCaseDetails, session) ||
		appealDetails.appealStatus === APPEAL_CASE_STATUS.AWAITING_TRANSFER
	) {
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
				...(siteDetails.length
					? [
							{
								heading: { text: 'Site' },
								content: { html: '', pageComponents: siteDetails }
							}
					  ]
					: []),
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
