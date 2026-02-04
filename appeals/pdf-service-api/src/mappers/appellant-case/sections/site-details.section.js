import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import {
	formatAddress,
	formatSentenceCase,
	formatYesNo,
	formatYesNoDetails
} from '../../../lib/nunjucks-filters/index.js';

function formatArea(area) {
	return area ? `${area} m²` : 'N/A';
}

function formatSiteAccessDetails(siteAccessRequired) {
	const { isRequired, details } = siteAccessRequired;
	return isRequired ? formatYesNoDetails(details) : 'No';
}

function formatHealthAndSafetyDetails(healthAndSafety) {
	const { hasIssues, details } = healthAndSafety;
	return hasIssues ? formatYesNoDetails(details) : 'No';
}

export function siteDetailsSection(templateData) {
	const {
		appealSite,
		appealType,
		siteAreaSquareMetres,
		isGreenBelt,
		siteOwnership,
		agriculturalHolding,
		siteAccessRequired,
		healthAndSafety,
		highwayLand,
		advertisementInPosition,
		landownerPermission
	} = templateData;

	return {
		heading: 'Site details',
		items: [
			{ key: 'What is the address of the appeal site?', html: formatAddress(appealSite) },
			{
				key: 'What is the area of the appeal site?',
				text: formatArea(siteAreaSquareMetres)
			},
			...([APPEAL_TYPE.CAS_ADVERTISEMENT, APPEAL_TYPE.ADVERTISEMENT].includes(appealType)
				? [
						{
							key: 'Is the appeal site on highway land?',
							text: formatYesNo(Boolean(highwayLand))
						},
						{
							key: 'Is the advertisement in position?',
							text: formatYesNo(Boolean(advertisementInPosition))
						}
					]
				: []),
			{ key: 'Is the appeal site in a green belt?', text: formatYesNo(isGreenBelt) },
			{
				key: 'Does the appellant own all of the land involved in the appeal?',
				text: siteOwnership?.ownsAllLand ? 'Fully owned' : 'No'
			},
			{
				key: 'Does the appellant know who owns the land involved in the appeal?',
				text: formatSentenceCase(siteOwnership?.knowsOtherLandowners)
			},
			// Will only be available for s78
			...([APPEAL_TYPE.S78].includes(appealType)
				? [
						{
							key: 'Is the appeal site part of an agricultural holding?',
							text: formatYesNo(Boolean(agriculturalHolding?.isPartOfAgriculturalHolding))
						},
						{
							key: 'Are you a tenant of the agricultural holding?',
							text: formatYesNo(Boolean(agriculturalHolding?.isTenant))
						},
						{
							key: 'Are there any other tenants?',
							text: formatYesNo(Boolean(agriculturalHolding?.hasOtherTenants))
						}
					]
				: []),
			{
				key: 'Will an inspector need to access your land or property?',
				html: formatSiteAccessDetails(siteAccessRequired)
			},
			...([APPEAL_TYPE.CAS_ADVERTISEMENT, APPEAL_TYPE.ADVERTISEMENT].includes(appealType)
				? [
						{
							key: "Do you have the landowner's permission?",
							html: formatYesNo(landownerPermission)
						}
					]
				: []),
			{
				key: 'Are there any health and safety issues on the appeal site?',
				html: formatHealthAndSafetyDetails(healthAndSafety)
			}
		]
	};
}
