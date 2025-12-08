import { addressToString } from '#lib/address-formatter.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapContactAddress = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const hasData = appellantCaseData.enforcementNotice?.isReceived;
	// @ts-ignore
	const contactAddressId = appellantCaseData.enforcementNotice?.contactAddress?.addressId;

	return textSummaryListItem({
		id: 'contact-address',
		text: 'What is your contact address?',
		value: !hasData
			? 'No data'
			: appellantCaseData.enforcementNotice?.contactAddress
			? addressToString({
					addressLine1: appellantCaseData.enforcementNotice.contactAddress?.addressLine1,
					addressLine2: appellantCaseData.enforcementNotice.contactAddress?.addressLine2,
					postCode: appellantCaseData.enforcementNotice.contactAddress?.postCode ?? '',
					// @ts-ignore
					county: appellantCaseData.enforcementNotice.contactAddress?.addressCounty
			  })
			: 'Not answered',
		link: !hasData
			? ''
			: contactAddressId
			? `${currentRoute}/contact-address/change/${contactAddressId}`
			: `${currentRoute}/contact-address/add`,
		editable: !!hasData && userHasUpdateCase,
		actionText: contactAddressId ? 'Change' : 'Add',
		classes: 'appeal-contact-address'
	});
};
