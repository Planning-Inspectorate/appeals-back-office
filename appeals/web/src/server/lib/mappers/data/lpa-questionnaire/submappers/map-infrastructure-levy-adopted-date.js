import { dateSummaryListItem } from '#lib/mappers/components/instructions/date.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapInfrastructureLevyAdoptedDate = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	dateSummaryListItem({
		id: 'infrastructure-levy-adopted-date',
		text: 'Levy adoption date',
		value: lpaQuestionnaireData.infrastructureLevyAdoptedDate,
		defaultText: 'Not applicable',
		addCyAttribute: true,
		link: `${currentRoute}/infrastructure-levy-adopted-date/change`,
		editable: userHasUpdateCase
	});
