import { listSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapInNearOrLikelyToAffectDesignatedSites = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	listSummaryListItem({
		id: 'in-near-or-likely-to-affect-designated-sites',
		text: 'Is the development in, near or likely to affect any designated sites?',
		value: (() => {
			if (!lpaQuestionnaireData?.designatedSiteNames?.length) {
				return [];
			}

			return lpaQuestionnaireData.designatedSiteNames.map((site) =>
				site.key === 'custom' ? `Other: ${site.name}` : site.name
			);
		})(),
		prefaceText: lpaQuestionnaireData?.designatedSiteNames?.length ? 'Yes' : 'No',
		link: `${currentRoute}/in-near-or-likely-to-affect-designated-sites/change`,
		editable: userHasUpdateCase
	});
