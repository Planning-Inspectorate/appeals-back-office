import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	mapRepresentationDocumentSummaryStatus,
	mapRepresentationDocumentSummaryActionLink
} from '#lib/representation-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantFinalComments = ({ appealDetails, currentRoute }) =>
	documentationFolderTableItem({
		id: 'appellant-final-comments',
		text: 'Appellant final comments',
		statusText: mapRepresentationDocumentSummaryStatus(
			appealDetails?.documentationSummary?.appellantFinalComments?.status,
			appealDetails?.documentationSummary?.appellantFinalComments?.representationStatus
		),
		receivedText: dateISOStringToDisplayDate(
			appealDetails?.documentationSummary?.appellantFinalComments?.receivedAt
		),
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.appellantFinalComments?.status,
			appealDetails?.documentationSummary?.appellantFinalComments?.representationStatus,
			'appellant-final-comments'
		)
	});
