import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';
import { getCaseContacts } from './common/case-contacts.js';
import { getCaseCosts } from './common/case-costs.js';
import { getCaseManagement } from './common/case-management.js';
import { getCaseOverview } from './common/case-overview.js';
import { getCaseTeam } from './common/case-team.js';
import { getSiteDetails } from './common/site-details.js';
import { getCaseHearing } from './s78/case-hearing.js';
import { getCaseInquiry } from './s78/case-inquiry.js';
import { removeAccordionComponentsActions } from './utils/index.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { isChildAppeal } from '#lib/mappers/utils/is-child-appeal.js';

/**
 *
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {SharedPageComponentProperties & AccordionPageComponent}
 */
export function generateAccordion(appealDetails, mappedData, session) {
	const caseOverview = getCaseOverview(mappedData);

	const siteDetails = getSiteDetails(mappedData, appealDetails);

	/** @type {PageComponent[]} */
	const caseTimetable = [
		{
			type: 'summary-list',
			parameters: {
				classes: 'appeal-case-timetable',
				rows: [
					mappedData.appeal.validAt.display.summaryListItem,
					mappedData.appeal.startedAt.display.summaryListItem,
					...(appealDetails.startedAt
						? [
								mappedData.appeal.lpaQuestionnaireDueDate.display.summaryListItem,
								mappedData.appeal.lpaStatementDueDate.display.summaryListItem,
								mappedData.appeal.ipCommentsDueDate.display.summaryListItem,
								mappedData.appeal.statementOfCommonGroundDueDate.display.summaryListItem,
								mappedData.appeal.planningObligationDueDate.display.summaryListItem,
								mappedData.appeal.proofOfEvidenceAndWitnessesDueDate.display.summaryListItem,
								mappedData.appeal.hearingDate.display.summaryListItem,
								mappedData.appeal.inquiryDate.display.summaryListItem,
								mappedData.appeal.finalCommentDueDate.display.summaryListItem
						  ]
						: [])
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
				{ text: 'Date' },
				{ text: 'Action', classes: 'govuk-!-text-align-right' }
			],
			rows: [
				mappedData.appeal.appellantCase.display.tableItem,
				mappedData.appeal.lpaQuestionnaire.display.tableItem,
				...(!isChildAppeal(appealDetails)
					? [
							mappedData.appeal.lpaStatement.display.tableItem,
							mappedData.appeal.ipComments.display.tableItem,
							mappedData.appeal.appellantFinalComments.display.tableItem,
							mappedData.appeal.lpaFinalComments.display.tableItem
					  ]
					: []),
				mappedData.appeal.environmentalAssessment.display.tableItem
			].filter(isDefined),
			firstCellIsHeader: true
		}
	};

	const caseCosts = getCaseCosts(mappedData);

	const caseContacts = getCaseContacts(mappedData);

	const caseTeam = getCaseTeam(mappedData);

	const caseManagement = getCaseManagement(mappedData);

	const caseHearing = getCaseHearing(mappedData, appealDetails);

	const caseInquiry = getCaseInquiry(mappedData, appealDetails);

	const accordionComponents = [
		caseOverview,
		...(siteDetails ?? []),
		caseTimetable[0],
		...(caseHearing ?? []),
		...(caseInquiry ?? []),
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
				...(caseHearing
					? [
							{
								heading: { text: 'Hearing' },
								content: { html: '', pageComponents: caseHearing }
							}
					  ]
					: []),
				...(caseInquiry
					? [
							{
								heading: { text: 'Inquiry' },
								content: { html: '', pageComponents: caseInquiry }
							}
					  ]
					: []),
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
