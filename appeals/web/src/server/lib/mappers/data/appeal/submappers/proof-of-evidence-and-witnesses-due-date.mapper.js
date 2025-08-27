import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapProofOfEvidenceAndWitnessesDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'proof-of-evidence-and-witnesses-due-date';

	if (
		!appealDetails.startedAt ||
		appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY
	) {
		return { id, display: {} };
	}

	const proofOfEvidenceAndWitnessesDueDate =
		appealDetails.appealTimetable?.proofOfEvidenceAndWitnessesDueDate;

	return textSummaryListItem({
		id,
		text: 'Proof of evidence and witness due',
		value: proofOfEvidenceAndWitnessesDueDate
			? dateISOStringToDisplayDate(proofOfEvidenceAndWitnessesDueDate)
			: 'Not provided',
		link: `${currentRoute}/timetable/edit`,
		editable:
			!isChildAppeal(appealDetails) &&
			userHasUpdateCasePermission &&
			Boolean(appealDetails.startedAt),
		classes: 'appeal-proof-of-evidence-and-witnesses-due-date'
	});
};
