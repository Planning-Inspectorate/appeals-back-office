import { BYTES_IN_KB, BYTES_IN_MB } from '@pins/appeals/constants/distance.js';

/**
 * Register the fileSize filter
 *
 * @param {number} sizesInBytes
 * @returns {string}
 */
export const fileSize = (sizesInBytes) => {
	const unit = sizesInBytes > BYTES_IN_MB ? 'MB' : 'KB';
	const power = sizesInBytes > BYTES_IN_MB ? BYTES_IN_MB : BYTES_IN_KB;

	return `${Math.round(sizesInBytes / power)} ${unit}`;
};
