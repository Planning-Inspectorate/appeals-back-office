import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapIsInfrastructureLevyFormallyAdopted = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'is-infrastructure-levy-formally-adopted',
		text: 'Is the community infrastructure levy formally adopted?',
		value: lpaQuestionnaireData.isInfrastructureLevyFormallyAdopted,
		defaultText: 'Not applicable',
		addCyAttribute: true,
		link: `${currentRoute}/is-infrastructure-levy-formally-adopted/change`,
		editable: userHasUpdateCase
	});
