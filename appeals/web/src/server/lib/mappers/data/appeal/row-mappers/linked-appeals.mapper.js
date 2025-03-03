import { permissionNames } from '#environment/permissions.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { mapActionComponent } from '#lib/mappers/index.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 * @param {WebAppeal} appealDetails
 * @returns {string}
 */
export function generateLinkedAppealsManageLinkHref(appealDetails) {
	const baseUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/linked-appeals`;

	if (appealDetails.linkedAppeals.length > 0) {
		return `${baseUrl}/manage`;
	}

	return `${baseUrl}/add`;
}

/** @type {import('../mapper.js').RowMapper} */
export const mapLinkedAppeals = ({ appealDetails, session }) => ({
	id: 'linked-appeals',
	display: {
		summaryListItem: {
			key: {
				text: 'Linked appeals'
			},
			value: {
				html:
					displayPageFormatter.formatListOfLinkedAppeals(appealDetails.linkedAppeals) ||
					'No linked appeals'
			},
			actions: {
				items:
					appealDetails.linkedAppeals.filter(
						(linkedAppeal) => linkedAppeal.isParentAppeal && linkedAppeal.externalSource
					).length === 0
						? mapActionComponent(permissionNames.updateCase, session, [
								...(appealDetails.linkedAppeals.length > 0
									? [
											{
												text: 'Manage',
												href: generateLinkedAppealsManageLinkHref(appealDetails),
												visuallyHiddenText: 'Linked appeals',
												attributes: { 'data-cy': 'manage-linked-appeals' }
											}
									  ]
									: []),
								{
									text: 'Add',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/linked-appeals/add`,
									visuallyHiddenText: 'Linked appeals',
									attributes: { 'data-cy': 'add-linked-appeal' }
								}
						  ])
						: []
			},
			classes: 'appeal-linked-appeals'
		}
	}
});
