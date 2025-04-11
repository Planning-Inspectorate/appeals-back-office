import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
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
			appealDetails?.documentationSummary?.appellantFinalComments?.representationStatus,
			APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
		),
		receivedText:
			dateISOStringToDisplayDate(
				appealDetails?.documentationSummary?.appellantFinalComments?.receivedAt
			) || 'Not applicable',
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.appellantFinalComments?.status,
			appealDetails?.documentationSummary?.appellantFinalComments?.representationStatus,
			'appellant-final-comments'
		)
	});
