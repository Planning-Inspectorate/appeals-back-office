import { documentationFolderTableItem } from '#lib/mappers/index.js';
import {
	mapAddRepresentationSummaryActionLink,
	mapRepresentationDocumentSummaryActionLink
} from '#lib/representation-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { capitalize } from 'lodash-es';
import { proofsReceivedText, proofsStatusText } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLPAProofOfEvidence = ({ appealDetails, currentRoute, request }) => {
	const id = 'lpa-proofs-evidence';
	if (appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY) {
		return { id, display: {} };
	}

	const { status, receivedAt, representationStatus } =
		appealDetails.documentationSummary?.lpaProofOfEvidence ?? {};

	const statusText = proofsStatusText(status, representationStatus);

	const receivedText = proofsReceivedText(statusText, receivedAt);

	return documentationFolderTableItem({
		id,
		text: 'LPA proof of evidence and witness',
		statusText: capitalize(statusText),
		receivedText,
		actionHtml:
			statusText !== 'Awaiting proof of evidence and witness'
				? mapRepresentationDocumentSummaryActionLink(
						currentRoute,
						status || undefined,
						representationStatus,
						'lpa-proofs-evidence',
						request
				  )
				: mapAddRepresentationSummaryActionLink(currentRoute, 'lpa-proofs-evidence', request)
	});
};
