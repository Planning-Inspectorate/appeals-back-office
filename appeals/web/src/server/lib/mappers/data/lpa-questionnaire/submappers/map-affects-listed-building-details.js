import { permissionNames } from '#environment/permissions.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { mapActionComponent } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAffectsListedBuildingDetails = ({
	lpaQuestionnaireData,
	currentRoute,
	session
}) => ({
	id: 'affects-listed-building-details',
	display: {
		summaryListItem: {
			key: {
				text: 'Does the development affect the setting of listed buildings?'
			},
			value: lpaQuestionnaireData.listedBuildingDetails?.some(
				(lb) => lb.listEntry && lb.affectsListedBuilding
			)
				? {
						html: displayPageFormatter.formatListOfListedBuildingNumbers(
							lpaQuestionnaireData.listedBuildingDetails.filter((lb) => lb.affectsListedBuilding) ||
								[]
						)
					}
				: { text: 'No' },
			actions: {
				items: [
					...(lpaQuestionnaireData.listedBuildingDetails?.length
						? [
								mapActionComponent(permissionNames.updateCase, session, {
									text: 'Change',
									href: `${currentRoute}/affected-listed-buildings/manage`,
									visuallyHiddenText: 'affected listed building',
									attributes: { 'lpaQuestionnaireData-cy': 'manage-affected-listed-building' }
								})
							]
						: []),
					mapActionComponent(permissionNames.updateCase, session, {
						text: 'Add',
						visuallyHiddenText: 'affected listed building',
						href: `${currentRoute}/affected-listed-buildings/add`,
						attributes: { 'lpaQuestionnaireData-cy': 'add-affected-listed-building' }
					})
				]
			}
		}
	}
});
