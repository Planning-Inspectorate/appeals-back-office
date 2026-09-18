/**
 * Normalise a date-like value to a timestamp, or null when absent.
 * Allows nullish values and differing date formats to be compared safely.
 *
 * @param {Date | string | number | null | undefined} value
 * @returns {number | null}
 */
export const toTime = (value) => (value == null ? null : new Date(value).getTime());
