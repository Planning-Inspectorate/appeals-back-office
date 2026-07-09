import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { isLdcOrDiscontinuanceOrEnforcementAppealType } from './appeal-type-checks.js';

/**
 * @param {string | undefined} appealType
 * @param {string | undefined} procedureType
 * @returns {boolean}
 */
export const displayFinalComments = (appealType, procedureType) =>
	isLdcOrDiscontinuanceOrEnforcementAppealType(appealType) ||
	(procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.HEARING &&
		procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY);
