import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {import('../../appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} backLinkUrl
 * @param {Record<string, string>} [values]
 * @returns {PageContent}
 */
export const dateKnownPage = (appealDetails, backLinkUrl, values) => {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	const dateKnownComponent = yesNoInput({
		name: 'dateKnown',
		id: 'date-known',
		legendText: 'Do you know the date and time of the hearing?',
		legendIsPageHeading: true,
		value: values?.dateKnown
	});

	/** @type {PageContent} */
	const pageContent = {
		title: `Appeal ${shortAppealReference} - start case`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - start case`,
		pageComponents: [dateKnownComponent],
		submitButtonProperties: {
			text: 'Continue',
			id: 'continue'
		}
	};

	return pageContent;
};
