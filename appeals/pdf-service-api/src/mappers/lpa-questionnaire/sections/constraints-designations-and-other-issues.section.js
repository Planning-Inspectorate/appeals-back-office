import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import {
	formatDocumentData,
	formatList,
	formatYesNo,
	formatYesNoDetails
} from '../../../lib/nunjucks-filters/index.js';

function mapBuildingData(building) {
	const { listEntry = 'N/A', name = 'N/A', grade = 'N/A' } = building;
	return `${listEntry} - ${name} - Grade (${grade})`;
}

export function constraintsDesignationsAndOtherIssuesSection(templateData) {
	const {
		isCorrectAppealType,
		listedBuildingDetails = [],
		affectsScheduledMonument,
		hasProtectedSpecies,
		isGreenBelt,
		isAonbNationalLandscape,
		designatedSiteNames = [],
		isGypsyOrTravellerSite,
		preserveGrantLoan,
		appealType
	} = templateData;

	const {
		conservationMap,
		treePreservationPlan,
		definitiveMapStatement,
		historicEnglandConsultation
	} = templateData.documents || {};

	const isHASAppeal = appealType === APPEAL_TYPE.HOUSEHOLDER;

	const changedListedBuildingList = listedBuildingDetails
		.filter(({ affectsListedBuilding = false }) => !affectsListedBuilding)
		.map(mapBuildingData);

	const affectedListedBuildingList = listedBuildingDetails
		.filter(({ affectsListedBuilding = false }) => affectsListedBuilding)
		.map(mapBuildingData);

	const designatedSiteNameList = designatedSiteNames?.map((site) => site.name || 'Unnamed site');

	return {
		heading: 'Constraints, designations and other issues',
		items: [
			{
				key: 'Is planning appeal the correct type of appeal?',
				text: formatYesNo(isCorrectAppealType)
			},
			// does not appear for householder
			...(!isHASAppeal
				? [
						{
							key: 'Does the development change a listed building?',
							html: formatList(changedListedBuildingList, 'No')
						}
				  ]
				: []),
			{
				key: 'Does the development affect the setting of listed buildings?',
				html: formatList(affectedListedBuildingList, 'No')
			},
			// only appears for s20 listed buildings appeals
			...([APPEAL_TYPE.PLANNED_LISTED_BUILDING].includes(appealType)
				? [
						{
							key: 'Was a grant or loan made to preserve the listed building at the appeal site?',
							text: formatYesNo(preserveGrantLoan)
						}
				  ]
				: []),
			// does not appear for householder
			...(!isHASAppeal
				? [
						{
							key: 'Would the development affect a scheduled monument?',
							text: formatYesNo(affectsScheduledMonument)
						}
				  ]
				: []),
			{
				key: 'Conservation area map and guidance',
				html: formatDocumentData(conservationMap)
			},
			// does not appear for householder
			...(!isHASAppeal
				? [
						{
							key: 'Would the development affect a protected species?',
							text: formatYesNo(hasProtectedSpecies)
						}
				  ]
				: []),
			{
				key: 'Green belt',
				text: formatYesNo(isGreenBelt)
			},
			// does not appear for householder
			...(!isHASAppeal
				? [
						{
							key: 'Is the site in an area of outstanding natural beauty?',
							text: formatYesNo(isAonbNationalLandscape)
						},
						{
							key: 'Is the development in, near or likely to affect any designated sites?',
							html: formatYesNoDetails(designatedSiteNameList)
						},
						{
							key: 'Tree preservation order',
							html: formatDocumentData(treePreservationPlan)
						},
						{
							key: 'Does the development relate to anyone claiming to be a Gypsy or Traveller?',
							text: formatYesNo(isGypsyOrTravellerSite)
						},
						{
							key: 'Definitive map and statement extract',
							html: formatDocumentData(definitiveMapStatement)
						}
				  ]
				: []),
			// only appears for s20 listed buildings appeals
			...([APPEAL_TYPE.PLANNED_LISTED_BUILDING].includes(appealType)
				? [
						{
							key: 'Historic England consultation',
							html: formatDocumentData(historicEnglandConsultation)
						}
				  ]
				: [])
		]
	};
}
