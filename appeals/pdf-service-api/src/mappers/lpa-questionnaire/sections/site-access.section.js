import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import {
	formatAddress,
	formatList,
	formatYesNoDetails
} from '../../../lib/nunjucks-filters/index.js';

function formatSiteAccessDetails(siteAccessRequired) {
	const { isRequired, details } = siteAccessRequired;
	return isRequired ? formatYesNoDetails(details) : 'No';
}

function formatHealthAndSafetyDetails(healthAndSafety) {
	const { hasIssues, details } = healthAndSafety;
	return hasIssues ? formatYesNoDetails(details) : 'No';
}

function formatNeighbouringSites(neighbouringSites) {
	return formatList(
		neighbouringSites.map((site) => formatAddress(site.address)),
		'None'
	);
}

export function siteAccessSection(templateData) {
	const {
		siteAccessRequired,
		reasonForNeighbourVisits,
		healthAndSafety,
		neighbouringSites,
		appealType
	} = templateData;

	const isHASAppeal = appealType === APPEAL_TYPE.HOUSEHOLDER;

	return {
		heading: 'Site access',
		items: [
			{
				key: 'Might the inspector need access to the appellant’s land or property?',
				html: formatSiteAccessDetails(siteAccessRequired)
			},
			// does not appear for householder
			...(!isHASAppeal
				? [
						{
							key: 'Might the inspector need to enter a neighbour’s land or property?',
							html: formatYesNoDetails(reasonForNeighbourVisits)
						},
						{
							key: 'Address of the neighbour’s land or property',
							html: formatNeighbouringSites(neighbouringSites)
						}
				  ]
				: []),
			{
				key: 'Are there any potential safety risks?',
				html: formatHealthAndSafetyDetails(healthAndSafety)
			}
		]
	};
}
