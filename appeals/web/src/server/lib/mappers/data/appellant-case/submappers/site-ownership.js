import { textSummaryListItem } from '#lib/mappers/components/index.js';

/**
 * @param {Boolean | null} ownsAllLand
 * @param {Boolean | null} ownsSomeLand
 * @returns {string}
 */
const siteOwnershipText = (ownsAllLand, ownsSomeLand) => {
	if (ownsAllLand) {
		return 'Fully owned';
	} else if (ownsSomeLand) {
		return 'Partially owned';
	} else {
		return 'Not owned';
	}
};

/** @type {import("../mapper.js").SubMapper} */
export const mapSiteOwnership = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'site-ownership',
		text: 'Does the appellant own all of the land involved in the appeal?',
		value: siteOwnershipText(
			appellantCaseData.siteOwnership.ownsAllLand,
			appellantCaseData.siteOwnership.ownsSomeLand
		),
		link: `${currentRoute}/site-ownership/change`,
		editable: userHasUpdateCase
	});
