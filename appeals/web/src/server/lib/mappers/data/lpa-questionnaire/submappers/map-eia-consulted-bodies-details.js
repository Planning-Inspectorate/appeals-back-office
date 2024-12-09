import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaConsultedBodiesDetails = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'eia-consulted-bodies-details',
		text: 'Consulted relevant statutory consultees',
		value:
			(lpaQuestionnaireData.eiaConsultedBodiesDetails &&
				lpaQuestionnaireData.eiaConsultedBodiesDetails?.length > 0) ||
			false,
		valueDetails: lpaQuestionnaireData.eiaConsultedBodiesDetails,
		defaultText: 'No answer provided',
		link: `${currentRoute}/environmental-impact-assessment/consulted-bodies-details/change`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		classes: 'lpa-eia-consulted-bodies-details',
		withShowMore: true,
		showMoreLabelText: 'Consulted relevant statutory consultees details'
	});
