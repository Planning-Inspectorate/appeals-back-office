import { formatYesNoDetails } from '../nunjucks-filters/format-yes-no-details.js';

/**
 * @param {any} anySignificantChanges
 * @param {any} anySignificantChanges_otherSignificantChanges
 * @param {any} anySignificantChanges_localPlanSignificantChanges
 * @param {any} anySignificantChanges_nationalPolicySignificantChanges
 * @param {any} anySignificantChanges_courtJudgementSignificantChanges
 * @returns {any}
 */
export default function formatAnySignificantChanges(
	anySignificantChanges,
	anySignificantChanges_otherSignificantChanges,
	anySignificantChanges_localPlanSignificantChanges,
	anySignificantChanges_nationalPolicySignificantChanges,
	anySignificantChanges_courtJudgementSignificantChanges
) {
	const details = [];

	if (anySignificantChanges_localPlanSignificantChanges) {
		details.push(`Local plan: ${anySignificantChanges_localPlanSignificantChanges}`);
	}
	if (anySignificantChanges_nationalPolicySignificantChanges) {
		details.push(`National policy: ${anySignificantChanges_nationalPolicySignificantChanges}`);
	}
	if (anySignificantChanges_courtJudgementSignificantChanges) {
		details.push(`Court judgment: ${anySignificantChanges_courtJudgementSignificantChanges}`);
	}
	if (anySignificantChanges_otherSignificantChanges) {
		details.push(`Other: ${anySignificantChanges_otherSignificantChanges}`);
	}
	return anySignificantChanges ? formatYesNoDetails(details) : 'No';
}
