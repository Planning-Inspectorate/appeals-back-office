import config from '#environment/config.js';
import { listOrOnlyItem } from '#lib/mappers/components/page-components/list-or-only-item.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
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

	const rule6Parties = appealDetails.appealRule6Parties || [];

	/**
	 * @param {string} action
	 */
	const actionItem = (action) => ({
		text: capitalizeFirstLetter(action),
		visuallyHiddenText: 'Rule 6 parties',
		href: addBackLinkQueryToUrl(
			request,
			`/appeals-service/appeal-details/${appealId}/rule-6-parties/${action}`
		),
		attributes: {
			'data-cy': `${action}-rule-6-party-contact-details`
		}
	});

	const baseItem = {
		key: {
			text: 'Rule 6 parties'
		},
		actions: {
			items: userHasUpdateCasePermission
				? [...(rule6Parties.length > 0 ? [actionItem('manage')] : []), actionItem('add')]
				: []
		},
		classes: 'appeal-rule-6-party-contact-details'
	};

	const rule6PartyItems = rule6Parties.map(
		(/** @type {Record<string, any>} */ rule6Party) =>
			`${rule6Party.serviceUser.organisationName}<br>${rule6Party.serviceUser.email}`
	);

	return {
		id,
		display: {
			summaryListItem: {
				...baseItem,
				value: {
					html: listOrOnlyItem(rule6PartyItems, 'No rule 6 party')
				}
			}
		}
	};
};
