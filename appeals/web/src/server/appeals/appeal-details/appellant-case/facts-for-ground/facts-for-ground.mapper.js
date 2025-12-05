import { appealShortReference } from '#lib/appeals-formatter.js';
import { simpleHtmlComponent } from '#lib/mappers/index.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {string} groundRef
 * @param {string | null} [factsForGround]
 * @param {import("@pins/express").ValidationErrors | undefined} [errors]
 * @returns {PageContent}
 */
export function ChangeFactsForGroundPage(appealData, groundRef, factsForGround = null, errors) {
	const id = 'facts-for-ground';
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const paragraphComponent1 = simpleHtmlComponent(
		'p',
		{ id: `${id}-hint-1`, class: 'govuk-body govuk-hint' },
		'Enter your grounds of appeal and supporting facts.  Do not repeat the local planning authority’s reasons for issuing the enforcement notice.'
	);

	const paragraphComponent2 = simpleHtmlComponent(
		'p',
		{ id: `${id}-hint-2`, class: 'govuk-body govuk-hint' },
		'You can upload supporting documents later.'
	);

	const factsForGroundComponent = /** @type {InputPageComponent} */ {
		type: 'textarea',
		parameters: {
			name: 'factsForGround',
			id: `${id}`,
			label: {
				text: `Facts for ground (${groundRef})`,
				classes: 'govuk-label--m'
			},
			value: factsForGround ?? '',
			describedBy: `${id}-hint-1 ${id}-hint-2`,
			errorMessage: errors ? { text: errors?.factsForGround?.msg } : null
		}
	};

	/** @type {PageContent} */
	return {
		title: `Enforcement facts for ground (${groundRef}) - validation - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Facts for ground (${groundRef})`,
		// @ts-ignore
		pageComponents: [paragraphComponent1, paragraphComponent2, factsForGroundComponent]
	};
}
