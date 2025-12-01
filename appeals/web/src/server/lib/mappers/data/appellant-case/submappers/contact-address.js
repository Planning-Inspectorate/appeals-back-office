import { addressToString } from '#lib/address-formatter.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapContactAddress = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const hasData = appellantCaseData.enforcementNotice?.contactAddress !== null;
	const actionText = appellantCaseData.enforcementNotice?.contactAddress?.addressId
		? 'Change'
		: 'Add';
	return textSummaryListItem({
		id: 'contact-address',
		text: 'What is your contact address?',
		value: !hasData
			? 'No data'
			: actionText === 'Change' && appellantCaseData.enforcementNotice?.contactAddress?.addressId
			? addressToString(appellantCaseData.enforcementNotice?.contactAddress)
			: 'Not answered',
		link: !hasData
			? ''
			: actionText === 'Add'
			? `${currentRoute}/contact-address/add`
			: `${currentRoute}/contact-address/change/${appellantCaseData.enforcementNotice?.contactAddress?.addressId}`,
		editable: hasData && userHasUpdateCase,
		classes: 'appeal-contact-address'
	});
};
