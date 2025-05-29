import { simpleHtmlComponent } from '#lib/mappers/components/page-components/html.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */

import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @returns {PageContent}
 */
export function cancelHearingPage(appealData) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const paragraphComponent = simpleHtmlComponent(
		'p',
		{ class: 'govuk-body' },
		`We’ll send an email to the appellant and LPA to tell them the hearing has been cancelled.`
	);

	const keepHearingLink = simpleHtmlComponent(
		'p',
		{ class: 'govuk-body' },
		simpleHtmlComponent(
			'a',
			{
				href: `/appeals-service/appeal-details/${appealData.appealId}`,
				class: 'govuk-link',
				id: 'keepHearing'
			},
			'Keep hearing'
		).parameters.html
	);

	/** @type {PageContent} */
	const pageContent = {
		title: `Confirm that you want to cancel the hearing - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Confirm that you want to cancel the hearing',
		pageComponents: [paragraphComponent],
		postPageComponents: [keepHearingLink],
		submitButtonText: 'Cancel hearing',
		submitButtonProperties: {
			id: 'cancelHearing',
			text: 'Cancel hearing',
			type: 'submit',
			preventDoubleClick: true
		}
	};

	return pageContent;
}
