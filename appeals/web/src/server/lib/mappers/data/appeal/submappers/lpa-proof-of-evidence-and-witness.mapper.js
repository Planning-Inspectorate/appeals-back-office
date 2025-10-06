import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import {
	mapAddRepresentationSummaryActionLink,
	mapRepresentationDocumentSummaryActionLink
} from '#lib/representation-utilities.js';
import {
	APPEAL_PROOF_OF_EVIDENCE_STATUS,
	APPEAL_REPRESENTATION_STATUS
} from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { capitalize } from 'lodash-es';

/** @type {import('../mapper.js').SubMapper} */
export const mapLPAProofOfEvidence = ({ appealDetails, currentRoute, request }) => {
	const id = 'lpa-proofs-evidence';
	if (appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY) {
		return { id, display: {} };
	}

	const { status, receivedAt, representationStatus } =
		appealDetails.documentationSummary?.lpaProofOfEvidence ?? {};

	let statusText;

	if (representationStatus?.toLowerCase() === APPEAL_REPRESENTATION_STATUS.VALID) {
		statusText = 'Completed';
	} else if (representationStatus?.toLowerCase() === APPEAL_REPRESENTATION_STATUS.INCOMPLETE) {
		statusText = 'Incomplete';
	} else {
		statusText =
			status && status.toLowerCase() === APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED
				? APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED
				: 'Awaiting proof of evidence and witness';
	}

	const receivedText =
		statusText !== 'Awaiting proof of evidence and witness'
			? dateISOStringToDisplayDate(receivedAt)
			: '';

	return documentationFolderTableItem({
		id,
		text: 'LPA proof of evidence and witness',
		statusText: capitalize(statusText),
		receivedText,
		actionHtml:
			statusText !== 'Awaiting proof of evidence and witness'
				? mapRepresentationDocumentSummaryActionLink(
						currentRoute,
						appealDetails?.documentationSummary?.lpaProofOfEvidence?.status || undefined,
						appealDetails?.documentationSummary?.lpaProofOfEvidence?.representationStatus,
						'lpa-proofs-evidence',
						request
				  )
				: mapAddRepresentationSummaryActionLink(currentRoute, 'lpa-proofs-evidence', request)
	});
};
