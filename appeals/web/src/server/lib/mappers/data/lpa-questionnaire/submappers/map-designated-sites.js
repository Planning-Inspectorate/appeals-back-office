import { listSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapInNearOrLikelyToAffectDesignatedSites = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	listSummaryListItem({
		id: 'in-near-or-likely-to-affect-designated-sites',
		text: 'In, near or likely to affect designated sites',
		value: lpaQuestionnaireData?.designatedSiteNames?.length
			? lpaQuestionnaireData?.designatedSiteNames?.map((designatedSite) =>
					designatedSite.key === 'custom' ? `Other: ${designatedSite.name}` : designatedSite.name
			  )
			: ['Not applicable'],
		link: `${currentRoute}/in-near-or-likely-to-affect-designated-sites/change`,
		editable: userHasUpdateCase
	});
