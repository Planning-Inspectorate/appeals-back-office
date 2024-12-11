import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapReasonForNeighbourVisits = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'neighbouring-site-access',
		text: 'Inspector needs neighbouring site access',
		value:
			(lpaQuestionnaireData.reasonForNeighbourVisits &&
				lpaQuestionnaireData.reasonForNeighbourVisits?.length > 0) ||
			false,
		valueDetails: lpaQuestionnaireData.reasonForNeighbourVisits,
		defaultText: 'No answer provided',
		link: `${currentRoute}/neighbouring-site-access/change`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		classes: 'lpa-neighbouring-site-access',
		withShowMore: true,
		showMoreLabelText: 'Inspector needs neighbouring site access details'
	});
