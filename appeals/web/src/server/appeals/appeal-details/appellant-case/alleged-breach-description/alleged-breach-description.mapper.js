import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {string | null} [descriptionOfAllegedBreach]
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageContent}
 */
export function changeAllegedBreachDescriptionPage(
	appealData,
	descriptionOfAllegedBreach = null,
	errors
) {
	const id = 'alleged-breach-description';
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const allegedBreachDescriptionComponent = /** @type {InputPageComponent} */ {
		type: 'textarea',
		parameters: {
			name: 'descriptionOfAllegedBreach',
			id: `${id}`,
			label: {
				text: `Enter the description of the alleged breach`,
				classes: 'govuk-label--l',
				isPageHeading: true
			},
			hint: { text: 'The description must match what is on the enforcement notice.' },
			value: descriptionOfAllegedBreach ?? '',
			errorMessage: errors ? { text: errors?.descriptionOfAllegedBreach?.msg } : null
		}
	};

	/** @type {PageContent} */
	return {
		title: `Enforcement alleged breach description - validation - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		// @ts-ignore
		pageComponents: [allegedBreachDescriptionComponent]
	};
}
