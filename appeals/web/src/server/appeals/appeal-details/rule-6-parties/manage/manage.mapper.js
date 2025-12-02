import { appealShortReference } from '#lib/appeals-formatter.js';
import { getSavedBackUrl } from '#lib/middleware/save-back-url.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {PageContent}
 */
export function manageRule6PartiesPage(appealData, request) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const baseUrl = `/appeals-service/appeal-details/${appealData.appealId}/rule-6-parties`;

	const defaultBackUrl = `/appeals-service/appeal-details/${request.currentAppeal.appealId}`;
	const backLinkUrl = getSavedBackUrl(request, 'manageRule6Parties') || defaultBackUrl;

	const rule6Parties = appealData.appealRule6Parties ?? [];

	/** @type {PageComponent} */
	const summaryList = {
		type: 'summary-list',
		parameters: {
			rows: rule6Parties.map((rule6Party) => ({
				key: {
					text: rule6Party.serviceUser.organisationName
				},
				value: {
					text: rule6Party.serviceUser.email
				},
				actions: {
					id: `rule-6-party-${rule6Party.id}-actions`,
					items: [
						{
							text: 'Change',
							href: addBackLinkQueryToUrl(request, `${baseUrl}/change/${rule6Party.id}`),
							attributes: {
								'data-cy': `change-rule-6-party-${rule6Party.id}`
							}
						},
						{
							text: 'Remove',
							href: addBackLinkQueryToUrl(request, `${baseUrl}/remove/${rule6Party.id}`),
							attributes: {
								'data-cy': `remove-rule-6-party-${rule6Party.id}`
							}
						}
					]
				}
			})),
			attributes: {
				id: 'rule-6-parties-summary-list'
			}
		}
	};

	/** @type {PageContent} */
	return {
		title: `Appeal ${shortAppealReference} - Manage rule 6 parties`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Manage rule 6 parties',
		pageComponents: [summaryList]
	};
}
