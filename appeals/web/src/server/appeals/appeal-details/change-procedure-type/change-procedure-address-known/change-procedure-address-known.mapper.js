import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/components/page-components/radio.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {string} action
 * @param {{ addressKnown: string }} [values]
 * @param {string} newProcedureType
 * @returns {PageContent}
 */
export function changeAddressKnownPage(appealData, action, newProcedureType, values) {
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
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/change-appeal-procedure-type/${newProcedureType}/estimation`,
		preHeading: `Appeal ${shortAppealReference} - update appeal procedure`,
		pageComponents: [addressKnownComponent]
	};
}
