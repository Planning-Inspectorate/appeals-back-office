import { getFoldersForAppeal } from '#endpoints/documents/documents.service.js';
import { APPEAL_CASE_STAGE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals').CostsDecision} CostsDecision */
/** @typedef {import('#db-client/models.ts').AppealModel } AppealModel */
/** @typedef {import('#db-client/models.ts').AppealStatusModel } AppealStatusModel */

/**
 * @param {{id: AppealModel['id'], currentStatus: string }} appeal
 * @returns {Promise<CostsDecision>}
 * */
export const formatCostsDecision = async (appeal) => {
	const costsFolders = await getFoldersForAppeal(appeal.id, APPEAL_CASE_STAGE.COSTS);
	const costsDecision = costsFolders.reduce((costsDecision, folder) => {
		const costsType = folder.path.replace('costs/', '');
		const documentCount = folder.documents?.filter((doc) => !doc.isDeleted).length;
		return { ...costsDecision, [costsType]: documentCount };
	}, {});
	const appealIsCompleteOrWithdrawn =
		appeal.currentStatus === APPEAL_CASE_STATUS.COMPLETE ||
		appeal.currentStatus === APPEAL_CASE_STATUS.WITHDRAWN;

	const {
		// @ts-ignore
		appellantCostsApplication = 0,
		// @ts-ignore
		appellantCostsWithdrawal = 0,
		// @ts-ignore
		appellantCostsDecisionLetter = 0,
		// @ts-ignore
		lpaCostsApplication = 0,
		// @ts-ignore
		lpaCostsWithdrawal = 0,
		// @ts-ignore
		lpaCostsDecisionLetter = 0
	} = (appealIsCompleteOrWithdrawn && costsDecision) || {};

	const awaitingAppellantCostsDecision =
		appellantCostsDecisionLetter === 0 && appellantCostsApplication > appellantCostsWithdrawal;
	const awaitingLpaCostsDecision =
		lpaCostsDecisionLetter === 0 && lpaCostsApplication > lpaCostsWithdrawal;

	return { awaitingAppellantCostsDecision, awaitingLpaCostsDecision };
};
