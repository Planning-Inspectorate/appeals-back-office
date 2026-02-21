import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

const APPELLANT_STATEMENT_APPEAL_TYPES = new Set([
	APPEAL_TYPE.ADVERTISEMENT,
	APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
	APPEAL_TYPE.ENFORCEMENT_NOTICE,
	APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
]);

/**
 * @param {string | null | undefined} appealType
 * @returns {boolean}
 */
const isAppellantStatementAppealType = (appealType) =>
	Boolean(appealType && APPELLANT_STATEMENT_APPEAL_TYPES.has(appealType));

export default isAppellantStatementAppealType;
