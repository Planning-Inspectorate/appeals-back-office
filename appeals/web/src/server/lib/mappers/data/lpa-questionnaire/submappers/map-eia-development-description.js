import { eiaDescriptions } from '#appeals/appeal-details/lpa-questionnaire/environmental-impact-assessment/eia-development-description/eia-development-description.mapper.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaDevelopmentDescription = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'eia-development-description',
		text: 'Description of development',
		value: lpaQuestionnaireData.eiaDevelopmentDescription
			? eiaDescriptions[lpaQuestionnaireData.eiaDevelopmentDescription]
			: 'Not applicable',
		link: `${currentRoute}/eia-development-description/change`,
		editable: userHasUpdateCase
	});
