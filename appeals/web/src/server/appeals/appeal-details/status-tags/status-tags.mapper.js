import { mapVirusCheckStatus } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { dateISOStringToDisplayDate, getOriginalAndLatestLetterDatesObject } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { APPEAL_CASE_STATUS, APPEAL_VIRUS_CHECK_STATUS } from '@planning-inspectorate/data-model';
import { getAppealTypesFromId } from '../change-appeal-type/change-appeal-type.service.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { mapDecisionOutcome } from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import config from '#environment/config.js';
import { generateDecisionDocumentDownloadHtml } from '#lib/mappers/data/appeal/common.js';
import { getInvalidStatusCreatedDate } from '../invalid-appeal/invalid-appeal.service.js';

/**
 * @param {{ appeal: MappedInstructions }} mappedData
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<PageComponent[]>}
 */
export const generateStatusTags = async (mappedData, appealDetails, request) => {
	/** @type {PageComponent[]} */
	const statusTags = [];

	if (mappedData.appeal.appealStatus.display?.statusTag) {
		statusTags.push({
			type: 'status-tag',
			parameters: {
				...mappedData.appeal.appealStatus.display.statusTag,
				classes: 'pins-status-tag--full-width'
			}
		});
	}

	if (config.featureFlags.featureFlagLinkedAppeals) {
		if (mappedData.appeal.leadOrChild.display?.statusTag) {
			statusTags.push({
				type: 'status-tag',
				parameters: {
					...mappedData.appeal.leadOrChild.display.statusTag
				}
			});
		}
	}

	const statusTagsComponentGroup = [];

	if (statusTags.length) {
		statusTagsComponentGroup.push({
			type: 'html',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				html: renderPageComponentsToHtml(statusTags)
			}
		});
	}

	const isAppealWithdrawn = appealDetails.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN;
	const isAppealInvalid = appealDetails.appealStatus === APPEAL_CASE_STATUS.INVALID;

	if (
		isAppealInvalid ||
		(isStatePassed(appealDetails, APPEAL_CASE_STATUS.AWAITING_EVENT) &&
			(appealDetails.decision.documentId ||
				appealDetails.costs.appellantDecisionFolder?.documents?.length ||
				appealDetails.costs.lpaDecisionFolder?.documents?.length))
	) {
		let letterDateObject = await getOriginalAndLatestLetterDatesObject(
			request.apiClient,
			appealDetails.appealId.toString(),
			appealDetails.decision.documentId || '',
			appealDetails
		);

		const insetTextRows = [];

		if (appealDetails.decision?.outcome) {
			insetTextRows.push(`Decision: ${mapDecisionOutcome(appealDetails.decision.outcome)}`);
			insetTextRows.push(
				letterDateObject.latestFileVersion &&
					letterDateObject.latestFileVersion?.version > 1 &&
					config.featureFlags.featureFlagReIssueDecision
					? `Decision issued on ${letterDateObject.originalLetterDate} (updated on ${letterDateObject.latestLetterDate})`
					: `Decision issued on ${letterDateObject.latestLetterDate}`
			);
		} else if (isAppealInvalid) {
			const invalidDate = await getInvalidStatusCreatedDate(
				request.apiClient,
				appealDetails.appealId
			);
			insetTextRows.push(
				`Marked as invalid on ${dateISOStringToDisplayDate(invalidDate.createdDate)}`
			);
			insetTextRows.push(getViewInvalidAppealLink(appealDetails.appealId));
		}

		const hasCostsAppellantDecision = Boolean(
			appealDetails.costs.appellantDecisionFolder?.documents?.length
		);
		const hasCostsLpaDecision = Boolean(appealDetails.costs.lpaDecisionFolder?.documents?.length);

		if (hasCostsAppellantDecision) {
			insetTextRows.push(`Appellant costs decision: Issued`);
		}

		if (hasCostsLpaDecision) {
			insetTextRows.push(`LPA costs decision: Issued`);
		}

		if (appealDetails.decision?.outcome || hasCostsAppellantDecision || hasCostsLpaDecision) {
			insetTextRows.push(
				config.featureFlags.featureFlagIssueDecision
					? getViewDecisionLink(appealDetails.appealId)
					: getViewDecisionLinkOld(appealDetails)
			);
		}

		const html =
			`<ul class="govuk-list">` + insetTextRows.map((row) => `<li>${row}</li>`).join('') + `</ul>`;

		statusTagsComponentGroup.push({
			type: 'inset-text',
			parameters: {
				html
			}
		});
	} else if (isAppealWithdrawn && appealDetails?.withdrawal?.withdrawalFolder?.documents?.length) {
		const withdrawalRequestDate =
			appealDetails.withdrawal?.withdrawalRequestDate &&
			dateISOStringToDisplayDate(appealDetails.withdrawal?.withdrawalRequestDate);

		const virusCheckStatus = mapVirusCheckStatus(
			appealDetails?.withdrawal.withdrawalFolder.documents[0].latestDocumentVersion
				.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
		);

		if (withdrawalRequestDate) {
			if (virusCheckStatus.checked && virusCheckStatus.safe) {
				statusTagsComponentGroup.push({
					type: 'inset-text',
					parameters: {
						html: `<p>Withdrawn: ${withdrawalRequestDate}</p>
								<p><a class="govuk-link" href="/appeals-service/appeal-details/${appealDetails.appealId}/withdrawal/view">View withdrawal request</a></p>`
					}
				});
			} else {
				statusTagsComponentGroup.push({
					type: 'inset-text',
					parameters: {
						html: `<p>Withdrawn: ${withdrawalRequestDate}</p>
								<p><span class="govuk-body">View withdrawal request</span>
								<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong></p>`
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
		const caseResubmissionDueDate = dateISOStringToDisplayDate(
			appealDetails.appealTimetable.caseResubmissionDueDate
		);

		if (appealTypeText) {
			statusTagsComponentGroup.push({
				type: 'inset-text',
				parameters: {
					html: `<p>This appeal needed to change to ${appealTypeText}</p><p>The appellant has until ${caseResubmissionDueDate} to resubmit.</p>`
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

	// @ts-ignore
	return statusTagsComponentGroup;
};

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @returns {string}
 */
const getViewDecisionLinkOld = (appealDetails) => {
	const decisionDownloadHtml = generateDecisionDocumentDownloadHtml(appealDetails, 'View decision');

	if (decisionDownloadHtml.includes('Virus')) {
		return `<span class="govuk-body">View decision </span>${decisionDownloadHtml}`;
	}

	return decisionDownloadHtml;
};

const getViewDecisionLink = (/** @type {number} */ appealId) =>
	`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/issue-decision/view-decision">View decision</a>`;

const getViewInvalidAppealLink = (/** @type {number} */ appealId) =>
	`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/invalid/view">View details</a>`;
