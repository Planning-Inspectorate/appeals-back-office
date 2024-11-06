import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_KNOWS_OTHER_OWNERS } from 'pins-data-model';

/**
 * @param {typeof APPEAL_KNOWS_OTHER_OWNERS.YES | typeof APPEAL_KNOWS_OTHER_OWNERS.NO | typeof APPEAL_KNOWS_OTHER_OWNERS.SOME | null} knowsOtherLandowners
 * @returns {string}
 */
const mapOwnersKnownLabelText = (knowsOtherLandowners) => {
	switch (knowsOtherLandowners) {
		case APPEAL_KNOWS_OTHER_OWNERS.YES:
			return 'Yes';
		case APPEAL_KNOWS_OTHER_OWNERS.NO:
			return 'No';
		case APPEAL_KNOWS_OTHER_OWNERS.SOME:
			return 'Some';
		case null:
		default:
			return 'Not applicable';
	}
};

/** @type {import("../mapper.js").SubMapper} */
export const mapOwnersKnown = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'owners-known',
		text: 'Owners known',
		value: mapOwnersKnownLabelText(appellantCaseData.siteOwnership.knowsOtherLandowners),
		link: `${currentRoute}/owners-known/change`,
		editable: userHasUpdateCase
	});
