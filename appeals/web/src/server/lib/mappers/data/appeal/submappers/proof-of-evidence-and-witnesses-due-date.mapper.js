import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { mapDueDateSummaryListItem } from './utils/due-date-mapper-helper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapProofOfEvidenceAndWitnessesDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'proof-of-evidence-and-witnesses-due-date';

	const isGeneric = isGenericAppealType(appealDetails.appealType);

	if (
		!appealDetails.startedAt ||
		(!isGeneric && appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY)
	) {
		return { id, display: {} };
	}

	return mapDueDateSummaryListItem({
		id,
		text: 'Proof of evidence and witness due',
		dueDate: appealDetails.appealTimetable?.proofOfEvidenceAndWitnessesDueDate,
		appealDetails,
		currentRoute,
		userHasUpdateCasePermission,
		classes: 'appeal-proof-of-evidence-and-witnesses-due-date'
	});
};
