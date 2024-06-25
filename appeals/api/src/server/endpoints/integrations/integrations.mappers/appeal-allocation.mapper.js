/** @typedef {import('@pins/appeals.api').Schema.AppealAllocation} AppealAllocation */
/** @typedef {import('@pins/appeals.api').Schema.AppealSpecialism} AppealSpecialism */

/**
 *
 * @param {AppealAllocation | null | undefined} allocation
 * @param {AppealSpecialism[]} specialisms
 * @returns
 */
export const mapAppealAllocationOut = (allocation, specialisms) =>
	allocation
		? {
				allocationLevel: allocation.level,
				allocationBand: allocation.band,
				caseSpecialisms: specialisms?.map((s) => s.specialism?.name) || []
		  }
		: {
				allocationLevel: null,
				allocationBand: null,
				caseSpecialisms: null
		  };
