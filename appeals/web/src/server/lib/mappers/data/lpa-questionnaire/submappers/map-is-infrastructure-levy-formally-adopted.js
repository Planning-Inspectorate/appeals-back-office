import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapIsInfrastructureLevyFormallyAdopted = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'is-infrastructure-levy-formally-adopted',
		text: 'Levy formally adopted',
		value: lpaQuestionnaireData.isInfrastructureLevyFormallyAdopted,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/is-infrastructure-levy-formally-adopted/change`,
		editable: userHasUpdateCase
	});
