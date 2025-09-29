import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import {
	formatAddress,
	formatSentenceCase,
	formatYesNo
} from '../../../lib/nunjucks-filters/index.js';

function formatArea(area) {
	return area ? `${area} m²` : 'N/A';
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
		healthAndSafety
	} = templateData;

	return {
		heading: 'Site details',
		items: [
			{ key: 'What is the address of the appeal site?', html: formatAddress(appealSite) },
			{
				key: 'What is the area of the appeal site?',
				text: formatArea(siteAreaSquareMetres)
			},
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
				text: formatYesNo(siteAccessRequired?.isRequired)
			},
			{
				key: 'Are there any health and safety issues on the appeal site?',
				text: formatYesNo(healthAndSafety?.hasIssues)
			}
		]
	};
}
