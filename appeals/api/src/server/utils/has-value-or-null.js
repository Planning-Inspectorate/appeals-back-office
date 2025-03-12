/**
 * @param {string | number | null} [value]
 * @returns {boolean}
 */
export const hasValueOrIsNull = (value) => Boolean(value) || value === null;
