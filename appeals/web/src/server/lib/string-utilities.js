import { escape } from 'lodash-es';

/**
 * @param {string} name
 * @returns {string}
 */
export const formatFirstInitialLastName = (name) => {
	if (!name || typeof name !== 'string') return '';
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '';
	const firstInitial = parts[0].charAt(0).toUpperCase();
	const lastNameRaw = parts.length > 1 ? parts[parts.length - 1] : parts[0];
	const lastName = lastNameRaw.charAt(0).toUpperCase() + lastNameRaw.slice(1).toLowerCase();
	return `${firstInitial}. ${lastName}`;
};

/**
 * @param {string} str
 * @returns {boolean}
 */
export const stringContainsDigitsOnly = (str) => Boolean(str.trim().match(/^\d+$/));

/**
 * Pad a number with leading zeros
 *
 * @param {number | string} num
 * @param {number} [length]
 * @returns {string}
 */
export const padNumberWithZero = (num, length = 2) => num.toString().padStart(length, '0');

/**
 * replaces new line chars with a <br>
 * @param {string} [value]
 * @returns {string}
 */
export const newLine2LineBreak = (value) => {
	if (!value) return '';

	return escape(value).replace(/\r\n|\n/g, '<br>');
};
