/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppealSummary} AppealSummary */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import formatAddress from '#utils/format-address.js';
import { mapAgent } from './map-agent.js';
import { mapAppealType } from './map-appeal-type.js';
import { mapAppellant } from './map-appellant.js';
import { mapApplicationReference } from './map-application-reference.js';
import { mapLpa, mapLpaCode } from './map-lpa.js';
import { mapProcedureType } from './map-procedure-type.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealSummary}
 */
export const mapAppealSummary = (data) => {
	const { appeal } = data;

	return {
		appealId: appeal.id,
		appealReference: appeal.reference,
		planningApplicationReference: mapApplicationReference(data),
		localPlanningDepartment: mapLpa(data),
		procedureType: mapProcedureType(data),
		createdAt: appeal.caseCreatedDate.toISOString(),
		validAt: appeal.caseValidDate && appeal.caseValidDate.toISOString(),
		startedAt: appeal.caseStartedDate && appeal.caseStartedDate.toISOString(),
		appealSite: {
			addressId: appeal.address?.id,
			...formatAddress(appeal.address)
		},
		appealType: mapAppealType(data),
		agent: mapAgent(data),
		appellant: mapAppellant(data),
		lpaCode: mapLpaCode(data)
	};
};
