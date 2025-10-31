import { getCaseDocumentation } from '#appeals/appeal-details/appeal-details-page-sections/common/case-documentation.js';
import config from '#environment/config.js';
import { permissionNames } from '#environment/permissions.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { getCaseContacts } from './common/case-contacts.js';
import { getCaseCosts } from './common/case-costs.js';
import { getCaseManagement } from './common/case-management.js';
import { getCaseOverview } from './common/case-overview.js';
import { getCaseTeam } from './common/case-team.js';
import { getSiteDetails as getSiteDetailsLegacy } from './common/site-details-legacy.js';
import { getSiteDetails } from './common/site-details.js';
import { getCaseHearing } from './s78/case-hearing.js';
import { getCaseInquiry } from './s78/case-inquiry.js';
import { removeAppealDetailsSectionComponentsActions } from './utils/index.js';

/**
 *
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {*}
 */
export function generateAppealDetailsPageComponents(appealDetails, mappedData, session) {
	const caseOverview = getCaseOverview(mappedData, appealDetails);

	const siteDetailsShouldBeHidden =
		isChildAppeal(appealDetails) ||
		!isStatePassed(appealDetails, APPEAL_CASE_STATUS.READY_TO_START) ||
		(appealDetails.appealType === APPEAL_TYPE.S78 &&
			appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.WRITTEN);

	const siteDetails = siteDetailsShouldBeHidden
		? []
		: config.featureFlags.featureFlagCancelSiteVisit
		? getSiteDetails(mappedData, appealDetails)
		: getSiteDetailsLegacy(mappedData, appealDetails);
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
			},
			wrapperHtml: {
				opening: '<h2 class="govuk-heading-l">Timetable</h1>',
				closing: ''
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

	const pageComponents = [
		caseOverview,
		...(siteDetails ?? []),
		caseTimetable[0],
		...(caseHearing ?? []),
		...(caseInquiry ?? []),
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
