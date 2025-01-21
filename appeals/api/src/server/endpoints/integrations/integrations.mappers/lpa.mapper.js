/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 *
 * @param {*} casedata
 * @returns
 */
export const mapLpaIn = (casedata) => {
	return {
		lpaCode: casedata.lpaCode
	};
};
