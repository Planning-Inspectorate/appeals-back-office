import { textSummaryListItem } from '#lib/mappers/index.js';
import { capitalizeFirstLetter, snakeCaseToSpaceSeparated } from '#lib/string-utilities.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaEnvironmentalImpactSchedule = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'eia-environmental-impact-schedule',
		text: 'What is the development category?',
		value: capitalizeFirstLetter(
			snakeCaseToSpaceSeparated(lpaQuestionnaireData.eiaEnvironmentalImpactSchedule || 'Other')
		),
		link: `${currentRoute}/eia-environmental-impact-schedule/change`,
		editable: userHasUpdateCase
	});
