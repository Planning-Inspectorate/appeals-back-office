import { formatList, formatSentenceCase, formatYesNo } from '../lib/nunjucks-filters/index.js';

function mapBuildingData(building) {
	const { listEntry = 'N/A', name = 'N/A', grade = 'N/A' } = building;
	return `${listEntry} - ${name} - Grade (${grade})`;
}

function formatDocumentData(documentData, fallback = 'No documents') {
	const list = documentData?.documents.map((document) => document.name || 'Unnamed document') || [];
	return formatList(list, fallback);
}

export default function mapQuestionnaireData(templateData) {
	const {
		isCorrectAppealType,
		listedBuildingDetails = [],
		affectsScheduledMonument,
		hasProtectedSpecies,
		isGreenBelt,
		isAonbNationalLandscape,
		designatedSiteNames = [],
		isGypsyOrTravellerSite,
		eiaEnvironmentalImpactSchedule,
		eiaColumnTwoThreshold,
		eiaRequiresEnvironmentalStatement
	} = templateData.lpaQuestionnaireData;

	const {
		conservationMap,
		treePreservationPlan,
		definitiveMapStatement,
		lpaCaseCorrespondence,
		eiaEnvironmentalStatement,
		eiaScreeningOpinion,
		eiaScreeningDirection,
		eiaDevelopmentDescription,
		eiaSensitiveAreaDetails
	} = templateData.lpaQuestionnaireData?.documents || {};

	const changedListedBuildingList = listedBuildingDetails
		.filter(({ affectsListedBuilding = false }) => !affectsListedBuilding)
		.map(mapBuildingData);

	const affectedListedBuildingList = listedBuildingDetails
		.filter(({ affectsListedBuilding = false }) => affectsListedBuilding)
		.map(mapBuildingData);

	const designatedSiteNameList = designatedSiteNames.map((site) => site.name || 'Unnamed site');

	return {
		sections: [
			{
				heading: 'Constraints, designations and other issues',
				items: [
					{
						key: 'Is planning appeal the correct type of appeal?',
						text: formatYesNo(isCorrectAppealType)
					},
					{
						key: 'Does the development change a listed building?',
						html: formatList(changedListedBuildingList, 'No')
					},
					{
						key: 'Does the development affect a listed building?',
						html: formatList(affectedListedBuildingList, 'No')
					},
					{
						key: 'Would the development affect a scheduled monument?',
						text: formatYesNo(affectsScheduledMonument)
					},
					{
						key: 'Conservation area map and guidance',
						html: formatDocumentData(conservationMap)
					},
					{
						key: 'Would the development affect a protected species?',
						text: formatYesNo(hasProtectedSpecies)
					},
					{
						key: 'Green belt',
						text: formatYesNo(isGreenBelt)
					},
					{
						key: 'Is the site in an area of outstanding natural beauty?',
						text: formatYesNo(isAonbNationalLandscape)
					},
					{
						key: 'Is the development in, near or likely to affect any designated sites?',
						html: formatList([
							formatYesNo(designatedSiteNameList.length > 0),
							...designatedSiteNameList
						])
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
			},
			{
				heading: 'Environmental impact assessment',
				items: [
					{
						key: 'What is the development category?',
						text: formatSentenceCase(eiaEnvironmentalImpactSchedule, 'Other')
					},
					{
						key: 'Does the development meet or exceed the threshold or criteria in column 2?',
						text: formatYesNo(eiaColumnTwoThreshold)
					},
					{
						key: 'Did your screening opinion say the development needed an environmental statement?',
						text: formatYesNo(eiaRequiresEnvironmentalStatement)
					},
					{
						key: 'Environmental statement and supporting information',
						html: formatDocumentData(eiaEnvironmentalStatement)
					},
					{
						key: 'Screening opinion documents',
						html: formatDocumentData(eiaScreeningOpinion)
					},
					{
						key: 'Screening direction documents',
						html: formatDocumentData(eiaScreeningDirection)
					},
					{
						key: 'Description of development',
						text: formatSentenceCase(eiaDevelopmentDescription)
					},
					{
						key: 'Is the development in, partly in, or likely to affect a sensitive area?',
						html: formatList([
							formatYesNo(Boolean(eiaSensitiveAreaDetails?.trim())),
							...[eiaSensitiveAreaDetails?.trim()]
								.filter((data) => data)
								.map((data) => formatSentenceCase(data))
						])
					}
				]
			},
			{
				heading: 'Additional documents (LPA case correspondence)',
				items: [
					{
						key: 'Additional documents',
						text: formatDocumentData(lpaCaseCorrespondence)
					}
				]
			}
		]
	};
}
