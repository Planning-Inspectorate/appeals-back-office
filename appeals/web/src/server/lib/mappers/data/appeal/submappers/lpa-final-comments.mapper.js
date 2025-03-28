import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	mapRepresentationDocumentSummaryStatus,
	mapRepresentationDocumentSummaryActionLink
} from '#lib/representation-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLPAFinalComments = ({ appealDetails, currentRoute }) =>
	documentationFolderTableItem({
		id: 'lpa-final-comments',
		text: 'LPA final comments',
		statusText: mapRepresentationDocumentSummaryStatus(
			appealDetails?.documentationSummary?.lpaFinalComments?.status,
			appealDetails?.documentationSummary?.lpaFinalComments?.representationStatus
		),
		receivedText:
			dateISOStringToDisplayDate(
				appealDetails?.documentationSummary?.lpaFinalComments?.receivedAt
			) || 'Not applicable',
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.lpaFinalComments?.status,
			appealDetails?.documentationSummary?.lpaFinalComments?.representationStatus,
			'lpa-final-comments'
		)
	});
