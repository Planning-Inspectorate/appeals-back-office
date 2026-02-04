import { isDefined } from '#lib/ts-utilities.js';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.d.ts').WebAppeal} WebAppeal */

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {WebAppeal} appealDetails
 * @returns {PageComponent[]}
 */
export const getSiteDetails = (mappedData, appealDetails) => {
	/** @type {PageComponent} */
	const component = {
		type: 'summary-list',
		parameters: {
			rows: [
				...(appealDetails.siteVisit
					? [
							mappedData.appeal.visitType.display.summaryListItem,
							mappedData.appeal.siteVisitDate.display.summaryListItem,
							mappedData.appeal.siteVisitStartTime.display.summaryListItem,
							mappedData.appeal.siteVisitEndTime.display.summaryListItem
						]
					: [mappedData.appeal.siteVisit.display.summaryListItem]),
				mappedData.appeal.inspectorNeighbouringSites.display.summaryListItem
			].filter(isDefined)
		},
		wrapperHtml: {
			opening: '<h2 class="govuk-heading-l">Site</h2>',
			closing: ''
		}
	};

	return [component];
};
