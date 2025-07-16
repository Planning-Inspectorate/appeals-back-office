import { addressToString } from '#lib/address-formatter.js';
import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapInquiryDetails = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) => {
	const id = 'inquiry-details';

	/**
	 * @param {string} fieldName
	 * @param {string} pageSlug
	 * @returns {SummaryListRowProperties}
	 */
	const actions = (fieldName, pageSlug) => {
		if (!userHasUpdateCasePermission) {
			return {};
		}

		return {
			actions: {
				items: [
					{
						href: `${currentRoute}/inquiry/change/${pageSlug}`,
						text: 'Change',
						visuallyHiddenText: fieldName,
						attributes: { 'data-cy': `change-${fieldName.toLowerCase().replaceAll(' ', '-')}` }
					}
				]
			}
		};
	};

	const { inquiryStartTime, address, estimatedDays } = appealDetails.inquiry || {};

	/** @type {SummaryListRowProperties[]} */
	const rows = [
		{
			key: { text: 'Date' },
			value: { text: dateISOStringToDisplayDate(inquiryStartTime) },
			...actions('Date', 'date')
		},
		{
			key: { text: 'Time' },
			value: { text: dateISOStringToDisplayTime12hr(inquiryStartTime) },
			...actions('Time', 'date')
		},
		{
			key: { text: 'Do you know the estimated number of days needed to carry out the inquiry?' },
			value: { text: estimatedDays ? 'Yes' : 'No' },
			...actions('Whether the estimated number of days is known or not', 'estimatedDays')
		},
		...(estimatedDays
			? [
					{
						key: { text: 'Esitmated number of days needed to carry out inquiry' },
						value: { text: `${estimatedDays} Days` },
						...actions('Estimated Days', 'estimated-days')
					}
			  ]
			: []),
		{
			key: { text: 'Do you know the address of where the inquiry will take place?' },
			value: { text: address ? 'Yes' : 'No' },
			...actions('Whether the address is known or not', 'address')
		},
		...(address
			? [
					{
						key: { text: 'Address' },
						value: { html: addressToString({ ...address, postCode: address?.postcode }, '<br>') },
						...actions('Address', 'address-details')
					}
			  ]
			: [])
	];

	return {
		id,
		display: {
			summaryListItems: rows
		}
	};
};
