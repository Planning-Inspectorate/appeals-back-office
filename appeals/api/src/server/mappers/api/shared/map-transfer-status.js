/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.TransferStatus} TransferStatus */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {TransferStatus|undefined}
 */
export const mapTransferStatus = (data) => {
	const { appeal, appealTypes } = data;

	if (appealTypes && appeal.caseResubmittedTypeId && appeal.caseTransferredId) {
		const resubmitType = appealTypes.find((type) => type.id === appeal.caseResubmittedTypeId);
		if (resubmitType) {
			return {
				transferredAppealType: `(${resubmitType.key}) ${resubmitType.type}`,
				transferredAppealReference: appeal.caseTransferredId
			};
		}
	}
};
