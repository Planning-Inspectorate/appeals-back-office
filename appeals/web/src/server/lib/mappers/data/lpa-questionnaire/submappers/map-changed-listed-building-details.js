import { permissionNames } from '#environment/permissions.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { mapActionComponent } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapChangedListedBuildingDetails = ({
	lpaQuestionnaireData,
	currentRoute,
	session
}) => ({
	id: 'affected-listed-building-details',
	display: {
		summaryListItem: {
			key: {
				text: 'Does the development change a listed building?'
			},
			value: lpaQuestionnaireData.listedBuildingDetails?.some(
				(lb) => lb.listEntry && !lb.affectsListedBuilding
			)
				? {
						html: displayPageFormatter.formatListOfListedBuildingNumbers(
							lpaQuestionnaireData.listedBuildingDetails.filter(
								(lb) => !lb.affectsListedBuilding
							) || []
						)
					}
				: { text: 'No' },
			actions: {
				items: [
					...(lpaQuestionnaireData.listedBuildingDetails?.filter((lb) => !lb.affectsListedBuilding)
						.length
						? [
								mapActionComponent(permissionNames.updateCase, session, {
									text: 'Change',
									href: `${currentRoute}/changed-listed-buildings/manage`,
									visuallyHiddenText: 'changed listed building',
									attributes: { 'lpaQuestionnaireData-cy': 'manage--listed-building' }
								})
							]
						: []),
					mapActionComponent(permissionNames.updateCase, session, {
						text: 'Add',
						visuallyHiddenText: 'changed listed building',
						href: `${currentRoute}/changed-listed-buildings/add`,
						attributes: { 'lpaQuestionnaireData-cy': 'add-changed-listed-building' }
					})
				]
			}
		}
	}
});
