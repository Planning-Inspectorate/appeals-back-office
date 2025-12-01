import config from '#environment/config.js';
import { listOrOnlyItem } from '#lib/mappers/components/page-components/list-or-only-item.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapRule6PartyContactDetails = ({
	appealDetails,
	request,
	userHasUpdateCasePermission
}) => {
	const id = 'rule-6-party-contact-details';
	const { appealId } = appealDetails;

	if (
		!config.featureFlags.featureFlagRule6Parties ||
		appealDetails.procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY.toLowerCase()
	) {
		return { id, display: {} };
	}

	const baseSummaryListItem = {
		id,
		text: 'Rule 6 parties',
		link: addBackLinkQueryToUrl(
			request,
			`/appeals-service/appeal-details/${appealId}/rule-6-parties/add`
		),
		actionText: 'Add',
		cypressDataName: 'add-rule-6-party-contact-details',
		editable: userHasUpdateCasePermission,
		classes: 'appeal-rule-6-party-contact-details'
	};

	const rule6Parties = appealDetails.appealRule6Parties;

	if (rule6Parties && rule6Parties.length > 0) {
		const rule6PartyItems = rule6Parties.map(
			(/** @type {Record<string, any>} */ rule6Party) =>
				`${rule6Party.serviceUser.organisationName}<br>${rule6Party.serviceUser.email}`
		);
		return textSummaryListItem({
			...baseSummaryListItem,
			value: {
				html: listOrOnlyItem(rule6PartyItems, 'No rule 6 party')
			}
		});
	}

	return textSummaryListItem({
		...baseSummaryListItem,
		value: 'No rule 6 party'
	});
};
