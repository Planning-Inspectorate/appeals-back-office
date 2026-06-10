import { APPEAL_KNOWS_OTHER_OWNERS } from '@planning-inspectorate/data-model';
import {
	formatAddress,
	formatYesNo,
	formatYesNoDetails
} from '../../../../lib/nunjucks-filters/index.js';

/**
 * @param {any} area
 * @returns {any}
 */
function formatArea(area) {
	return area ? `${area} m²` : 'N/A';
}

/**
 * @param {any} siteAccessRequired
 * @returns {any}
 */
function formatSiteAccessDetails(siteAccessRequired) {
	const { isRequired, details } = siteAccessRequired;
	return isRequired ? formatYesNoDetails(details) : 'No';
}

/**
 * @param {any} healthAndSafety
 * @returns {any}
 */
function formatHealthAndSafetyDetails(healthAndSafety) {
	const { hasIssues, details } = healthAndSafety;
	return hasIssues ? formatYesNoDetails(details) : 'No';
}

/**
 * @param {any} siteOwnership
 * @returns {any}
 */
function formatKnowsOtherLandowners(siteOwnership) {
	const knowsOwners = siteOwnership.ownsSomeLand
		? siteOwnership.knowsOtherLandowners
		: siteOwnership.areAllOwnersKnown;

	switch (knowsOwners) {
		case APPEAL_KNOWS_OTHER_OWNERS.YES:
			return 'Yes';
		case APPEAL_KNOWS_OTHER_OWNERS.NO:
			return 'No';
		case APPEAL_KNOWS_OTHER_OWNERS.SOME:
			return 'Some';
		case null:
		default:
			return 'No data';
	}
}

/**
 * @param {any} siteOwnership
 * @returns {any}
 */
function formatOwnsAllLand(siteOwnership) {
	if (siteOwnership.ownsAllLand) return 'Fully owned';

	if (siteOwnership.ownsSomeLand) return 'Partially owned';

	return 'Not owned';
}

/**
 * @param {any} anySignificantChanges
 * @param {any} anySignificantChanges_otherSignificantChanges
 * @param {any} anySignificantChanges_localPlanSignificantChanges
 * @param {any} anySignificantChanges_nationalPolicySignificantChanges
 * @param {any} anySignificantChanges_courtJudgementSignificantChanges
 * @returns {any}
 */
function formatAnySignificantChanges(
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

/** @type {Record<string, (data: any) => any>} */
export const rowBuilders = {
	appealSite: (data) => ({
		key: 'What is the address of the appeal site?',
		html: formatAddress(data.appealSite)
	}),
	siteAreaSquareMetres: (data) => ({
		key: 'What is the area of the appeal site?',
		text: formatArea(data.siteAreaSquareMetres)
	}),
	highwayLand: (data) => ({
		key: 'Is the appeal site on highway land?',
		text: formatYesNo(data.highwayLand)
	}),
	advertInPosition: (data) => ({
		key: 'Is the advertisement in position?',
		text: formatYesNo(data.advertInPosition)
	}),
	isGreenBelt: (data) => {
		return {
			key: 'Is the appeal site in a green belt?',
			text: formatYesNo(data.isGreenBelt)
		};
	},
	ownsAllLand: (data) => ({
		key: 'Does the appellant own all of the land involved in the appeal?',
		text: formatOwnsAllLand(data.siteOwnership)
	}),
	knowsOtherLandowners: (data) => ({
		key: 'Does the appellant know who owns the land involved in the appeal?',
		text: formatKnowsOtherLandowners(data.siteOwnership)
	}),
	isPartOfAgriculturalHolding: (data) => ({
		key: 'Is the appeal site part of an agricultural holding?',
		text: formatYesNo(Boolean(data.agriculturalHolding?.isPartOfAgriculturalHolding))
	}),
	isTenant: (data) => ({
		key: 'Are you a tenant of the agricultural holding?',
		text: formatYesNo(Boolean(data.agriculturalHolding?.isTenant))
	}),
	hasOtherTenants: (data) => ({
		key: 'Are there any other tenants?',
		text: formatYesNo(Boolean(data.agriculturalHolding?.hasOtherTenants))
	}),
	siteAccessRequired: (data) => ({
		key: 'Will an inspector need to access your land or property?',
		html: formatSiteAccessDetails(data.siteAccessRequired)
	}),
	landownerPermission: (data) => ({
		key: "Do you have the landowner's permission?",
		text: formatYesNo(data.landownerPermission)
	}),
	healthAndSafety: (data) => ({
		key: 'Are there any health and safety issues on the appeal site?',
		html: formatHealthAndSafetyDetails(data.healthAndSafety)
	}),
	anySignificantChanges: (data) => ({
		key: 'Have there been any significant changes that would affect the application?',
		html: formatAnySignificantChanges(
			data.anySignificantChanges,
			data.anySignificantChanges_otherSignificantChanges,
			data.anySignificantChanges_localPlanSignificantChanges,
			data.anySignificantChanges_nationalPolicySignificantChanges,
			data.anySignificantChanges_courtJudgementSignificantChanges
		)
	})
};
