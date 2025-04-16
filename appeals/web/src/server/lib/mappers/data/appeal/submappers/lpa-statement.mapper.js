import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	mapLPARepresentationDocumentSummaryStatus,
	mapRepresentationDocumentSummaryActionLink
} from '#lib/representation-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatement = ({ appealDetails, currentRoute }) =>
	documentationFolderTableItem({
		id: 'lpa-statement',
		text: 'LPA statement',
		statusText: mapLPARepresentationDocumentSummaryStatus(
			appealDetails?.documentationSummary?.lpaStatement?.status,
			appealDetails?.documentationSummary?.lpaStatement?.representationStatus
		),
		receivedText:
			dateISOStringToDisplayDate(
				appealDetails?.documentationSummary?.lpaStatement?.receivedAt instanceof Date
					? appealDetails?.documentationSummary?.lpaStatement?.receivedAt.toDateString()
					: appealDetails?.documentationSummary?.lpaStatement?.receivedAt
			) || 'Not Applicable',
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.lpaStatement?.status,
			appealDetails?.documentationSummary?.lpaStatement?.representationStatus,
			'lpa-statement'
		)
	});
