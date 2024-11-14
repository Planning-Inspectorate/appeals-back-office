import { textSummaryListItem } from '#lib/mappers/index.js';
import { snakeCaseToSpaceSeparated, capitalizeFirstLetter } from '#lib/string-utilities.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaDevelopmentDescription = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'eia-development-description',
		text: 'Development description',
		value: capitalizeFirstLetter(
			snakeCaseToSpaceSeparated(lpaQuestionnaireData.eiaDevelopmentDescription || '')
		),
		link: `${currentRoute}/eia-development-description/change`,
		editable: userHasUpdateCase
	});
