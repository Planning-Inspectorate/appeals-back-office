import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_KNOWS_OTHER_OWNERS } from '@planning-inspectorate/data-model';

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
			return 'No data';
	}
};

/** @type {import("../mapper.js").SubMapper} */
export const mapOwnersKnown = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'owners-known',
		text: 'Does the appellant know who owns the land involved in the appeal?',
		value: mapOwnersKnownLabelText(appellantCaseData.siteOwnership.knowsOtherLandowners),
		link: `${currentRoute}/owners-known/change`,
		editable: userHasUpdateCase
	});
