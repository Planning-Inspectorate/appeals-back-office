import {
	formatAddress,
	formatList,
	formatYesNoDetails
} from '../../../../lib/nunjucks-filters/index.js';

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

export const rowBuilders = {
	siteAccessRequired: (data) => ({
		key: 'Will the inspector need access to the appellant’s land or property?',
		html: formatSiteAccessDetails(data.siteAccessRequired)
	}),
	reasonForNeighbourVisits: (data) => ({
		key: 'Will the inspector need to enter a neighbour’s land or property?',
		html: formatYesNoDetails(data.reasonForNeighbourVisits)
	}),
	neighbouringSites: (data) => ({
		key: 'Address of the neighbour’s land or property',
		html: formatNeighbouringSites(data.neighbouringSites)
	}),
	healthAndSafety: (data) => ({
		key: 'Are there any potential safety risks?',
		html: formatHealthAndSafetyDetails(data.healthAndSafety)
	})
};
