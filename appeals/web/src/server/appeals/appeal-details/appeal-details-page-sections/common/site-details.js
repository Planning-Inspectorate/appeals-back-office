import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { isAfter, isBefore, isSameDay } from 'date-fns';
/** @typedef {import('#appeals/appeal-details/appeal-details.types.d.ts').WebAppeal} WebAppeal */

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {WebAppeal} appealDetails
 * @returns {PageComponent[]}
 */
export const getSiteDetails = (mappedData, appealDetails) => {
	const { siteVisit } = appealDetails;

	/** @type {PageComponent} */
	const title = {
		type: 'html',
		parameters: { html: '<div id="site-visit-section"><h1 class="govuk-heading-l">Site</h1>' }
	};
	/** @type {PageComponent} */
	const cancelSiteVisitLink = {
		type: 'html',
		parameters: {
			html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/${appealDetails.appealId}/site-visit/delete">Cancel site visit</a></p>`
		}
	};
	/** @type {PageComponent} */
	const recordMissedSiteVisitLink = {
		type: 'html',
		parameters: {
			html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/${appealDetails.appealId}/site-visit/missed/index" >Record missed site visit</a></p>`
		}
	};

	/** @type {PageComponent} */
	const siteVisitDetailsList = {
		type: 'summary-list',
		parameters: {
			rows: [
				...(appealDetails.siteVisit
					? [
							mappedData.appeal.siteVisitDate.display.summaryListItem,
							mappedData.appeal.siteVisitStartTime.display.summaryListItem,
							mappedData.appeal.visitType.display.summaryListItem
					  ]
					: [mappedData.appeal.siteVisit.display.summaryListItem])
			].filter(isDefined)
		}
	};
	/** @type {PageComponent[]} */
	const siteVisitRequestDetails = [
		{
			type: 'html',
			parameters: { html: '<h1 class="govuk-heading-m">Site visit requests</h1>' }
		},
		{
			type: 'summary-list',
			parameters: {
				rows: [mappedData.appeal.inspectorNeighbouringSites.display.summaryListItem].filter(
					isDefined
				)
			}
		},
		{
			type: 'html',
			parameters: { html: '</div>' }
		}
	];
	/**
	 * @type {PageComponent[]}
	 */
	const allComponents = [];

	allComponents.push(title);
	if (siteVisit && siteVisit.visitDate) {
		const visitDate = new Date(siteVisit.visitDate);
		const currentDate = new Date();

		if (isSameDay(visitDate, currentDate)) {
			allComponents.push(cancelSiteVisitLink, recordMissedSiteVisitLink);
		} else if (isAfter(visitDate, currentDate)) {
			allComponents.push(cancelSiteVisitLink);
		} else if (
			isBefore(visitDate, currentDate) &&
			!appealDetails.completedStateList.includes('issue_determination')
		) {
			allComponents.push(recordMissedSiteVisitLink);
		}
	}
	allComponents.push(siteVisitDetailsList);
	allComponents.push(...siteVisitRequestDetails);

	if (appealDetails.appealType === APPEAL_TYPE.S78) {
		return appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.WRITTEN
			? allComponents
			: [];
	}

	return allComponents;
};
