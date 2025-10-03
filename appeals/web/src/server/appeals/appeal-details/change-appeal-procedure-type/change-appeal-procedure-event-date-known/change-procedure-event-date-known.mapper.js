import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {import('../../appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} backLinkUrl
 * @param {string} procedureType
 * @param {Record<string, string>} [values]
 * @returns {PageContent}
 */
export const dateKnownPage = (appealDetails, backLinkUrl, procedureType, values) => {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	const dateKnownComponent = yesNoInput({
		name: 'dateKnown',
		id: 'date-known',
		legendText: `Do you know the date and time of the ${procedureType}?`,
		legendIsPageHeading: true,
		value: values?.dateKnown
	});

	/** @type {PageContent} */
	const pageContent = {
		title: `Appeal ${shortAppealReference} - update appeal procedure`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - update appeal procedure`,
		pageComponents: [dateKnownComponent],
		submitButtonProperties: {
			text: 'Continue',
			id: 'continue'
		}
	};

	return pageContent;
};
