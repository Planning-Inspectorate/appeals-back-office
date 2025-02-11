import listStates from '#state/list-states.js';

/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/** @typedef {import('@pins/appeals.api').Appeals.StateStub} StateStub */

/**
 *
 * @param {MappingRequest} data
 * @returns {StateStub[]}
 */
export function mapStateList(data) {
	const { appealType, appealStatus } = data.appeal;

	const status = appealStatus?.[0]?.status;
	if (!appealType || !status) {
		return [];
	}

	return listStates(appealType, status);
}
