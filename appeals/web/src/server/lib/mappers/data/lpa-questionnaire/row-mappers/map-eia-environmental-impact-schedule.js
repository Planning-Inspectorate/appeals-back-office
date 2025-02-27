import { textSummaryListItem } from '#lib/mappers/index.js';
import { snakeCaseToSpaceSeparated, capitalizeFirstLetter } from '#lib/string-utilities.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapEiaEnvironmentalImpactSchedule = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'eia-environmental-impact-schedule',
		text: 'Schedule 1 or 2 development',
		value: capitalizeFirstLetter(
			snakeCaseToSpaceSeparated(lpaQuestionnaireData.eiaEnvironmentalImpactSchedule || 'Other')
		),
		link: `${currentRoute}/eia-environmental-impact-schedule/change`,
		editable: userHasUpdateCase
	});
