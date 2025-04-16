/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
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
		title: 'What is the application reference number?',
		backLinkUrl: origin,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'What is the application reference number?',
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'planning-application-reference',
					name: 'planningApplicationReference',
					type: 'text',
					value: storedPlanningApplicationReference ?? appealData.planningApplicationReference,
					errorMessage: errorPlanningApplicationReference(errors)
				}
			}
		]
	};
	return pageContent;
};
