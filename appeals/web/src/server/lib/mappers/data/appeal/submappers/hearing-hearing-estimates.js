import { formatDays } from '#lib/dates.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapHearingEstimates = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'add-hearing-estimates';

	/**
	 * @param {string} fieldName
	 * @returns {SummaryListRowProperties}
	 */
	const actions = (fieldName) => {
		if (!userHasUpdateCasePermission) {
			return {};
		}

		return {
			actions: {
				items: [
					{
						href: `${currentRoute}/hearing/estimates/change`,
						text: 'Change',
						visuallyHiddenText: fieldName,
						attributes: { 'data-cy': `change-${fieldName.toLowerCase().replaceAll(' ', '-')}` }
					}
				]
			}
		};
	};

	const { preparationTime, sittingTime, reportingTime } = appealDetails.hearingEstimate || {};

	/** @type {SummaryListRowProperties[]} */
	const rows = [
		{
			key: { text: 'Preparation time' },
			value: { text: formatDays(preparationTime) },
			...actions('Preparation time')
		},
		{
			key: { text: 'Sitting time' },
			value: { text: formatDays(sittingTime) },
			...actions('Sitting time')
		},
		{
			key: { text: 'Reporting time' },
			value: { text: formatDays(reportingTime) },
			...actions('Reporting time')
		}
	];

	return {
		id,
		display: {
			summaryListItems: rows
		}
	};
};
