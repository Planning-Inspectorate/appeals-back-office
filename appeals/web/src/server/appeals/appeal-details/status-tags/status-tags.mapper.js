import { mapVirusCheckStatus } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { dateISOStringToDisplayDate, getTodaysISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { generateDecisionDocumentDownloadHtml } from '#lib/mappers/appeal/appeal.mapper.js';
import { APPEAL_CASE_STATUS, APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';
import { getAppealTypesFromId } from '../change-appeal-type/change-appeal-type.service.js';

/**
 * @param {{ appeal: MappedInstructions }} mappedData
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<PageComponent[]>}
 */
export const generateStatusTags = async (mappedData, appealDetails, request) => {
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

	const statusTagsComponentGroup = statusTag ? [statusTag] : [];

	if (leadOrChildTag) {
		statusTagsComponentGroup.push(leadOrChildTag);
	}

	const isAppealComplete = appealDetails.appealStatus === APPEAL_CASE_STATUS.COMPLETE;
	const isAppealWithdrawn = appealDetails.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN;
	if (isAppealComplete && statusTag && appealDetails.decision.documentId) {
		const letterDate = appealDetails.decision?.letterDate
			? dateISOStringToDisplayDate(appealDetails.decision.letterDate)
			: dateISOStringToDisplayDate(getTodaysISOString());

		const virusCheckStatus = mapVirusCheckStatus(
			appealDetails.decision.virusCheckStatus || APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED
		);

		statusTagsComponentGroup.push({
			type: 'inset-text',
			parameters: {
				html: `<p>Appeal completed: ${letterDate}</p>
						<p>Decision: ${appealDetails.decision?.outcome}</p>
						<p>${
							!(virusCheckStatus.checked && virusCheckStatus.safe)
								? '<span class="govuk-body">View decision letter</span> '
								: ''
						}${generateDecisionDocumentDownloadHtml(appealDetails, 'View decision letter')}</p>`
			}
		});
	} else if (
		isAppealWithdrawn &&
		statusTag &&
		appealDetails?.withdrawal?.withdrawalFolder?.documents?.length
	) {
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

	return statusTagsComponentGroup;
};