import listStates from '#state/list-states.js';
import { currentStatus } from '#utils/current-status.js';

/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef {import('@pins/appeals.api').Appeals.StateStub} StateStub */

/**
 *
 * @param {MappingRequest} data
 * @returns {StateStub[]}
 */
export function mapStateList(data) {
	const { appealType, procedureType } = data.appeal;

	const status = currentStatus(data.appeal);
	if (!appealType || !status) {
		return [];
	}

	return listStates(appealType, procedureType ?? null, status);
}
