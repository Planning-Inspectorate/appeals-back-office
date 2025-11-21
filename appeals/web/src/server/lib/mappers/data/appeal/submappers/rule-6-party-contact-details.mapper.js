import config from '#environment/config.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRule6PartyContactDetails = ({
	appealDetails,
	request,
	userHasUpdateCasePermission
}) => {
	const id = 'rule-6-party-contact-details';
	const { appealId } = appealDetails;

	if (!config.featureFlags.featureFlagRule6Parties) {
		return { id, display: {} };
	}

	return textSummaryListItem({
		id,
		text: 'Rule 6 parties',
		value: 'No rule 6 party',
		link: addBackLinkQueryToUrl(
			request,
			`/appeals-service/appeal-details/${appealId}/rule-6-parties/add`
		),
		actionText: 'Add',
		cypressDataName: 'add-rule-6-party-contact-details',
		editable: userHasUpdateCasePermission,
		classes: 'appeal-rule-6-party-contact-details'
	});
};
