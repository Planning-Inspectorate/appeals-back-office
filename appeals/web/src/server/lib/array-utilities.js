import { isUndefined } from 'lodash-es';

/**
 * @template X
 * @param {X[] | X} x
 * @returns {X[]}
 * */
export const ensureArray = (x) => (isUndefined(x) ? [] : Array.isArray(x) ? x : [x]);
