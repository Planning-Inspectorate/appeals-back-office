import { randomUUID } from 'node:crypto';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealHASCase} AppealHASCase */
/**
 *
 * @param {MappingRequest} data
 * @returns {AppealHASCase}
 */
export const mapCaseSummary = (data) => {
	const { appeal } = data;
	return {
		submissionId: appeal.submissionId ?? randomUUID(),
		// @ts-ignore
		caseProcedure: appeal.procedureType?.key || 'written',
		caseId: appeal.id,
		caseReference: appeal.reference,
		// @ts-ignore
		applicationReference: appeal.applicationReference,
		// @ts-ignore
		lpaCode: appeal.lpa?.lpaCode
	};
};
