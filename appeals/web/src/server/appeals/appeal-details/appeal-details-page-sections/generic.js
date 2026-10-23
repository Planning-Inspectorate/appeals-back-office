import { permissionNames } from '#environment/permissions.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { getCaseContacts } from './common/case-contacts.js';
import { getCaseManagement } from './common/case-management.js';
import { getCaseOverview } from './common/case-overview.js';
import { getCaseTeam } from './common/case-team.js';
import { getSiteDetails } from './common/site-details.js';
import { getCaseHearing } from './s78/case-hearing.js';
import { getCaseInquiry } from './s78/case-inquiry.js';
import { removeAppealDetailsSectionComponentsActions } from './utils/index.js';

/**
 * // TODO: update once case type letters and schema are provided by ODW
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @returns {PageComponent[]}
 */
export function generateAppealDetailsPageComponents(appealDetails, mappedData, session) {
	const caseOverview = getCaseOverview(mappedData, appealDetails);

	const siteDetailsShouldBeHidden =
		isChildAppeal(appealDetails) ||
		!isStatePassed(appealDetails, APPEAL_CASE_STATUS.READY_TO_START);

	const siteDetails = siteDetailsShouldBeHidden ? [] : getSiteDetails(mappedData, appealDetails);

	/** @type {PageComponent[]} */
	const caseTimetable = [
		{
			type: 'summary-list',
			parameters: {
				classes: 'appeal-case-timetable',
				rows: [
					mappedData.appeal.appealSubmittedDate?.display?.summaryListItem,
					mappedData.appeal.validAt?.display?.summaryListItem,
					mappedData.appeal.startedAt?.display?.summaryListItem,
					...(appealDetails.startedAt
						? [
								mappedData.appeal.lpaQuestionnaireDueDate?.display?.summaryListItem,
								mappedData.appeal.lpaStatementDueDate?.display?.summaryListItem,
								mappedData.appeal.ipCommentsDueDate?.display?.summaryListItem,
								mappedData.appeal.finalCommentDueDate?.display?.summaryListItem,
								mappedData.appeal.statementOfCommonGroundDueDate?.display?.summaryListItem,
								mappedData.appeal.planningObligationDueDate?.display?.summaryListItem,
								mappedData.appeal.proofOfEvidenceAndWitnessesDueDate?.display?.summaryListItem,
								mappedData.appeal.caseManagementConferenceDueDate?.display?.summaryListItem,
								mappedData.appeal.hearingDate?.display?.summaryListItem,
								mappedData.appeal.inquiryDate?.display?.summaryListItem
							]
						: [])
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
				{ text: 'Date' },
				{ text: 'Action', classes: 'govuk-!-text-align-right' }
			],
			rows: [mappedData.appeal.appellantCase?.display?.tableItem].filter(isDefined),
			firstCellIsHeader: true,
			attributes: {
				id: 'case-documentation-table'
			}
		},
		wrapperHtml: {
			opening: '<h2 class="govuk-heading-l">Documentation</h2>',
			closing: '',
			id: 'case-documentation'
		}
	};

	const caseContacts = getCaseContacts(mappedData);

	const caseTeam = !isChildAppeal(appealDetails) && getCaseTeam(mappedData);

	const caseManagement = getCaseManagement(mappedData);

	const caseHearing =
		!isChildAppeal(appealDetails) && getCaseHearing(mappedData, appealDetails, session);

	const caseInquiry =
		!isChildAppeal(appealDetails) && getCaseInquiry(mappedData, appealDetails, session);

	const pageComponents = [
		caseOverview,
		...(siteDetails ?? []),
		caseTimetable[0],
		...(caseHearing ? [caseHearing] : []),
		...(caseInquiry ? [caseInquiry] : []),
		caseDocumentation,
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
