/**
 * @template X
 * @param {X[] | X} x
 * @returns {X[]}
 * */
export const ensureArray = (x) => (Array.isArray(x) ? x : [x]);
