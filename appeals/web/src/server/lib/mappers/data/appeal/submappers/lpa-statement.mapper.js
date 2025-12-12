import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';
import { statementReceivedText, statementStatusText } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatement = ({ appealDetails, currentRoute, request }) => {
	const { status, representationStatus, isRedacted } =
		appealDetails.documentationSummary?.lpaStatement ?? {};

	const statusText = statementStatusText(appealDetails, status, representationStatus, isRedacted);

	const receivedText = statementReceivedText(
		appealDetails,
		appealDetails?.documentationSummary?.lpaStatement
	);

	return documentationFolderTableItem({
		id: 'lpa-statement',
		text: 'LPA statement',
		statusText,
		receivedText,
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.lpaStatement?.status,
			appealDetails?.documentationSummary?.lpaStatement?.representationStatus,
			'lpa-statement',
			request
		)
	});
};
