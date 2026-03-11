import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { mapDocuments } from './map-folders-documents.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppealCancellation} AppealCancellation */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealCancellation|undefined}
 */
export const mapAppealCancellation = (data) => {
	const { appeal } = data;
	const cancellationFolder = appeal.folders?.find(
		(f) =>
			f.path ===
			`${APPEAL_CASE_STAGE.CANCELLATION}/${APPEAL_DOCUMENT_TYPE.LPA_ENFORCEMENT_NOTICE_WITHDRAWAL}`
	);

	if (cancellationFolder) {
		return {
			cancellationFolder: {
				folderId: cancellationFolder.id,
				path: cancellationFolder.path,
				documents: mapDocuments(
					(cancellationFolder.documents || []).filter((d) => d !== undefined)
				),
				caseId: appeal.id
			}
		};
	}
};
