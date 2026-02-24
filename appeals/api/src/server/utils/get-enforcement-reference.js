import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * @param {Appeal} appeal
 * @returns {Promise<string|undefined>}
 */
export async function getEnforcementReference(appeal) {
	if (appeal.appellantCase?.enforcementReference) {
		return appeal.appellantCase.enforcementReference;
	}
	if (appeal.appealType?.key === APPEAL_CASE_TYPE.C) {
		const appellantCase = await appellantCaseRepository.getAppellantCaseByAppealId(appeal.id);
		return appellantCase?.enforcementReference || undefined;
	}
	return undefined;
}
