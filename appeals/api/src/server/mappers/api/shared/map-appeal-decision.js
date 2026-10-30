import { getAvScanStatus } from '#endpoints/documents/documents.service.js';
import { isValidOutcome, isValidVirusCheckStatus } from '#utils/mapping/map-enums.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppealDecision} AppealDecision */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealDecision|undefined}
 */
export const mapAppealDecision = (data) => {
	const { appeal } = data;
	const decisionFolder = appeal.folders?.find(
		(f) =>
			f.path === `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	);

	const inspectorDecision = Array.isArray(appeal.inspectorDecision)
		? appeal.inspectorDecision[0]
		: appeal.inspectorDecision;

	if (decisionFolder) {
		if (inspectorDecision && isValidOutcome(inspectorDecision.outcome)) {
			const outcome = inspectorDecision.outcome;
			const decisionLetter = decisionFolder?.documents?.find(
				(d) => d.guid === inspectorDecision?.decisionLetterGuid
			);
			if (outcome) {
				if (decisionLetter?.latestDocumentVersion) {
					const avCheckStatus = getAvScanStatus(decisionLetter.latestDocumentVersion);
					if (isValidVirusCheckStatus(avCheckStatus)) {
						return {
							folderId: decisionFolder.id,
							path: decisionFolder.path,
							documentId: decisionLetter.guid,
							documentName: decisionLetter.name,
							letterDate:
								decisionLetter.latestDocumentVersion?.dateReceived?.toISOString() ??
								inspectorDecision.caseDecisionOutcomeDate?.toISOString(),
							virusCheckStatus: avCheckStatus,
							outcome
						};
					}
				} else {
					return {
						folderId: decisionFolder.id,
						path: decisionFolder.path,
						letterDate: inspectorDecision.caseDecisionOutcomeDate?.toISOString(),
						invalidReason: inspectorDecision.invalidDecisionReason,
						outcome
					};
				}
			}
		}

		return {
			folderId: decisionFolder.id,
			path: decisionFolder.path
		};
	}
};
