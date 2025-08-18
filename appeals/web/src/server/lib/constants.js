export const SHOW_MORE_MAXIMUM_CHARACTERS_BEFORE_HIDING = 300;
export const SHOW_MORE_MAXIMUM_ROWS_BEFORE_HIDING = 3;

/**
 * @type {string[]}
 */
export const MONTH_LIST = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];

/**
 * @type {Record<string, string>}
 */
export const MONTH_SET = MONTH_LIST.reduce(
	/** @param {Record<string, string>} acc
	 * @param month
	 * @param {number} index
	 * */
	(acc, month, index) => {
		acc[month] = '' + (index + 1);
		acc[month.slice(0, 3)] = '' + (index + 1);
		return acc;
	},
	{}
);
