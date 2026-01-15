import { addressToString } from '#lib/address-formatter.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapContactAddress = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	// @ts-ignore
	const contactAddressId = appellantCaseData.enforcementNotice?.contactAddress?.addressId;
	const contactAddress =
		contactAddressId &&
		addressToString({
			addressLine1: appellantCaseData.enforcementNotice?.contactAddress?.addressLine1,
			addressLine2: appellantCaseData.enforcementNotice?.contactAddress?.addressLine2,
			postCode: appellantCaseData.enforcementNotice?.contactAddress?.postCode ?? '',
			// @ts-ignore
			town: appellantCaseData.enforcementNotice?.contactAddress?.addressTown,
			// @ts-ignore
			county: appellantCaseData.enforcementNotice.contactAddress?.addressCounty
		});

	return textSummaryListItem({
		id: 'contact-address',
		text: 'What is your contact address?',
		// @ts-ignore
		value: contactAddress?.trim() || 'Not answered',
		link: contactAddressId
			? `${currentRoute}/contact-address/change/${contactAddressId}`
			: `${currentRoute}/contact-address/add`,
		editable: userHasUpdateCase,
		actionText: contactAddressId ? 'Change' : 'Add',
		classes: 'appeal-contact-address'
	});
};
