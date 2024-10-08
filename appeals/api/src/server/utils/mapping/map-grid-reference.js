import { pick } from 'lodash-es';

/**
 *
 * @param {import('@pins/appeals.api').Schema.GridReference | undefined} gridReference
 * @returns {{easting?: number | null, northing?: number | null}}
 */
export const mapGridReference = (gridReference) => {
	return pick(gridReference, ['easting', 'northing']);
};
