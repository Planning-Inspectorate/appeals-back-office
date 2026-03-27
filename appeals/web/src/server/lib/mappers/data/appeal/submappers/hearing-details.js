import { addressToString } from '#lib/address-formatter.js';
import { dateISOStringToDisplayDate, dateISOStringToDisplayTime12hr } from '#lib/dates.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapHearingDetails = ({
	appealDetails,
	currentRoute,
	request,
	userHasUpdateCasePermission
}) => {
	const id = 'hearing-details';

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
						href: addBackLinkQueryToUrl(request, `${currentRoute}/hearing/change/${pageSlug}`),
						text: 'Change',
						visuallyHiddenText: fieldName,
						attributes: { 'data-cy': `change-${fieldName.toLowerCase().replaceAll(' ', '-')}` }
					}
				]
			}
		};
	};

	const { hearingStartTime, address, estimatedDays } = appealDetails.hearing || {};

	/** @type {SummaryListRowProperties[]} */
	const rows = [
		{
			key: { text: 'Date' },
			value: { text: dateISOStringToDisplayDate(hearingStartTime) },
			...actions('Date', 'date')
		},
		{
			key: { text: 'Time' },
			value: { text: dateISOStringToDisplayTime12hr(hearingStartTime) },
			...actions('Time', 'date')
		},
		{
			key: { text: 'Do you know the estimated number of days needed to carry out the hearing?' },
			value: { text: estimatedDays ? 'Yes' : 'No' },
			...actions('Whether the estimated number of days is known or not', 'estimation')
		},
		...(estimatedDays
			? [
					{
						key: { text: 'Estimated number of days needed to carry out hearing' },
						value: { text: `${estimatedDays} Days` },
						...actions('Estimated Days', 'estimation')
					}
				]
			: []),
		{
			key: { text: 'Do you know the address of where the hearing will take place?' },
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
