import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaConsultedBodiesDetails = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'eia-consulted-bodies-details',
		text: 'Did you consult all the relevant statutory consultees about the development?',
		value: (lpaQuestionnaireData.consultedBodiesDetails?.length ?? 0) > 0,
		valueDetails: lpaQuestionnaireData.consultedBodiesDetails,
		defaultText: 'No answer provided',
		link: `${currentRoute}/environmental-impact-assessment/consulted-bodies-details/change`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		classes: 'lpa-eia-consulted-bodies-details',
		withShowMore: true,
		showMoreLabelText: 'Consulted relevant statutory consultees details'
	});
