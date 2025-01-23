/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 *
 * @param {{lpaCode: string}} casedata
 * @returns {{lpaCode: string}}
 */
export const mapLpaIn = (casedata) => {
	return {
		lpaCode: casedata.lpaCode
	};
};
