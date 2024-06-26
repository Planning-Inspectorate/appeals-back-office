// @ts-nocheck

import {
	STATE_TARGET_CLOSED,
	STATE_TARGET_COMPLETE,
	STATE_TARGET_ISSUE_DETERMINATION,
	STATE_TARGET_LPA_QUESTIONNAIRE_DUE,
	STATE_TARGET_READY_TO_START,
	STATE_TARGET_TRANSFERRED,
	STATE_TARGET_WITHDRAWN
} from '#endpoints/constants.js';
import { STATUSES } from '@pins/appeals/constants/state.js';
import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';
import { mapDate } from './date.mapper.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealStatus} AppealStatus */

export const mapCaseDataOut = (data) => {
	return {
		...data
	};
};

/**
 *
 * @param {Appeal} appeal
 */
export const mapAppealDatesOut = (appeal) => {
	const dates = {
		caseCreatedDate: mapDate(appeal.caseCreatedDate),
		caseUpdatedDate: mapDate(appeal.caseUpdatedDate),
		caseValidDate: mapDate(appeal.caseValidDate),
		caseValidationDate: findStatusDate(appeal.appealStatus, STATE_TARGET_READY_TO_START),
		caseExtensionDate: mapDate(appeal.caseExtensionDate),
		caseStartedDate: mapDate(appeal.caseStartedDate),
		casePublishedDate: findStatusDate(appeal.appealStatus, STATE_TARGET_READY_TO_START),
		lpaQuestionnaireDueDate: mapDate(appeal.appealTimetable?.lpaQuestionnaireDueDate),
		lpaQuestionnairePublishedDate: findStatusDate(
			appeal.appealStatus,
			STATE_TARGET_ISSUE_DETERMINATION
		),
		lpaQuestionnaireValidationOutcomeDate: findStatusDate(
			appeal.appealStatus,
			STATE_TARGET_ISSUE_DETERMINATION
		),
		caseWithdrawnDate: findStatusDate(appeal.appealStatus, STATE_TARGET_WITHDRAWN),
		caseTransferredDate: findStatusDate(appeal.appealStatus, STATE_TARGET_TRANSFERRED),
		transferredCaseClosedDate: findStatusDate(appeal.appealStatus, STATE_TARGET_CLOSED),
		caseDecisionOutcomeDate: mapDate(appeal.inspectorDecision?.caseDecisionOutcomeDate),
		caseDecisionPublishedDate: null,
		caseCompletedDate: findStatusDate(appeal.appealStatus, STATE_TARGET_COMPLETE)
	};

	return dates;
};

/**
 *
 * @param {AppealStatus[]} appealStatuses
 * @param {string} status
 */
const findStatusDate = (appealStatuses, status) => {
	const appealStatus = appealStatuses.find((state) => state.status === status);
	if (appealStatus) {
		return appealStatus.createdAt?.toISOString();
	}

	return null;
};

/**
 *
 * @param {Appeal} appeal
 */
export const mapAppealStatusOut = (appeal) => {
	const status = appeal.appealStatus.find((status) => status.valid === true).status;
	if (status === STATE_TARGET_LPA_QUESTIONNAIRE_DUE) {
		return STATUSES.LPA_QUESTIONNAIRE;
	}
	return status;
};

/**
 *
 * @param {Appeal} appeal
 */
export const mapAppealValidationOut = (appeal) => {
	const validation = formatValidationOutcomeResponse(
		appeal.appellantCase?.appellantCaseValidationOutcome?.name || '',
		appeal.appellantCase?.appellantCaseIncompleteReasonsSelected,
		appeal.appellantCase?.appellantCaseInvalidReasonsSelected
	);

	const incompleteDetails = [];
	const invalidDetails = [];

	if (validation?.incompleteReasons?.length) {
		for (const incompleteReason of validation.incompleteReasons) {
			if (incompleteReason.text.length) {
				incompleteReason.text.map((text) =>
					incompleteDetails.push(`${incompleteReason.name.name}: ${text}`)
				);
			} else {
				incompleteDetails.push(incompleteReason.name.name);
			}
		}
	}
	if (validation?.invalidReasons?.length) {
		for (const invalidReason of validation.invalidReasons) {
			if (invalidReason.text.length) {
				invalidReason.text.map((text) =>
					invalidDetails.push(`${invalidReason.name.name}: ${text}`)
				);
			} else {
				invalidDetails.push(invalidReason.name.name);
			}
		}
	}

	return {
		caseValidationOutcome: validation?.outcome?.toLowerCase() || null,
		caseValidationInvalidDetails: invalidDetails.length > 0 ? invalidDetails : null,
		caseValidationIncompleteDetails: incompleteDetails.length > 0 ? incompleteDetails : null
	};
};

/**
 *
 * @param {Appeal} appeal
 */
export const mapQuestionnaireValidationOut = (appeal) => {
	const validation = formatValidationOutcomeResponse(
		appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name || '',
		appeal.lpaQuestionnaire?.lpaQuestionnaireIncompleteReasonsSelected
	);

	const incompleteDetails = [];

	if (validation?.incompleteReasons?.length) {
		for (const incompleteReason of validation.incompleteReasons) {
			if (incompleteReason.text.length) {
				incompleteReason.text.map((text) =>
					incompleteDetails.push(`${incompleteReason.name.name}: ${text}`)
				);
			} else {
				incompleteDetails.push(incompleteReason.name.name);
			}
		}
	}

	return {
		lpaQuestionnaireValidationOutcome: validation?.outcome?.toLowerCase() || null,
		lpaQuestionnaireValidationDetails: incompleteDetails.length > 0 ? incompleteDetails : null
	};
};

/**
 *
 * @param {Appeal} appeal
 */
export const mapAppealRelationships = (appeal) => {
	const { linkedAppeals, relatedAppeals } = appeal;

	let linkedCaseStatus = null;
	let leadCaseReference = null;
	if (linkedAppeals && linkedAppeals.length) {
		const lead = linkedAppeals.find((_) => _.parentId === appeal.id);
		if (lead) {
			linkedCaseStatus = 'lead';
			leadCaseReference = appeal.reference;
		} else {
			const child = linkedAppeals.find((_) => _.childId === appeal.id);
			if (child) {
				linkedCaseStatus = 'child';
				leadCaseReference = child.parentRef;
			}
		}
	}

	const nearbyCaseReferences = relatedAppeals.map((a) =>
		a.parentRef === appeal.reference ? a.childRef : a.parentRef
	);

	return {
		linkedCaseStatus,
		leadCaseReference,
		nearbyCaseReferences
	};
};
