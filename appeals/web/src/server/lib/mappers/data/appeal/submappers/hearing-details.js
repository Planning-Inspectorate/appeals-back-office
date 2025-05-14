import { addressToString } from '#lib/address-formatter.js';
import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapHearingDetails = ({ appealDetails }) => {
	const id = 'hearing-details';

	const { hearingStartTime, address } = appealDetails.hearing || {};

	/** @type {SummaryListRowProperties[]} */
	const rows = [
		{
			key: { text: 'Date' },
			value: { text: dateISOStringToDisplayDate(hearingStartTime) }
		},
		{
			key: { text: 'Time' },
			value: { text: dateISOStringToDisplayTime12hr(hearingStartTime) }
		},
		{
			key: { text: 'Do you know the address of where the hearing will take place?' },
			value: { text: address ? 'Yes' : 'No' }
		},
		...(address
			? [
					{
						key: { text: 'Address' },
						value: { html: addressToString({ ...address, postCode: address?.postcode }, '<br>') }
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
