import { getCostDocumentCounts } from '#endpoints/documents/documents.service.js';

/** @typedef {import('@pins/appeals').CostsAppliedFor} CostsAppliedFor */

/**
 * @param {number} appealId
 * @returns {Promise<CostsAppliedFor>}
 * */
export const checkCostsAppliedFor = async (appealId) => {
	const costsFolderCounts = await getCostDocumentCounts(appealId);
	const costsDecision = costsFolderCounts.reduce((costsDecision, folder) => {
		const costsType = folder.path.replace('costs/', '');
		const documentCount = folder._count.documents;
		return { ...costsDecision, [costsType]: documentCount };
	}, {});

	const {
		// @ts-ignore
		appellantCostsApplication = 0,
		// @ts-ignore
		appellantCostsWithdrawal = 0,
		// @ts-ignore
		lpaCostsApplication = 0,
		// @ts-ignore
		lpaCostsWithdrawal = 0
	} = costsDecision || {};

	const appellantCostsAppliedFor = appellantCostsApplication > appellantCostsWithdrawal;
	const lpaCostsAppliedFor = lpaCostsApplication > lpaCostsWithdrawal;

	return { appellantCostsAppliedFor, lpaCostsAppliedFor };
};
