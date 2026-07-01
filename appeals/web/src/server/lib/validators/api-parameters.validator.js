/**
 * Validators used to guard user-provided values (typically route/path parameters
 * such as `appealId`, `lpaQuestionnaireId`, `documentId`, etc.) before they are
 * interpolated into a URL and sent to the back-office API.
 *
 * These guards are intended to be called at the start of API service functions as
 * a defence-in-depth measure: even when route middleware already validates the
 * parameters, the service layer should never build a request from an obviously
 * invalid value (e.g. a non-numeric id).
 */

const NUMERIC_ID_PATTERN = /^[0-9]+$/;
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GROUND_REF_PATTERN = /^[a-z]+$/i; // only a-g are valid but any letter is safe
const PROOF_OF_EVIDENCE_TYPE_PATTERN = /^[0-9a-z-]+$/i;

/**
 * Error thrown when an API parameter fails validation.
 */
export class ApiParameterValidationError extends Error {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message);
		this.name = 'ApiParameterValidationError';
	}
}

/**
 * Is the supplied value a valid numeric id (an integer)?
 *
 * @param {string|number|null|undefined} value
 * @returns {boolean}
 */
export const isValidNumericId = (value) =>
	value !== null && value !== undefined && NUMERIC_ID_PATTERN.test(String(value));

/**
 * Is the supplied value a valid GUID/UUID?
 *
 * @param {string|number|null|undefined} value
 * @returns {value is string}
 */
export const isValidGuid = (value) =>
	value !== null && value !== undefined && GUID_PATTERN.test(String(value));

/**
 * Is the supplied value a valid resource id, i.e. either a numeric id or a GUID?
 *
 * Some resources (most notably documents) are usually a GUID but its not enforced in the database.
 * Both forms are inherently safe to interpolate into a URL.
 *
 * @param {string|number|null|undefined} value
 * @returns {value is number | string}
 */
export const isValidId = (value) => isValidNumericId(value) || isValidGuid(value);

/**
 * Is the supplied value a valid ground ref?
 *
 * @param {string|number|null|undefined} value
 * @returns {value is string}
 */
export const isValidGroundRef = (value) =>
	typeof value === 'string' && GROUND_REF_PATTERN.test(value);

/**
 * Is the supplied value a valid proof of evidence type?
 *
 * @param {string|number|null|undefined} value
 * @returns {value is string}
 */
export const isValidProofOfEvidenceType = (value) =>
	typeof value === 'string' && PROOF_OF_EVIDENCE_TYPE_PATTERN.test(value);

/**
 * Assert that every supplied value is a valid numeric id (positive integer).
 *
 * @param {Record<string, string|number|null|undefined>} params - map of parameter name to value
 * @returns {Record<string, string|number>}
 * @throws {ApiParameterValidationError} if any value is not a valid numeric id
 */
export const assertValidNumericIds = (params) => {
	for (const [name, value] of Object.entries(params)) {
		if (!isValidNumericId(value)) {
			throw new ApiParameterValidationError(
				`Invalid ${name}: expected a numeric id but received "${value}"`
			);
		}
	}
	// @ts-expect-error the type is now checked
	return params;
};

/**
 * Assert that every supplied value is a valid GUID.
 *
 * @param {Record<string, string|number|null|undefined>} params - map of parameter name to value
 * @returns {Record<string, string>}
 * @throws {ApiParameterValidationError} if any value is not a valid GUID
 */
export const assertValidGuids = (params) => {
	for (const [name, value] of Object.entries(params)) {
		if (!isValidGuid(value)) {
			throw new ApiParameterValidationError(
				`Invalid ${name}: expected a GUID but received "${value}"`
			);
		}
	}
	// @ts-expect-error the type is now checked
	return params;
};

/**
 * Assert that every supplied value is a valid resource id (numeric id or GUID).
 *
 * @param {Record<string, string|number|null|undefined>} params - map of parameter name to value
 * @returns {Record<string, string|number>}
 * @throws {ApiParameterValidationError} if any value is not a valid id
 */
export const assertValidIds = (params) => {
	for (const [name, value] of Object.entries(params)) {
		if (!isValidId(value)) {
			throw new ApiParameterValidationError(
				`Invalid ${name}: expected a numeric id or GUID but received "${value}"`
			);
		}
	}
	// @ts-expect-error the type is now checked
	return params;
};

/**
 * Assert that every supplied value is a valid ground reference (only letters).
 *
 * @param {Record<string, string|number|null|undefined>} params - map of parameter name to value
 * @returns {Record<string, string>}
 * @throws {ApiParameterValidationError} if any value is not a valid id
 */
export const assertValidGroundRef = (params) => {
	for (const [name, value] of Object.entries(params)) {
		if (!isValidGroundRef(value)) {
			throw new ApiParameterValidationError(
				`Invalid ${name}: expected only letters but received "${value}"`
			);
		}
	}
	// @ts-expect-error the type is now checked
	return params;
};

/**
 * Assert that every supplied value is a valid proof of evidence type
 *
 * @param {Record<string, string|number|null|undefined>} params - map of parameter name to value
 * @returns {Record<string, string>}
 * @throws {ApiParameterValidationError} if any value is not a valid id
 */
export const assertValidProofOfEvidenceType = (params) => {
	for (const [name, value] of Object.entries(params)) {
		if (!isValidProofOfEvidenceType(value)) {
			throw new ApiParameterValidationError(
				`Invalid ${name}: expected only letters, numbers, or hyphens but received "${value}"`
			);
		}
	}
	// @ts-expect-error the type is now checked
	return params;
};
