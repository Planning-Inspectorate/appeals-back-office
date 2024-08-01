/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/**
 *
 * @param {string} appealType
 * @returns
 */
export const mapAppealTypeIn = (appealType) => appealType;

/**
 *
 * @param {AppealType | null | undefined} appealType
 * @returns
 */
export const mapAppealTypeOut = (appealType) => appealType?.key || null;
