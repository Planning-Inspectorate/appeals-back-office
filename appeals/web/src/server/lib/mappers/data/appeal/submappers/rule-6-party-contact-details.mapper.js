import config from '#environment/config.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRule6PartyContactDetails = ({ currentRoute, userHasUpdateCasePermission }) => {
	const id = 'rule-6-party-contact-details';

	if (!config.featureFlags.featureFlagRule6Parties) {
		return { id, display: {} };
	}

	return textSummaryListItem({
		id,
		text: 'Rule 6 parties',
		value: 'No rule 6 party',
		link: `${currentRoute}/rule6parties/add`,
		actionText: 'Add',
		cypressDataName: 'add-rule-6-party-contact-details',
		editable: userHasUpdateCasePermission,
		classes: 'appeal-rule-6-party-contact-details'
	});
};
