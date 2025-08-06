import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { APPEAL_PROOF_OF_EVIDENCE_STATUS } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLPAProofOfEvidence = ({ appealDetails, currentRoute, request }) => {
	const id = 'lpa-proofs-evidence';
	if (appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY) {
		return { id, display: {} };
	}

	const statusText =
		appealDetails.documentationSummary?.lpaProofOfEvidence?.representationStatus?.toLowerCase() ===
		APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED.toLowerCase()
			? APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED
			: APPEAL_PROOF_OF_EVIDENCE_STATUS.AWAITING;

	const { receivedAt } = appealDetails.documentationSummary?.lpaProofOfEvidence ?? {};

	const receivedText = statusText === 'Received' ? dateISOStringToDisplayDate(receivedAt) : '';

	return documentationFolderTableItem({
		id,
		text: 'LPA proof of evidence and witness',
		statusText,
		receivedText,
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.lpaProofOfEvidence?.representationStatus || undefined,
			appealDetails?.documentationSummary?.lpaProofOfEvidence?.representationStatus,
			'lpa-proofs-evidence',
			request
		)
	});
};
