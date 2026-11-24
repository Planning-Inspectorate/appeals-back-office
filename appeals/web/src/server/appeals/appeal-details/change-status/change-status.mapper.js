import { mapStatusFilterLabel, mapStatusText } from '#lib/appeal-status.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 * @param {WebAppeal} appealDetails
 * @param {string} backLinkUrl
 * @param {string|undefined} [selectedStatus]
 * @param {string|undefined} [errorMessage]
 * @returns {PageContent}
 */
export const changeStatusPage = (appealDetails, backLinkUrl, selectedStatus, errorMessage) => {
	const currentStatus = selectedStatus || appealDetails.appealStatus;
	const procedureType = appealDetails.procedureType;
	const appealType = appealDetails.appealType ?? undefined;

	const stages = [
		APPEAL_CASE_STATUS.READY_TO_START,
		APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
		APPEAL_CASE_STATUS.STATEMENTS,
		APPEAL_CASE_STATUS.FINAL_COMMENTS,
		APPEAL_CASE_STATUS.EVIDENCE,
		APPEAL_CASE_STATUS.EVENT,
		APPEAL_CASE_STATUS.AWAITING_EVENT,
		APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
		APPEAL_CASE_STATUS.COMPLETE
	];

	/** @type {RadioItem[]} */
	const radioItems = stages.map((stage) => {
		const mapped = mapStatusText(stage, appealType, procedureType);
		const label = mapStatusFilterLabel(mapped);
		return {
			value: stage,
			text: label,
			checked: currentStatus === stage
		};
	});

	const shortRef = appealShortReference(appealDetails.appealReference);

	return {
		title: 'Change appeal status',
		backLinkUrl,
		backLinkText: 'Back',
		preHeading: `Appeal ${shortRef}`,
		pageComponents: [
			radiosInput({
				name: 'status',
				idPrefix: 'status',
				legendText: 'Change',
				legendIsPageHeading: true,
				items: radioItems,
				errorMessage
			})
		]
	};
};
