/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {{ address: import("@pins/appeals.api/src/server/endpoints/appeals.js").AppealSite; siteId: string; }} NeighbouringSitesItem
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { errorPlanningApplicationReference } from '#lib/error-handlers/change-screen-error-handlers.js';

/**
 * @param {Appeal} appealData
 * @param {string} storedPlanningApplicationReference
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {string} origin
 * @returns {PageContent}
 */
export const changeLpaReferencePage = (
	appealData,
	storedPlanningApplicationReference,
	origin,
	errors
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Change the planning application reference',
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change the planning application reference',
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'planning-application-reference',
					name: 'planningApplicationReference',
					type: 'text',
					label: {
						isPageHeading: false,
						text: 'Planning application reference' //TODO: Content check what do we call this?
					},
					value: storedPlanningApplicationReference ?? appealData.planningApplicationReference,
					errorMessage: errorPlanningApplicationReference(errors)
				}
			}
		]
	};
	return pageContent;
};
