import config from '#environment/config.js';
import { permissionNames } from '#environment/permissions.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { getCaseContacts } from './common/case-contacts.js';
import { getCaseCosts } from './common/case-costs.js';
import { getCaseManagement } from './common/case-management.js';
import { getCaseOverview } from './common/case-overview.js';
import { getCaseTeam } from './common/case-team.js';
import { getSiteDetails as getSiteDetailsLegacy } from './common/site-details-legacy.js';
import { getSiteDetails } from './common/site-details.js';
import { removeAppealDetailsSectionComponentsActions } from './utils/index.js';

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {*}
 */
export function generateAppealDetailsPageComponents(appealDetails, mappedData, session) {
	const caseOverview = getCaseOverview(mappedData, appealDetails);

	const siteDetailsShouldBeHidden =
		isChildAppeal(appealDetails) ||
		!isStatePassed(appealDetails, APPEAL_CASE_STATUS.READY_TO_START);

	const siteDetails = siteDetailsShouldBeHidden
		? []
		: config.featureFlags.featureFlagCancelSiteVisit
		? getSiteDetails(mappedData, appealDetails)
		: getSiteDetailsLegacy(mappedData, appealDetails);

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
					},
					wrapperHtml: {
						opening: '<h2 class="govuk-heading-l">Timetable</h2>',
						closing: ''
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
					},
					wrapperHtml: {
						opening: '<h2 class="govuk-heading-l">Timetable</h2>',
						closing: ''
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
		},
		wrapperHtml: {
			opening: '<h2 class="govuk-heading-l">Documentation</h2>',
			closing: ''
		}
	};

	const caseCosts = !isChildAppeal(appealDetails) && getCaseCosts(mappedData);

	const caseContacts = getCaseContacts(mappedData);

	const caseTeam = !isChildAppeal(appealDetails) && getCaseTeam(mappedData);

	const caseManagement = getCaseManagement(mappedData);

	const pageComponents = [
		caseOverview,
		...(siteDetails ?? []),
		caseTimetable[0],
		caseDocumentation,
		...(caseCosts ? [caseCosts] : []),
		caseContacts,
		...(caseTeam ? [caseTeam] : []),
		caseManagement
	];

	if (
		!userHasPermission(permissionNames.viewCaseDetails, session) ||
		appealDetails.appealStatus === APPEAL_CASE_STATUS.AWAITING_TRANSFER
	) {
		removeAppealDetailsSectionComponentsActions(pageComponents);
	}
	return pageComponents;
}
