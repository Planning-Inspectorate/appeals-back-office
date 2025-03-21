import { dateSummaryListItem } from '#lib/mappers/components/instructions/date.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapInfrastructureLevyExpectedDate = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	dateSummaryListItem({
		id: 'infrastructure-levy-expected-date',
		text: 'When do you expect to formally adopt the community infrastructure levy?',
		value: lpaQuestionnaireData.infrastructureLevyExpectedDate,
		defaultText: 'Not applicable',
		addCyAttribute: true,
		link: `${currentRoute}/infrastructure-levy-expected-date/change`,
		editable: userHasUpdateCase
	});
