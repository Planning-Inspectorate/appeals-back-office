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

	/** @type {SummaryListRowProperties[]} */
	const rows = [
		{
			key: { text: 'Preparation time' },
			value: { text: `${appealDetails.hearingEstimate?.preparationTime} days` },
			...actions('Preparation time')
		},
		{
			key: { text: 'Sitting time' },
			value: { text: `${appealDetails.hearingEstimate?.sittingTime} days` },
			...actions('Sitting time')
		},
		{
			key: { text: 'Reporting time' },
			value: { text: `${appealDetails.hearingEstimate?.reportingTime} days` },
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
