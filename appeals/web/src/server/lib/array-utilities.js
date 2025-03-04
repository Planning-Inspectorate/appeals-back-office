import { isUndefined } from 'lodash-es';

/**
 * @template X
 * @param {X[] | X} x
 * @returns {X[]}
 * */
export const ensureArray = (x) => (isUndefined(x) ? [] : Array.isArray(x) ? x : [x]);

/**
 * @param {any[]} workArray
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {any[]}
 * */
export const moveItemInArray = (workArray, fromIndex, toIndex) => {
	if (toIndex === fromIndex) {
		return workArray;
	}
	const target = workArray[fromIndex];
	const increment = toIndex < fromIndex ? -1 : 1;

	for (let k = fromIndex; k !== toIndex; k += increment) {
		workArray[k] = workArray[k + increment];
	}
	workArray[toIndex] = target;
	return workArray;
};
