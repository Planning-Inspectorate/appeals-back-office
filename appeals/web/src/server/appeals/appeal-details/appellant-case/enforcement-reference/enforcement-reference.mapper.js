import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {string | null} [enforcementReference]
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageContent}
 */
export function changeEnforcementReferencePage(appealData, enforcementReference = null, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const enforcementReferenceComponent = /** @type {InputPageComponent} */ {
		type: 'input',
		parameters: {
			name: 'enforcementReference',
			id: 'enforcement-reference',
			label: {
				text: 'What is the reference number on the enforcement notice?',
				classes: 'govuk-label--l',
				isPageHeading: true
			},
			value: enforcementReference ?? '',
			classes: 'govuk-input--width-10',
			errorMessage: errors ? { text: errors?.enforcementReference?.msg } : null
		}
	};

	/** @type {PageContent} */
	return {
		title: `Enforcement notice - validation - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		// @ts-ignore
		pageComponents: [enforcementReferenceComponent]
	};
}
