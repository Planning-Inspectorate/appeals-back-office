import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import {
	DOCUMENT_STATUS_RECEIVED
	// @ts-ignore
} from '@pins/appeals/constants/support.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { mapDueDateSummaryListItem } from './utils/due-date-mapper-helper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaQuestionnaireDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'lpa-questionnaire-due-date';
	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}
	const isGeneric = isGenericAppealType(appealDetails.appealType);
	let editable =
		!isChildAppeal(appealDetails) && Boolean(userHasUpdateCasePermission && appealDetails.validAt);
	const lpaQuestionnaireStatus = appealDetails.documentationSummary.lpaQuestionnaire?.status;

	if (isGeneric) {
		editable =
			!isChildAppeal(appealDetails) &&
			Boolean(userHasUpdateCasePermission) &&
			appealDetails.appealStatus !== APPEAL_CASE_STATUS.COMPLETE;
	} else if (
		(lpaQuestionnaireStatus && lpaQuestionnaireStatus === DOCUMENT_STATUS_RECEIVED) ||
		appealDetails.appealStatus !== APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
	) {
		editable = false;
	}

	return mapDueDateSummaryListItem({
		id,
		text: 'LPA questionnaire due',
		dueDate: appealDetails.appealTimetable?.lpaQuestionnaireDueDate,
		appealDetails,
		currentRoute,
		editable,
		classes: 'appeal-lpa-questionnaire-due-date'
	});
};
