import { permissionNames } from '#environment/permissions.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { userHasPermission } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapInspectorNeighbouringSites = ({ appealDetails, currentRoute, session }) => ({
	id: 'neighbouring-sites-inspector',
	display: {
		summaryListItem: {
			key: {
				text: 'Neighbouring sites (inspector and/or third party request)'
			},
			value: {
				html:
					appealDetails.neighbouringSites && appealDetails.neighbouringSites.length > 0
						? displayPageFormatter.formatListOfAddresses(
								appealDetails.neighbouringSites.filter((site) => site.source === 'back-office')
						  )
						: 'None'
			},
			actions: {
				items: [
					...(appealDetails.neighbouringSites &&
					appealDetails.neighbouringSites.length > 0 &&
					userHasPermission(permissionNames.updateCase, session)
						? [
								{
									text: 'Manage',
									href: `${currentRoute}/neighbouring-sites/manage`,
									visuallyHiddenText: 'Neighbouring sites (inspector and or third party request)',
									attributes: { 'data-cy': 'manage-neighbouring-sites-inspector' }
								}
						  ]
						: []),
					...(userHasPermission(permissionNames.updateCase, session)
						? [
								{
									text: 'Add',
									href: `${currentRoute}/neighbouring-sites/add/back-office`,
									visuallyHiddenText: 'Neighbouring sites (inspector and or third party request)',
									attributes: { 'data-cy': 'add-neighbouring-sites-inspector' }
								}
						  ]
						: [])
				]
			},
			classes: 'appeal-neighbouring-sites-inspector'
		}
	}
});