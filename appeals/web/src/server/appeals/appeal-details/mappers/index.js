import logger from '../../../lib/logger.js';
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

import { getAppealTypesFromId } from '#appeals/appeal-details/sections/change-appeal-type/change-appeal-type.service.js';
import { APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { isFeatureActive } from '#common/feature-flags.js';
import { generateAccordion as generateHasAccordion } from './has.js';
import { generateAccordion as generateS78Accordion } from './s78.js';

export const pageHeading = 'Case details';

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} currentRoute
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<PageContent>}
 */
export async function appealDetailsPage(appealDetails, currentRoute, session, request) {
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
	let appealDetailsAccordion = generateAccordion(appealDetails, mappedData, session);

	const notificationBanners = buildNotificationBanners(
		session,
		'appealDetails',
		appealDetails.appealId
	);

	const statusTagsComponentGroup = statusTag ? [statusTag] : [];

	if (leadOrChildTag) {
		statusTagsComponentGroup.push(leadOrChildTag);
	}

	const isAppealComplete = appealDetails.appealStatus === APPEAL_CASE_STATUS.COMPLETE;
	const isAppealWithdrawn = appealDetails.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN;
	if (isAppealComplete && statusTag && appealDetails.decision.documentId) {
		const letterDate = appealDetails.decision?.letterDate
			? new Date(appealDetails.decision.letterDate)
			: new Date();

		const virusCheckStatus = mapVirusCheckStatus(
			appealDetails.decision.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
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
	} else if (
		isAppealWithdrawn &&
		statusTag &&
		appealDetails?.withdrawal?.withdrawalFolder?.documents?.length
	) {
		const withdrawalRequestDate =
			appealDetails.withdrawal?.withdrawalRequestDate &&
			new Date(appealDetails.withdrawal?.withdrawalRequestDate);

		const virusCheckStatus = mapVirusCheckStatus(
			appealDetails?.withdrawal.withdrawalFolder.documents[0].latestDocumentVersion
				.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
		);

		if (withdrawalRequestDate) {
			if (virusCheckStatus.checked && virusCheckStatus.safe) {
				statusTagsComponentGroup.push({
					type: 'inset-text',
					parameters: {
						html: `<p>
							Withdrawn: ${withdrawalRequestDate.toLocaleDateString('en-gb', {
								day: 'numeric',
								month: 'long',
								year: 'numeric'
							})}
								</p>
								<p><a class="govuk-link" href="/appeals-service/appeal-details/${
									appealDetails.appealId
								}/withdrawal/view">View withdrawal request</a></p>`
					}
				});
			} else {
				statusTagsComponentGroup.push({
					type: 'inset-text',
					parameters: {
						html: `<p>
							Withdrawn: ${withdrawalRequestDate.toLocaleDateString('en-gb', {
								day: 'numeric',
								month: 'long',
								year: 'numeric'
							})}
								</p>
								<p><span class="govuk-body">View withdrawal request</span>
								<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong></p>`
					}
				});
			}
		}
	} else if (
		appealDetails.appealStatus === APPEAL_CASE_STATUS.CLOSED &&
		appealDetails.resubmitTypeId &&
		appealDetails.appealTimetable?.caseResubmissionDueDate
	) {
		const appealTypesFromId = await getAppealTypesFromId(request.apiClient, appealDetails.appealId);
		const appealTypeById = appealTypesFromId?.find(
			(appealType) => appealType.id === appealDetails.resubmitTypeId
		);
		const appealTypeText =
			appealTypeById?.key && appealTypeById?.type
				? `${appealTypeById.type} (${appealTypeById.key})`
				: '';
		const caseResubmissionDueDate = new Date(appealDetails.appealTimetable.caseResubmissionDueDate);

		if (appealTypeText) {
			statusTagsComponentGroup.push({
				type: 'inset-text',
				parameters: {
					html: `<p>This appeal needed to change to ${appealTypeText}</p><p>The appellant has until ${caseResubmissionDueDate.toLocaleDateString(
						'en-gb',
						{
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						}
					)} to resubmit.</p>`
				}
			});
		}
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
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {PageComponent}
 */
function generateAccordion(appealDetails, mappedData, session) {
	switch (appealDetails.appealType) {
		case APPEAL_TYPE.D:
			return generateHasAccordion(appealDetails, mappedData, session);
		case APPEAL_TYPE.W:
			if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
				return generateS78Accordion(appealDetails, mappedData, session);
			} else {
				throw new Error('Feature flag inactive for S78');
			}
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}
