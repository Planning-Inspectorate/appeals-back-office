import * as displayPageFormatter from '#lib/display-page-formatter.js';
/** @type {import('../../lpa-questionnaire/mapper.js').SubMapper} */

export const mapLpaNeighbouringSitesLpaqAdapter = (params) =>
	// @ts-expect-error
	mapLpaNeighbouringSites({
		appealDetails: params.appealDetails,
		currentRoute: params.currentRoute,
		userHasUpdateCasePermission: params.userHasUpdateCase
	});

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaNeighbouringSites = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => ({
	id: 'neighbouring-sites-lpa',
	display: {
		summaryListItem: {
			key: {
				text: 'Address of the neighbour’s land or property'
			},
			value: {
				html:
					appealDetails.neighbouringSites && appealDetails.neighbouringSites.length > 0
						? displayPageFormatter.formatListOfAddresses(
								appealDetails.neighbouringSites.filter((site) => site.source === 'lpa')
							)
						: 'None'
			},
			actions: {
				items: [
					...(appealDetails.neighbouringSites &&
					appealDetails.neighbouringSites.length > 0 &&
					userHasUpdateCasePermission
						? [
								{
									text: 'Manage',
									href: `${currentRoute}/neighbouring-sites/manage`,
									visuallyHiddenText: 'Neighbouring sites (L P A)'
								}
							]
						: []),
					...(userHasUpdateCasePermission
						? [
								{
									text: 'Add',
									href: `${currentRoute}/neighbouring-sites/add/lpa`,
									visuallyHiddenText: 'Neighbouring sites (LPA)',
									attributes: { 'data-cy': 'add-neighbouring-site-lpa' }
								}
							]
						: [])
				]
			},
			classes: 'appeal-neighbouring-sites-inspector'
		}
	}
});
