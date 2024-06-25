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

/**
 *
 * @param {Appeal} appeal
 * @returns
 */
export const mapLpaOut = (appeal) => {
	return {
		lpaCode: appeal.lpa?.lpaCode
	};
};
