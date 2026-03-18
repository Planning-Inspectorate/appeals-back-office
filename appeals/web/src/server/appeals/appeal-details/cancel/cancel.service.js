/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {boolean} [dryRun]
 * @returns {Promise<{appellant: string, lpa: string}>}
 */
export const cancelAppealEnforcementNoticeWithdrawn = async (
	apiClient,
	appealId,
	dryRun = false
) => {
	return await apiClient
		.post(`appeals/${appealId}/cancel/enforcement-notice-withdrawn`, {
			...(dryRun && { searchParams: { dryRun: 'true' } })
		})
		.json();
};
