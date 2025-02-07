/**
 * @template T
 * @param {T[]} array
 * @param {(item: T) => boolean} predicate
 * @returns {number}
 * */
const count = (array, predicate) => array.reduce((sum, item) => sum + (predicate(item) ? 1 : 0), 0);

export default count;
