import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {string} backLinkUrl
 * @param {Record<string, string>} [values]
 * @returns {PageContent}
 */
export function changeAddressKnownPage(appealData, backLinkUrl, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const addressKnownComponent = yesNoInput({
		name: 'addressKnown',
		id: 'address-known',
		legendText: 'Do you know the address of where the inquiry will take place?',
		legendIsPageHeading: true,
		value: values?.addressKnown
	});

	/** @type {PageContent} */
	return {
		title: `Address - start case - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - update appeal procedure`,
		pageComponents: [addressKnownComponent]
	};
}
