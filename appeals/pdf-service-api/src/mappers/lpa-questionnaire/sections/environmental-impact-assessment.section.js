import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import {
	formatDocumentData,
	formatSentenceCase,
	formatYesNo,
	formatYesNoDetails
} from '../../../lib/nunjucks-filters/index.js';

export function environmentalImpactAssessmentSection(templateData) {
	const {
		eiaEnvironmentalImpactSchedule,
		eiaColumnTwoThreshold,
		eiaRequiresEnvironmentalStatement,
		eiaDevelopmentDescription,
		eiaSensitiveAreaDetails,
		appealType
	} = templateData;

	const isS78 = appealType === APPEAL_TYPE.S78;
	const isS20 = appealType === APPEAL_TYPE.PLANNED_LISTED_BUILDING;

	if (!isS78 && !isS20) return;

	const {
		eiaEnvironmentalStatement,
		eiaScreeningOpinion,
		eiaScreeningDirection,
		eiaScopingOpinion
	} = templateData.documents || {};

	return {
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
				key: 'Scoping opinion documents',
				html: formatDocumentData(eiaScopingOpinion)
			},
			{
				key: 'Description of development',
				text: formatSentenceCase(eiaDevelopmentDescription)
			},
			{
				key: 'Is the development in, partly in, or likely to affect a sensitive area?',
				html: formatYesNoDetails(eiaSensitiveAreaDetails)
			}
		]
	};
}
