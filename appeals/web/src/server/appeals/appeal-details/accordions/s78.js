import { getCaseDocumentation } from '#appeals/appeal-details/accordions/common/case-documentation.js';
import { permissionNames } from '#environment/permissions.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { getCaseContacts } from './common/case-contacts.js';
import { getCaseCosts } from './common/case-costs.js';
import { getCaseManagement } from './common/case-management.js';
import { getCaseOverview } from './common/case-overview.js';
import { getCaseTeam } from './common/case-team.js';
import { getSiteDetails } from './common/site-details.js';
import { getCaseHearing } from './s78/case-hearing.js';
import { getCaseInquiry } from './s78/case-inquiry.js';
import { removeAccordionComponentsActions } from './utils/index.js';

/**
 *
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {SharedPageComponentProperties & AccordionPageComponent}
 */
export function generateAccordion(appealDetails, mappedData, session) {
	const caseOverview = getCaseOverview(mappedData, appealDetails);

	const siteDetails = isChildAppeal(appealDetails) ? [] : getSiteDetails(mappedData, appealDetails);

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

	const caseDocumentation = getCaseDocumentation(mappedData, appealDetails);

	const caseCosts = !isChildAppeal(appealDetails) && getCaseCosts(mappedData);

	const caseContacts = getCaseContacts(mappedData);

	const caseTeam = !isChildAppeal(appealDetails) && getCaseTeam(mappedData);

	const caseManagement = getCaseManagement(mappedData);

	const caseHearing = getCaseHearing(mappedData, appealDetails, session);

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
		// @ts-ignore
		removeAccordionComponentsActions(accordionComponents);
	}

	/** @type {PageComponent} */
	return {
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
				...(caseCosts
					? [
							{
								heading: { text: 'Costs' },
								content: { html: '', pageComponents: [caseCosts] }
							}
					  ]
					: []),
				{
					heading: { text: 'Contacts' },
					content: { html: '', pageComponents: [caseContacts] }
				},
				...(caseTeam
					? [
							{
								heading: { text: 'Team' },
								content: { html: '', pageComponents: [caseTeam] }
							}
					  ]
					: []),
				{
					heading: { text: 'Case management' },
					content: { html: '', pageComponents: [caseManagement] }
				}
			]
		}
	};
}
