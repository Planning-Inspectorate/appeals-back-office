import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { mapDocuments } from './map-folders-documents.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppealWithdrawal} AppealWithdrawal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealWithdrawal|undefined}
 */
export const mapAppealWithdrawal = (data) => {
	const { appeal } = data;
	const withdrawalFolder = appeal.folders?.find(
		(f) =>
			f.path ===
			`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.APPELLANT_CASE_WITHDRAWAL_LETTER}`
	);

	if (withdrawalFolder) {
		return {
			withdrawalFolder: {
				folderId: withdrawalFolder.id,
				path: withdrawalFolder.path,
				documents: mapDocuments((withdrawalFolder.documents || []).filter((d) => d !== undefined)),
				caseId: appeal.id
			},
			...(appeal.withdrawalRequestDate && {
				withdrawalRequestDate: appeal.withdrawalRequestDate.toISOString()
			})
		};
	}
};
