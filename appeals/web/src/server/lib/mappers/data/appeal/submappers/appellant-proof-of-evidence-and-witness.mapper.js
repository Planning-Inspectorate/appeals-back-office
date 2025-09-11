import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import {
	mapAddRepresentationSummaryActionLink,
	mapRepresentationDocumentSummaryActionLink
} from '#lib/representation-utilities.js';
import { APPEAL_PROOF_OF_EVIDENCE_STATUS } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { capitalize } from 'lodash-es';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantProofOfEvidence = ({ appealDetails, currentRoute, request }) => {
	const id = 'appellant-proofs-evidence';
	if (appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY) {
		return { id, display: {} };
	}

	const { status, receivedAt } = appealDetails.documentationSummary?.appellantProofOfEvidence ?? {};

	const statusText =
		status && status.toLowerCase() === APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED
			? APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED
			: 'Awaiting proof of evidence and witness';

	const receivedText =
		statusText === APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED
			? dateISOStringToDisplayDate(receivedAt)
			: '';

	return documentationFolderTableItem({
		id,
		text: 'Appellant proof of evidence and witness',
		statusText: capitalize(statusText),
		receivedText,
		actionHtml:
			statusText === APPEAL_PROOF_OF_EVIDENCE_STATUS.RECEIVED
				? mapRepresentationDocumentSummaryActionLink(
						currentRoute,
						appealDetails?.documentationSummary?.appellantProofOfEvidence?.status || undefined,
						appealDetails?.documentationSummary?.appellantProofOfEvidence?.representationStatus,
						'appellant-proofs-evidence',
						request
				  )
				: mapAddRepresentationSummaryActionLink(currentRoute, 'appellant-proofs-evidence', request)
	});
};
