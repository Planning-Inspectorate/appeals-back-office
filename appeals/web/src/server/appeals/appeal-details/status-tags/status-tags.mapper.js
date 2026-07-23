import { mapVirusCheckStatus } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { dateISOStringToDisplayDate, getOriginalAndLatestLetterDatesObject } from '#lib/dates.js';
import { isLinkedAppealsActive } from '#lib/mappers/utils/is-linked-appeal.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { decisionOutcomeToDisplayText } from '@pins/appeals/utils/decision-outcome-display-text.js';
import { APPEAL_CASE_STATUS, APPEAL_VIRUS_CHECK_STATUS } from '@planning-inspectorate/data-model';

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
				classes: 'pins-status-tag--full-width govuk-!-margin-bottom-6'
			}
		});
	}

	if (isLinkedAppealsActive()) {
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
		((isStatePassed(appealDetails, APPEAL_CASE_STATUS.AWAITING_EVENT) ||
			appealDetails.appealStatus === APPEAL_CASE_STATUS.COMPLETE) &&
			(appealDetails.decision?.outcome ||
				appealDetails.costs.appellantDecisionFolder?.documents?.length ||
				appealDetails.costs.lpaDecisionFolder?.documents?.length))
	) {
		let letterDateObject = await getOriginalAndLatestLetterDatesObject(
			request.apiClient,
			appealDetails.decision.documentId || '',
			appealDetails
		);

		const insetTextRows = [];

		if (appealDetails.decision?.outcome) {
			insetTextRows.push(
				`Decision: ${decisionOutcomeToDisplayText(appealDetails.decision.outcome, appealDetails.appealType)}`
			);
			insetTextRows.push(
				letterDateObject.latestFileVersion && letterDateObject.latestFileVersion?.version > 1
					? `Decision issued on ${letterDateObject.originalLetterDate} (reissued on ${letterDateObject.latestLetterDate})`
					: `Decision issued on ${letterDateObject.latestLetterDate}`
			);
		} else if (isAppealInvalid) {
			// @ts-ignore
			const invalidStatusObj = appealDetails.appealStatusHistory?.find(
				(/** @type {any} */ s) => s.status === 'invalid'
			);
			const invalidDate = invalidStatusObj?.createdAt;
			if (invalidDate) {
				insetTextRows.push(`Marked as invalid on ${dateISOStringToDisplayDate(invalidDate)}`);
			}
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
			insetTextRows.push(getViewDecisionLink(appealDetails.appealId, request));
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
		// @ts-ignore
		const resubmitType = appealDetails.resubmitType;
		const appealTypeText =
			resubmitType?.key && resubmitType?.type ? `${resubmitType.type} (${resubmitType.key})` : '';
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

	// @ts-ignore
	return statusTagsComponentGroup;
};

/**
 *
 * @param {string|number} appealId
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {string}
 */
const getViewDecisionLink = (appealId, request) => {
	const viewDecisionUrl = addBackLinkQueryToUrl(
		request,
		`/appeals-service/appeal-details/${appealId}/issue-decision/view-decision`
	);
	return `<a class="govuk-link" href="${viewDecisionUrl}">View decision</a>`;
};

const getViewInvalidAppealLink = (/** @type {number} */ appealId) =>
	`<a class="govuk-link" href="/appeals-service/appeal-details/${appealId}/invalid/view">View details</a>`;
